// src/feature/monitoring/page/SlotDashboard.tsx
import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  CircularProgress,
  Divider,
  Button,
} from "@mui/material";
import ArrowBackIcon from "../../../assets/icons/arrow-back.svg?react";
import BoxIcon from "../../../assets/icons/box.svg?react";
import InboxIcon from "../../../assets/icons/inbox.svg?react";
import ErrorIcon from "../../../assets/icons/error.svg?react";
import CheckIcon from "../../../assets/icons/checkmark.svg?react";
import { supabase } from "../../../supabaseClient";
import {
  useMqtt,
  makeCommandTopic,
  makeStatusTopic,
  makeWarningTopic,
} from "../../../hooks/useMqtt";
import { useCapacity } from "../../../../src/hooks/useCapacity";

/** ---------- Types ---------- */
type SlotRow = {
  slot_id: string;
  cupboard_id: string;
  connection_status: "online" | "offline" | "unknown";
  capacity_mm: number | null;
  capacity_percent: number | null;
  is_open?: boolean;
  wifi_status?: "connected" | "disconnected" | "unknown";
  wifi_rssi?: number | null;
  ip_addr?: string | null;
  last_sensor_at?: string | null;
  last_seen_at?: string | null;
  sensor_error?: boolean; // ✅ เพิ่มไว้โชว์ error ที่วงกลม
};

type LoginLog = {
  id: string | number;
  name: string;
  date: string;
  time: string;
  description: string;
};

type ActivationLog = {
  id: string | number;
  name: string;
  date: string;
  time: string;
  description: string;
};

/** ---------- Globals / Helpers (no UI changes) ---------- */
// throttle map per-slot
const __lastSyncMap: Record<string, number> = {};

// single source for sensor range & guards
const SENSOR_MAX_MM = 205;
const NOISE_MM = 1;
//const RETAINED_GUARD_MS = 80;

// UI connection union
type UIConn = "online" | "offline" | "unknown";

// map DB -> UI
function normalizeUiConnFromDb(v: any): UIConn {
  const s = String(v ?? "").trim().toLowerCase();
  if (s === "active" || s === "online" || s === "connected") return "online";
  if (s === "inactive" || s === "offline" || s === "disconnected") return "offline";
  return "unknown";
}

// parse various truthy/falsy/strings to UI connection
export function parseConnectionStatus(v: any): UIConn {
  const s = String(v).trim().toLowerCase();
  if (v === true || s === "true" || v === 1 || s === "1" || s === "active" || s === "online" || s === "connected")
    return "online";
  if (v === false || s === "false" || v === 0 || s === "0" || s === "inactive" || s === "offline" || s === "disconnected")
    return "offline";
  return "unknown";
}

// UI -> DB
function toDBConn(s: "online" | "offline" | "unknown"): "active" | "inactive" | null {
  if (s === "online") return "active";
  if (s === "offline") return "inactive";
  return null;
}

function parseIsOpen(v: any): boolean | null {
  if (v === true) return true;
  if (v === false) return false;
  if (typeof v === "number") return v === 1 ? true : v === 0 ? false : null;
  if (typeof v === "string") {
    const s = v.trim().toLowerCase();
    if (["1", "true", "open", "opened", "unlock"].includes(s)) return true;
    if (["0", "false", "closed", "close", "lock"].includes(s)) return false;
  }
  return null;
}

function fromDBConn(v: any): UIConn {
  const s = String(v ?? "").trim().toLowerCase();
  if (s === "active") return "online";
  if (s === "inactive") return "offline";
  return "unknown";
}

// guard
export function isConnString(v: any): v is "online" | "offline" | "unknown" {
  return v === "online" || v === "offline" || v === "unknown";
}

// DB sync (keeps raw mm as true raw; no fallback)
async function syncSlotStateToDB(
  slotId: string,
  patch: Partial<SlotRow> & { capacity_mm_raw?: number },
  opts?: { force?: boolean }
) {
  const now = Date.now();


  try {
    const capacityInt =
      typeof patch.capacity_mm === "number"
        ? Math.max(0, Math.min(SENSOR_MAX_MM, Math.round(patch.capacity_mm)))
        : undefined;

    const body: any = {
      is_open: typeof patch.is_open === "boolean" ? patch.is_open : undefined,
      capacity_mm: capacityInt,
      capacity_mm_raw: typeof patch.capacity_mm_raw === "number" ? patch.capacity_mm_raw : undefined,
      ...(isConnString(patch.connection_status)
        ? { connection_status: toDBConn(patch.connection_status) }
        : {}),
      wifi_status: patch.wifi_status,
      wifi_rssi: typeof patch.wifi_rssi === "number" ? patch.wifi_rssi : undefined,
      ip_addr: patch.ip_addr ?? undefined,
      last_seen_at: patch.last_seen_at ?? undefined,
    };

    Object.keys(body).forEach((k) => body[k] === undefined && delete body[k]);
    if (Object.keys(body).length === 0) return;

    const { data, error } = await supabase
      .from("slots")
      .update(body)
      .eq("slot_id", slotId)
      .select("slot_id, capacity_mm, capacity_mm_raw")
      .maybeSingle();

    if (error) {
      console.error("[DB] UPDATE slots error:", error, { slotId, body });
      return;
    }

    if (!data) {
      const { data: up, error: upErr } = await supabase
        .from("slots")
        .upsert({ slot_id: slotId, ...body }, { onConflict: "slot_id" })
        .select("slot_id, capacity_mm, capacity_mm_raw")
        .maybeSingle();

      if (upErr) {
        console.error("[DB] UPSERT slots error:", upErr, { slotId, body });
        return;
      }
      console.log("[DB] UPSERT slots ok:", up);
    } else {
      console.log("[DB] UPDATE slots ok:", data);
    }
  } catch (e) {
    console.error("[DB] UPDATE slots exception:", e, { slotId, patch });
  }
}


function pickDisplayName(row: any): string | null {
  if (!row) return null;
  if (typeof row.display_name === "string" && row.display_name.trim()) return row.display_name.trim();
  if (typeof row.name_eng === "string" && row.name_eng.trim()) return row.name_eng.trim();
  if (typeof row.name_en === "string" && row.name_en.trim()) return row.name_en.trim();
  if (typeof row.full_name === "string" && row.full_name.trim()) return row.full_name.trim();

  const th = [row.title_th, row.first_name_th, row.last_name_th].filter((v) => typeof v === "string" && v.trim()).join(" ").trim();
  if (th) return th;

  if (typeof row.name_th === "string" && row.name_th.trim()) return row.name_th.trim();

  const en = [row.title_en, row.first_name_en, row.last_name_en].filter((v) => typeof v === "string" && v.trim()).join(" ").trim();
  if (en) return en;

  return null;
}


function pad2(n: number) { return n.toString().padStart(2, "0"); }
function toLocalDateTimeParts(iso?: string | null) {
  if (!iso) return { date: "—", time: "—" };
  const d = new Date(iso);
  const yyyy = d.getFullYear();
  const mm = pad2(d.getMonth() + 1);
  const dd = pad2(d.getDate());
  const hh = pad2(d.getHours());
  const mi = pad2(d.getMinutes());
  return { date: `${yyyy}-${mm}-${dd}`, time: `${hh}:${mi}` };
}

/** ---------- Component ---------- */
export default function SlotDashboard() {
  const { slotId } = useParams<{ slotId: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const [slot, setSlot] = useState<SlotRow | null>(null);
  const [loginHistory, setLoginHistory] = useState<LoginLog[]>([]);
  const [activationHistory, setActivationHistory] = useState<ActivationLog[]>([]);

  // OPEN (unlock) flow
  const [sendingOpen, setSendingOpen] = useState(false);
  const [awaitingClose, setAwaitingClose] = useState(false);

  const isOpen = slot?.is_open ?? false;
  const usageText = isOpen ? "Opened" : "Closed";

  // from previous route state
  const fromState = location.state as
    | Partial<{
      slotId: string;
      nodeId: string;
      connectionStatus: SlotRow["connection_status"];
      wifiStatus: SlotRow["wifi_status"];
      capacity: number;
    }>
    | undefined;

  const nodeId = slot?.cupboard_id || fromState?.nodeId;

  const [warning, setWarning] = useState<{ code?: string; message?: string; ts?: number } | null>(null);
  const [assignedTeacherName, setAssignedTeacherName] = useState<string | null>(null);

  // topics (status + warning) for both /slot/ and /slot_id/
  const statusTopic = nodeId && slotId ? makeStatusTopic(nodeId, slotId) : null;   // (kept for future)
  const warningTopic = nodeId && slotId ? makeWarningTopic(nodeId, slotId) : null; // (kept for future)
  const commandOpenTopic = nodeId && slotId ? makeCommandTopic(nodeId, slotId, "door") : null;

  const topics =
    nodeId && slotId
      ? [
        `smartlocker/${nodeId}/slot/${slotId}/status`,
        `smartlocker/${nodeId}/slot_id/${slotId}/status`,
        // `smartlocker/${nodeId}/slot/${slotId}/warning`,
        // `smartlocker/${nodeId}/slot_id/${slotId}/warning`,
      ]
      : [];

  const { status: mqttStatus, onMessage, publish } = useMqtt(topics, { ignoreFirstRetained: true });

  // ref to mark first capacity save per slot (hook must be inside component)
  const capFirstSavedRef = useRef<Record<string, boolean>>({});
  async function buildUserNameMap(userIds: string[]): Promise<Record<string, string>> {
    const map: Record<string, string> = {};
    const ids = Array.from(new Set(userIds.filter(Boolean)));
    if (ids.length === 0) return map;

    // 2.1 จากตาราง teachers โดยจับคู่ user_id
    try {
      const { data } = await supabase
        .from("teachers")
        .select("user_id, id, display_name, name_eng, name_th, title_th, first_name_th, last_name_th, title_en, first_name_en, last_name_en")
        .in("user_id", ids);

      (data ?? []).forEach((r: any) => {
        const name = pickDisplayName(r);
        if (r?.user_id && name) map[r.user_id] = name;
      });
    } catch { }

    // 2.2 เผื่อบางระบบใช้ by_user == teachers.id
    const missing1 = ids.filter((id) => !map[id]);
    if (missing1.length) {
      try {
        const { data } = await supabase
          .from("teachers")
          .select("user_id, id, display_name, name_eng, name_th, title_th, first_name_th, last_name_th, title_en, first_name_en, last_name_en")
          .in("id", missing1);

        (data ?? []).forEach((r: any) => {
          const name = pickDisplayName(r);
          if (r?.id && name) map[r.id] = name;
          if (r?.user_id && name && !map[r.user_id]) map[r.user_id] = name;
        });
      } catch { }
    }

    // 2.3 ลอง users/profiles (แล้วแต่คุณตั้งชื่อ)
    const stillMissing = ids.filter((id) => !map[id]);
    if (stillMissing.length) {
      // ลอง users ก่อน
      try {
        const { data } = await supabase
          .from("users")
          .select("id, name_eng, name_th, full_name, display_name")
          .in("id", stillMissing);

        (data ?? []).forEach((r: any) => {
          const name = pickDisplayName(r);
          if (r?.id && name) map[r.id] = name;
        });
      } catch { }

      // เผื่อใช้ profiles แทน
      const stillMissing2 = ids.filter((id) => !map[id]);
      if (stillMissing2.length) {
        try {
          const { data } = await supabase
            .from("profiles")
            .select("id, name_eng, name_th, full_name, display_name, first_name, last_name")
            .in("id", stillMissing2);

          (data ?? []).forEach((r: any) => {
            const name =
              pickDisplayName(r) ||
              [r.first_name, r.last_name].filter(Boolean).join(" ").trim() ||
              null;
            if (r?.id && name) map[r.id] = name;
          });
        } catch { }
      }
    }

    return map;
  }
  async function fetchAssignedTeacherName(slotId: string): Promise<string | null> {
    // 3.1 ลองจาก v_slots ก่อน (เผื่อ view รวมชื่อมาให้แล้ว)
    try {
      const { data, error } = await supabase
        .from("v_slots")
        .select("slot_id, teacher_id, teacher_name, teacher_display_name")
        .eq("slot_id", slotId)
        .maybeSingle();

      if (!error && data) {
        const name =
          pickDisplayName({
            display_name: (data as any).teacher_display_name ?? (data as any).teacher_name
          }) ||
          (typeof (data as any).teacher_name === "string" ? (data as any).teacher_name : null);
        if (name) return name;
        // ถ้า view มี teacher_id แต่ไม่มีชื่อ ค่อยไปตาราง teachers ต่อ
        if ((data as any).teacher_id) {
          const { data: t } = await supabase
            .from("teachers")
            .select("id, display_name, name_eng, name_th, title_th, first_name_th, last_name_th, title_en, first_name_en, last_name_en")
            .eq("id", (data as any).teacher_id)
            .maybeSingle();
          const n2 = pickDisplayName(t);
          if (n2) return n2;
        }
      }
    } catch { }

    // 3.2 ลอง slots ที่ทำ relational select ไป teachers (ถ้าตั้ง FK/relationship ไว้ใน Supabase)
    try {
      const { data } = await supabase
        .from("slots")
        .select(`
        slot_id,
        teacher_id,
        teacher:teachers(id, display_name, name_eng, name_th, title_th, first_name_th, last_name_th, title_en, first_name_en, last_name_en)
      `)
        .eq("slot_id", slotId)
        .maybeSingle();

      const n = pickDisplayName((data as any)?.teacher);
      if (n) return n;

      // 3.3 ถ้าไม่มีความสัมพันธ์ ใช้ teacher_id แล้วค่อยไปหาเอง
      if ((data as any)?.teacher_id) {
        const { data: t } = await supabase
          .from("teachers")
          .select("id, display_name, name_eng, name_th, title_th, first_name_th, last_name_th, title_en, first_name_en, last_name_en")
          .eq("id", (data as any).teacher_id)
          .maybeSingle();
        const n2 = pickDisplayName(t);
        if (n2) return n2;
      }
    } catch { }

    return null;
  }

  async function loadActivationHistory(currentSlotId: string) {
  try {
    const { data, error } = await supabase
      .from("activation_logs")
      .select("id, slot_id, action, cause, by_user, created_at, metadata")
      .eq("slot_id", currentSlotId)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) throw error;

    const teacherName = assignedTeacherName ?? (await fetchAssignedTeacherName(currentSlotId)) ?? "System";

    const rows: ActivationLog[] = (data ?? []).map((r: any) => {
      const meta = r?.metadata ?? {};
      const via = meta.via ? ` • via ${meta.via}` : "";
      const cmd = meta.cmd_id ? ` • cmd:${String(meta.cmd_id).slice(0, 8)}…` : "";
      const cause = r.cause && r.cause !== "manual" ? ` (${r.cause})` : "";
      const description = `${String(r.action || "").toUpperCase()}${cause}${via}${cmd}`;
      const { date, time } = toLocalDateTimeParts(r.created_at);

      return {
        id: r.id,
        name: teacherName,  // ✅ ใช้อาจารย์ประจำช่อง
        date,
        time,
        description,
      };
    });

    setActivationHistory(rows);
  } catch (e) {
    console.error("loadActivationHistory error:", e);
    setActivationHistory([]);
  }
}


  async function refreshPercentFromView(id: string) {
    const { data, error } = await supabase
      .from("v_slots")
      .select("capacity_percent")
      .eq("slot_id", id)
      .maybeSingle();
    if (!error && data) {
      setSlot((prev) => (prev ? { ...prev, capacity_percent: data.capacity_percent } : prev));
    }
  }

  // extract capacity (raw mm & percent) from diverse payload shapes
  function extractCapacity(
    payload: any,
    maxMm = SENSOR_MAX_MM
  ): { mm?: number; percent?: number; rawMm?: number; oor?: boolean } {
    let rawMm: number | undefined;

    if (typeof payload === "number" && Number.isFinite(payload)) {
      rawMm = payload;
    } else if (typeof payload === "string") {
      const s = payload.trim();
      const mPct = s.match(/^(\d+(?:\.\d+)?)\s*%$/i);
      const mMm = s.match(/^(\d+(?:\.\d+)?)\s*mm$/i);
      if (mPct) {
        const p = Math.max(0, Math.min(100, Math.round(parseFloat(mPct[1]))));
        return { percent: p };
      }
      if (mMm) {
        rawMm = parseFloat(mMm[1]);
      } else {
        const n = Number(s.replace(",", "."));
        if (Number.isFinite(n)) rawMm = n;
      }
    } else if (typeof payload?.capacity_mm_raw === "number") {
      rawMm = payload.capacity_mm_raw;
    } else if (typeof payload?.capacity_mm === "number") {
      rawMm = payload.capacity_mm;
    } else if (typeof payload?.cap_mm_raw === "number") {
      rawMm = payload.cap_mm_raw;
    } else if (payload?.capacity && typeof payload.capacity.mm === "number") {
      rawMm = payload.capacity.mm;
    } else if (
      payload?.capacity &&
      typeof payload.capacity.value === "number" &&
      String(payload.capacity.unit ?? "").toLowerCase() === "mm"
    ) {
      rawMm = payload.capacity.value;
    }

    let percent: number | undefined;
    if (typeof payload?.capacity_percent === "number") percent = payload.capacity_percent;
    else if (typeof payload?.capacity_pct === "number") percent = payload.capacity_pct;
    else if (typeof payload?.capacity?.percent === "number") percent = payload.capacity.percent;
    else if (typeof payload?.capacity === "number" && payload.capacity >= 0 && payload.capacity <= 100) percent = payload.capacity;

    let mm: number | undefined;
    if (typeof rawMm === "number") {
      mm = Math.max(0, Math.min(maxMm, Math.round(rawMm)));
    } else if (typeof percent === "number" && Number.isFinite(percent)) {
      mm = Math.max(0, Math.min(maxMm, Math.round((percent / 100) * maxMm)));
    }

    if (typeof percent === "number") {
      percent = Math.max(0, Math.min(100, Math.round(percent)));
    }

    const oor = typeof rawMm === "number" && (rawMm < 0 || rawMm > maxMm);
    return { mm, percent, rawMm, oor };
  }

  // Handle MQTT
  useEffect(() => {
    if (!topics.length) return;

    const lastApplyRef = { current: 0 };

    const off = onMessage(
      (topic, payload) => {
        // STATUS
        if (topic.endsWith("/status")) {
          const now = Date.now();
          // if (now - lastApplyRef.current < RETAINED_GUARD_MS) return;
          lastApplyRef.current = now;

          setSlot((prev) => {
            const base: SlotRow =
              prev ?? {
                slot_id: slotId!,
                cupboard_id: nodeId!,
                connection_status: "unknown",
                capacity_mm: null,
                capacity_percent: null,
                is_open: false,
                wifi_status: "unknown",
                wifi_rssi: null,
                ip_addr: null,
                last_sensor_at: null,
                last_seen_at: null,

              };

            const hasCapInPayload =
              typeof payload === "number" ||
              typeof payload === "string" ||
              ("capacity_mm" in (payload ?? {})) ||
              ("capacity_mm_raw" in (payload ?? {})) ||
              ("capacity_percent" in (payload ?? {})) ||
              ("capacity_pct" in (payload ?? {})) ||
              ("capacity" in (payload ?? {}));

            const cap = hasCapInPayload ? extractCapacity(payload, SENSOR_MAX_MM) : {};
            const nextMm = hasCapInPayload ? (cap.mm ?? base.capacity_mm) : base.capacity_mm;
            const nextPercent = hasCapInPayload ? (cap.percent ?? base.capacity_percent) : base.capacity_percent;

            // ts supports seconds or milliseconds
            // ts supports seconds or milliseconds
            let tsIso: string | null = base.last_seen_at ?? null;

            const rawTs = (payload as any)?.ts;
            if (rawTs != null) {
              const t = Number(rawTs);
              if (Number.isFinite(t)) {
                const ms = t < 1e12 ? t * 1000 : t;
                tsIso = new Date(ms).toISOString();
              }
            }

            const next: SlotRow = {
              ...base,
              cupboard_id: payload?.cupboard_id ?? base.cupboard_id,
              is_open: parseIsOpen(payload?.is_open) ?? base.is_open,
              capacity_mm: cap.oor ? null : (nextMm ?? null),
              capacity_percent: cap.oor ? null : (nextPercent ?? null),
              sensor_error: !!cap.oor,
              wifi_status: payload?.wifi_status ?? base.wifi_status,
              wifi_rssi: typeof payload?.wifi_rssi === "number" ? payload.wifi_rssi : base.wifi_rssi,
              ip_addr: payload?.ip_addr ?? base.ip_addr,
              last_seen_at: tsIso,
              connection_status: parseConnectionStatus(payload?.connection_status ?? payload?.status),
            };

            // UI button state
            if (next.is_open) {
              setSendingOpen(false);
              setAwaitingClose(true);
            } else {
              setAwaitingClose(false);
            }

            // Decide to write DB
            const doorChanged = base.is_open !== next.is_open;
            const connChanged = base.connection_status !== next.connection_status;

            const hasNextCap = typeof next.capacity_mm === "number" && Number.isFinite(next.capacity_mm);
            const hasBaseCap = typeof base.capacity_mm === "number" && Number.isFinite(base.capacity_mm);
            const capChanged =
              hasCapInPayload && hasNextCap && hasBaseCap
                ? Math.abs(next.capacity_mm! - base.capacity_mm!) >= NOISE_MM
                : false;

            const shouldSaveCapacityFirstTime =
              hasCapInPayload && hasNextCap && !hasBaseCap && !capFirstSavedRef.current[next.slot_id];

            if (doorChanged || connChanged || capChanged || shouldSaveCapacityFirstTime) {
              const patch: Partial<SlotRow> & { capacity_mm_raw?: number } = {};
              if (doorChanged) patch.is_open = next.is_open;
              if (connChanged) patch.connection_status = next.connection_status;

              if (hasCapInPayload && (capChanged || shouldSaveCapacityFirstTime)) {
                patch.capacity_mm = next.capacity_mm!;
                if (typeof cap.rawMm === "number") patch.capacity_mm_raw = cap.rawMm; // raw, not normalized
              }
              if (tsIso) patch.last_seen_at = tsIso;

              console.log("[DB][willUpdate]", { slotId: next.slot_id, patch });
              syncSlotStateToDB(next.slot_id, patch, {
                force: doorChanged || connChanged || shouldSaveCapacityFirstTime,
              });
              // ให้ DB commit แล้วค่อยอ่าน v_slots
              //setTimeout(() => { void refreshPercentFromView(next.slot_id); }, 60);

              if (hasCapInPayload && (capChanged || shouldSaveCapacityFirstTime)) {
                capFirstSavedRef.current[next.slot_id] = true;
              }
            }

            // Reduce re-render if nothing meaningful changed
            if (
              next.is_open === base.is_open &&
              next.connection_status === base.connection_status &&
              next.capacity_mm === base.capacity_mm &&
              next.wifi_status === base.wifi_status &&
              next.wifi_rssi === base.wifi_rssi &&
              next.ip_addr === base.ip_addr &&
              next.cupboard_id === base.cupboard_id
            ) {
              return prev;
            }
            return next;
          });
        }

        // WARNING
        if (topic.endsWith("/warning")) {
          setWarning({
            code: payload?.code,
            message:
              payload?.message ??
              (typeof payload === "string" ? payload : JSON.stringify(payload)),
            ts: payload?.ts,
          });

          supabase
            .from("warnings")
            .insert({
              slot_id: slotId!,
              code: payload?.code ?? null,
              message:
                payload?.message ??
                (typeof payload === "string" ? payload : JSON.stringify(payload)),
              created_at: new Date().toISOString(),
              raw: payload ?? null,
            })
          // .then(
          //   () => { },
          //   //(err: unknown) => console.error("insert warnings error:", err)
          // );
        }
      },
      { replayLast: true }
    );

    return off;
  }, [topics.join("|"), onMessage, slotId, nodeId]);

  // initial load from view
  useEffect(() => {
    let active = true;
    async function run() {
      if (!slotId) return;
      setLoading(true);
      setErr(null);
      try {
        const { data, error } = await supabase
          .from("v_slots")
          .select("slot_id,cupboard_id,connection_status,capacity_mm,capacity_percent,is_open,last_seen_at")
          .eq("slot_id", slotId)
          .maybeSingle();

        if (error) throw error;
        if (!active) return;

        const s = data
          ? ({
            ...data,
            connection_status: normalizeUiConnFromDb((data as any).connection_status),
          } as SlotRow)
          : null;

        setSlot(s);
        if (s?.is_open === true) {
          setAwaitingClose(true);
          setSendingOpen(false);
        } else {
          setAwaitingClose(false);
          setSendingOpen(false);
        }
      } catch (e: any) {
        if (!active) return;
        console.error("slot dashboard error:", e);
        setErr(e?.message || "Failed to load data");
      } finally {
        if (active) setLoading(false);
      }
    }
    run();
    return () => {
      active = false;
    };
  }, [slotId]);

  useEffect(() => {
    if (!slotId) return;
    void loadActivationHistory(slotId);
  }, [slotId]);

  // safety: auto-release OPENING after 10s
  useEffect(() => {
    if (!sendingOpen) return;
    const t = setTimeout(() => setSendingOpen(false), 10000);
    return () => clearTimeout(t);
  }, [sendingOpen]);

  // reset on slot change
  useEffect(() => {
    setAwaitingClose(false);
    setSendingOpen(false);
  }, [slotId]);

  useEffect(() => {
    if (slot?.is_open === false && awaitingClose) setAwaitingClose(false);
  }, [slot?.is_open, awaitingClose]);

  // ✅ คิดเป็น “%ว่าง” ให้ตรงกับ All Items และ v_slots
  const freePercentFromMm =
    typeof slot?.capacity_mm === 'number'
      ? Math.max(0, Math.min(100, Math.round((slot.capacity_mm * 100) / SENSOR_MAX_MM)))
      : null;

  const freePercentFromPayload =
    typeof slot?.capacity_percent === 'number'
      ? Math.max(0, Math.min(100, Math.round(slot.capacity_percent)))
      : null;

  const resolvedFreePercent = freePercentFromPayload ?? freePercentFromMm ?? 0;

  // ถ้า useCapacity ของคุณ “ไม่” รองรับโหมด free/filled ให้ส่งเป็น %ว่างตรง ๆ
  const progress = resolvedFreePercent;
  const capacityText = `${progress}%`;

  useEffect(() => {
    if (slot?.capacity_mm == null || slot?.capacity_percent == null) return;
    const mm = Math.max(0, Math.min(SENSOR_MAX_MM, Math.round(slot.capacity_mm)));
    // ✅ เทียบเป็น “%ว่าง” ให้ตรงกัน
    const expect = Math.round((mm * 100) / SENSOR_MAX_MM);
    const diff = Math.abs((slot.capacity_percent ?? 0) - expect);
    if (diff >= 3) {
      console.warn("[capacity-mismatch]", {
        slot_id: slot.slot_id,
        mm,

        percent_from_view_free: slot.capacity_percent,
        percent_from_mm_free: expect,
        diff
      });
    }
  }, [slot?.slot_id, slot?.capacity_mm, slot?.capacity_percent]);

  // Action: OPEN (unlock)
  async function openSlot() {
    if (!slot || !nodeId || !slotId || !commandOpenTopic) return;
    if (sendingOpen || awaitingClose || slot.is_open === true) return;

    setSendingOpen(true);

    const cmdId =
      typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : `cmd_${Date.now()}_${Math.random().toString(16).slice(2)}`;

    const payload = { role: "admin", cmd_id: cmdId, slot_id: slotId, ts: Date.now() };
    console.log("[publish unlock]", { topic: commandOpenTopic, payload });
    publish(commandOpenTopic, payload);

    try {
      await supabase
        .from("activation_logs")
        .insert({
          slot_id: slot.slot_id,
          action: "unlock",
          cause: "manual",
          metadata: { via: "web-ui", cmd_id: cmdId },
        })
        .throwOnError();
    } catch (e) {
      console.error("insert activation_logs error:", e);
    }
  }

  const doorOpen = slot?.is_open === true;
  const openDisabled =
    mqttStatus === "error" ||
    mqttStatus === "idle" ||
    sendingOpen ||
    doorOpen ||
    !nodeId ||
    !slot ||
    !commandOpenTopic;

  /** ---------- UI (unchanged) ---------- */
  return (
    <Box sx={{ display: "flex", flexDirection: "column", width: "100%" }}>
      <Box sx={{ flex: 1, width: "100%" }}>
        {/* Header */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}>
          <ArrowBackIcon onClick={() => navigate(-1)} style={{ width: 28, height: 28, cursor: "pointer" }} />
          <Typography fontSize="40px" fontWeight={900} fontStyle="italic" color="#133E87">
            Monitoring
          </Typography>
        </Box>

        {/* {warning?.message && (
          <Box sx={{ mx: 2, mb: 2 }}>
            <Box
              role="alert"
              aria-live="polite"
              style={{
                border: "1px solid #F5C0C0",
                background: "#FFF5F5",
                color: "#B21B1B",
                padding: "10px 14px",
                borderRadius: 8,
                fontWeight: 600,
              }}
            >
              {warning.code ? `[${warning.code}] ` : ""}
              {warning.message}
            </Box>
          </Box>
        )} */}

        <Divider sx={{ mt: 1, mb: 3, mx: 2, borderBottomWidth: 2, borderColor: "#CBDCEB" }} />

        {/* Slot name */}
        <Box mt={1} mb={2} display="flex" justifyContent="center">
          <Typography variant="h5" fontWeight={800} color="#133E87">
            {`Slot ${slotId ?? ""}`}
          </Typography>
        </Box>

        {loading ? (
          <Box display="flex" alignItems="center" gap={1} py={3}>
            <CircularProgress size={20} />
            <Typography color="text.secondary" fontStyle="italic">
              Loading...
            </Typography>
          </Box>
        ) : err ? (
          <Typography color="error" fontStyle="italic" py={2}>
            {err}
          </Typography>
        ) : (
          <>
            {/* แถวบน: Usage / Sensor */}
            <Grid container spacing={4} mb={3} sx={{ px: { xs: 0, md: 10 } }}>
              <Grid item xs={12} md={8}>
                <Card sx={{ borderRadius: 15, border: "1px solid #D6E4EF" }}>
                  <CardContent
                    sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", py: 2.5 }}
                  >
                    <Box display="flex" alignItems="center" gap={2}>
                      <Box
                        sx={{
                          width: 55,
                          height: 55,
                          borderRadius: "50%",
                          background: isOpen ? "#ffffff" : "#D6E4EF",
                          display: "grid",
                          placeItems: "center",
                        }}
                      >
                        <BoxIcon height={30} width={30} color="#133E87" />
                      </Box>
                      <Box>
                        <Typography fontWeight={700} fontSize={20} fontStyle="italic" color="#133E87">
                          Slot Door Status
                        </Typography>
                        <Typography color="#133E87">Status : {usageText}</Typography>
                      </Box>
                    </Box>

                    {/* ปุ่ม OPEN (สั่ง UNLOCK) */}
                    <Button
                      onClick={openSlot}
                      disabled={openDisabled}
                      variant="contained"
                      sx={{
                        minWidth: 100,
                        height: 50,
                        fontWeight: 800,
                        borderRadius: 10,
                        px: 2,
                        py: 0.75,
                        bgcolor: sendingOpen || awaitingClose ? "#D6E4EF" : "#133E87",
                        color: sendingOpen || awaitingClose ? "#fff" : undefined,
                        "&:hover": sendingOpen || awaitingClose ? { bgcolor: "#D6E4EF" } : undefined,
                        "&.Mui-disabled": {
                          bgcolor: sendingOpen || awaitingClose ? "#D6E4EF" : "#E0E0E0",
                          color: sendingOpen || awaitingClose ? "#fff" : "#9E9E9E",
                        },
                      }}
                      startIcon={sendingOpen ? <CircularProgress size={18} thickness={5} /> : undefined}
                      title={
                        openDisabled
                          ? awaitingClose
                            ? "Door is open—waiting for it to close"
                            : "MQTT not ready or already open"
                          : "Send unlock command to this slot"
                      }
                    >
                      {sendingOpen ? "OPENING..." : awaitingClose ? "WAITING FOR CLOSE" : "OPEN"}
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card sx={{ borderRadius: 15, px: 2, background: "white", border: "1px solid #D6E4EF" }}>
                  <CardContent
                    sx={{ display: "flex", alignItems: "center", justifyItems: "center", justifyContent: "space-between", py: 2.5 }}
                  >
                    <Box>
                      <Typography fontWeight={700} fontSize={20} fontStyle="italic" color="#133E87">
                        Connection
                      </Typography>
                      <Typography color="#133E87">
                        Status :{" "}
                        {slot?.connection_status === "online"
                          ? "Online"
                          : slot?.connection_status === "offline"
                            ? "Offline"
                            : "Unknown"}
                      </Typography>
                    </Box>
                    <Box sx={{ fontSize: 20, display: "flex", justifyContent: "center" }}>
                      {slot?.connection_status === "online" ? (
                        <CheckIcon width={35} height={35} color="#39B129" />
                      ) : slot?.connection_status === "offline" ? (
                        <ErrorIcon width={35} height={35} color="#B21B1B" />
                      ) : (
                        <ErrorIcon width={35} height={35} color="#D6E4EF" />
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* แถวสอง: Capacity + History */}
            <Grid container spacing={10} sx={{ px: { xs: 0, md: 10 } }}>
              <Grid item xs={12} md={4}>
                <Card sx={{ mt: 2, borderRadius: 6, background: "#D8E6F3" }}>
                  <CardContent>
                    <Box
                      sx={{
                        pt: 5,
                        height: 200,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        position: "relative",
                      }}
                    >
                      <Box
                        sx={{
                          width: 48,
                          height: 48,
                          borderRadius: "20px",
                          background: "#fff",
                          display: "grid",
                          placeItems: "center",
                          fontSize: 22,
                          position: "absolute",
                          top: 5,
                          right: 5,
                        }}
                      >
                        <InboxIcon height={25} width={25} color="#608BC1" />
                      </Box>
                      <Box position="relative" display="inline-flex">
                        <CircularProgress variant="determinate" value={100} size={140} thickness={2} sx={{ color: "#EEF3F8", position: "absolute" }} />
                        <CircularProgress variant="determinate" value={progress} size={140} thickness={2} sx={{ color: "#1E3E74", "svg circle": { strokeLinecap: "round" } }} />
                        <Box
                          sx={{
                            top: 0,
                            left: 0,
                            bottom: 0,
                            right: 0,
                            position: "absolute",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <Typography fontWeight={400} color="#608BC1">
                            {capacityText}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                    <Typography fontStyle="italic" fontWeight="300" fontSize="18px" color="#133E87">
                      Capacity
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              {/* Login & Activation History */}
              <Grid item xs={12} md={8}>
                {/* <Typography fontStyle="italic" fontWeight="300" fontSize="18px" color="#133E87" mb={2}>
                  Login History
                </Typography> */}
                {/* <Card sx={{ borderRadius: 6, overflow: "hidden", border: "1px solid #CBDCEB" }}>
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: "1.5fr 0.8fr 0.8fr 1.2fr",
                      bgcolor: "#E3EDF7",
                      px: 2,
                      py: 1,
                      fontWeight: 700,
                      color: "#133E87",
                    }}
                  >
                    <Box>Name</Box>
                    <Box>Date</Box>
                    <Box>Time</Box>
                    <Box>Description</Box>
                  </Box>
                  <Box sx={{ maxHeight: 240, overflowY: "auto" }}>
                    {loginHistory.length === 0 ? (
                      <Typography px={2} py={1.5} color="text.secondary">
                        — ไม่มีข้อมูล —
                      </Typography>
                    ) : (
                      loginHistory.map((row) => (
                        <Box
                          key={row.id}
                          sx={{
                            display: "grid",
                            gridTemplateColumns: "1.5fr 0.8fr 0.8fr 1.2fr",
                            px: 2,
                            py: 1,
                            borderTop: "1px solid #EFF4F9",
                          }}
                        >
                          <Box>{row.name}</Box>
                          <Box>{row.date}</Box>
                          <Box>{row.time}</Box>
                          <Box>{row.description}</Box>
                        </Box>
                      ))
                    )}
                  </Box>
                </Card> */}

                <Typography fontStyle="italic" fontWeight="300" fontSize="18px" color="#133E87" mt={3} mb={2}>
                  Cupboard Activation History
                </Typography>
                <Card sx={{ borderRadius: 6, overflow: "hidden", border: "1px solid #CBDCEB" }}>
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: "1.5fr 0.8fr 0.8fr 1.2fr",
                      bgcolor: "#E3EDF7",
                      px: 2,
                      py: 1,
                      fontWeight: 700,
                      color: "#133E87",
                    }}
                  >
                    <Box>Name</Box>
                    <Box>Date</Box>
                    <Box>Time</Box>
                    <Box>Description</Box>
                  </Box>
                  <Box sx={{ maxHeight: 240, overflowY: "auto" }}>
                    {activationHistory.length === 0 ? (
                      <Typography px={2} py={1.5} color="text.secondary">
                        — ไม่มีข้อมูล —
                      </Typography>
                    ) : (
                      activationHistory.map((row) => (
                        <Box
                          key={row.id}
                          sx={{
                            display: "grid",
                            gridTemplateColumns: "1.5fr 0.8fr 0.8fr 1.2fr",
                            px: 2,
                            py: 1,
                            borderTop: "1px solid #EFF4F9",
                          }}
                        >
                          <Box>{row.name}</Box>
                          <Box>{row.date}</Box>
                          <Box>{row.time}</Box>
                          <Box>{row.description}</Box>
                        </Box>
                      ))
                    )}
                  </Box>
                </Card>
              </Grid>
            </Grid>
          </>
        )}
      </Box>
    </Box>
  );
}
