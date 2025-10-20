// src/hooks/useDerivedAlerts.ts
import { useEffect, useRef } from "react";
import { useMqtt } from "./useMqtt";

export type DerivedEvent =
  | {
    kind: "slot_full";
    slot_id: string;
    cupboard_id?: string;
    capacity_mm: number;
    capacity_pct: number;
  }
  | {
    kind: "slot_back_to_safe";
    slot_id: string;
    cupboard_id?: string;
    capacity_mm: number;
    capacity_pct: number;
  }
  | {
    kind: "sensor_oor";
    slot_id: string;
    cupboard_id?: string;
    capacity_mm: number;
  }
  | {
    kind: "door_open_too_long";
    slot_id: string;
    cupboard_id?: string;
    open_seconds: number;
  };

type Opts = {
  /** MQTT topics ที่จะฟัง (ค่าเริ่มต้นรองรับทั้ง /slot/ และ /slot_id/) */
  topics?: string[];
  /** ค่าควบคุมเกณฑ์ต่าง ๆ */
    // คาลิเบรตให้ตรง DB: mm_empty = ค่าตอน "ว่างสุด", mm_full = ค่าตอน "เต็มสุด"
  MM_EMPTY?: number; // default 200
  MM_FULL?: number;  // default 80
  FULL_PCT?: number;       // default 0.90
  SAFE_PCT?: number;       // default 0.85
  DOOR_OPEN_WARN_S?: number;// default 30
  COOLDOWN_S?: number;     // default 60
  /** callback เมื่อพบเหตุการณ์ (ใช้โชว์ toast / เรียก Edge Function ฯฯ) */
  onEvent: (ev: DerivedEvent) => void;
  /** (เพิ่มส่วนนี้) callback สำหรับบันทึกและแจ้งเตือนเมื่อ Sensor ผิดปกติ */
  onSensorOor?: (ev: Extract<DerivedEvent, { kind: "sensor_oor" }>) => void;
};

// memory ต่อ slot
type SlotMem = {
  is_full_zone: boolean;
  door_open_since: number | null;     // epoch seconds
  last_emit: Record<string, number>;  // key -> epoch seconds
};
// ฟังก์ชันสำหรับบันทึกข้อมูลลงฐานข้อมูล (เช่น Supabase หรือ Firebase)
async function logErrorToDb(slot_id: string, capacity_mm: number, cupboard_id?: string) {
  const response = await fetch("/api/logSensorError", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      slot_id,
      capacity_mm,
      cupboard_id,
      timestamp: new Date().toISOString(),
    }),
  });

  if (!response.ok) {
    console.error("Failed to log error to DB");
  }
}
export function useDerivedAlerts({
  topics = [
    "smartlocker/+/slot/+/status",
    "smartlocker/+/slot_id/+/status",
    "smartlocker/+/slot/+/warning",
    "smartlocker/+/slot_id/+/warning",
  ],
  MM_EMPTY = 200,
  MM_FULL = 80,
  FULL_PCT = 0.9,
  SAFE_PCT = 0.85,
  DOOR_OPEN_WARN_S = 30,
  COOLDOWN_S = 60,
  onEvent,
  onSensorOor, // รับฟังก์ชันใหม่เข้ามา
}: Opts) {
  const { onMessage } = useMqtt(topics);

  const memRef = useRef<Map<string, SlotMem>>(new Map());
  const now = () => Date.now() / 1000;

   const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
  // % แบบ "fill level" ให้ตรง DB: 200mm -> 0%, 80mm -> 100%
  const fillPctFromMm = (mm: number) => {
    const span = Math.max(1, MM_EMPTY - MM_FULL); // กันหารศูนย์
    return clamp01((MM_EMPTY - mm) / span);
  };
  const getMem = (slot: string): SlotMem => {
    const m = memRef.current.get(slot);
    if (m) return m;
    const fresh: SlotMem = {
      is_full_zone: false,
      door_open_since: null,
      last_emit: {},
    };
    memRef.current.set(slot, fresh);
    return fresh;
  };

  const withinCooldown = (slot: string, key: string) => {
    const m = getMem(slot);
    const t = m.last_emit[key] || 0;
    return now() - t < COOLDOWN_S;
  };

  const markEmit = (slot: string, key: string) => {
    getMem(slot).last_emit[key] = now();
  };

  useEffect(() => {
    const off = onMessage(
      (topic, payload) => {
        // คาดหวัง payload เดิมจาก Pi เช่น:
        // {"capacity_mm":198,"connection_status":true,"is_open":false,"cupboard_id":"C01","slot_id":"SC002", ...}
        if (!payload || typeof payload !== "object") return;

        const slot_id: string = payload.slot_id || inferSlotFromTopic(topic);
        if (!slot_id) return;
        const cupboard_id: string | undefined = payload.cupboard_id;

        const m = getMem(slot_id);

        // 1) Door open timer (จับตอนเปลี่ยนจาก true -> false)
        if (typeof payload.is_open === "boolean") {
          if (payload.is_open === true) {
            if (m.door_open_since == null) m.door_open_since = now();
          } else {
            if (m.door_open_since != null) {
              const openSec = Math.round(now() - m.door_open_since);
              m.door_open_since = null;
              if (
                openSec >= DOOR_OPEN_WARN_S &&
                !withinCooldown(slot_id, "door_open_too_long")
              ) {
                onEvent({
                  kind: "door_open_too_long",
                  slot_id,
                  cupboard_id,
                  open_seconds: openSec,
                });
                markEmit(slot_id, "door_open_too_long");
              }
            }
          }
        }

        // 2) Capacity-based rules  (แทนบล็อกเดิมทั้งหมด)
{
  // ยอมรับทั้งตัวเลขและสตริงตัวเลขจาก payload
  const rawMm = (payload as any)?.capacity_mm;
  const mm = Number(rawMm);

  // ถ้าไม่ใช่ตัวเลข (NaN) ก็ข้ามไปเลย
  if (!Number.isFinite(mm)) {
    // console.debug("[derived] capacity_mm is not numeric:", rawMm);
    return;
  }

  // --- กำหนดขอบเขตค่าที่ยอมรับ ---
  // ค่าต่ำกว่า 0 หรือสูงกว่า MM_EMPTY = ผิดปกติแน่
  // (ถ้าต้องการเข้มขึ้น: ใช้ mm < MM_FULL || mm > MM_EMPTY แทน)
  const isOutOfRange = (mm < 0) || (mm > MM_EMPTY);

  if (isOutOfRange) {
    if (!withinCooldown(slot_id, "sensor_oor")) {
      const eventData: Extract<DerivedEvent, { kind: "sensor_oor" }> = {
        kind: "sensor_oor",
        slot_id,
        cupboard_id,
        capacity_mm: mm,
      };
      onEvent(eventData);
      onSensorOor?.(eventData);
      markEmit(slot_id, "sensor_oor");
    }
    return; // ❗️หยุดทันที ห้ามไหลไปคำนวณ % แล้วกลายเป็น 100%
  }

  // --- ปกติ: คำนวณ % fill แล้วดู full/back-to-safe ---
  const pctFill = fillPctFromMm(mm); // 0..1
  const pct100 = +(pctFill * 100).toFixed(1);

  if (!m.is_full_zone && pctFill >= FULL_PCT) {
    m.is_full_zone = true;
    if (!withinCooldown(slot_id, "slot_full")) {
      onEvent({
        kind: "slot_full",
        slot_id,
        cupboard_id,
        capacity_mm: mm,
        capacity_pct: pct100,
      });
      markEmit(slot_id, "slot_full");
    }
  } else if (m.is_full_zone && pctFill < SAFE_PCT) {
    m.is_full_zone = false;
    if (!withinCooldown(slot_id, "slot_back_to_safe")) {
      onEvent({
        kind: "slot_back_to_safe",
        slot_id,
        cupboard_id,
        capacity_mm: mm,
        capacity_pct: pct100,
      });
      markEmit(slot_id, "slot_back_to_safe");
    }
  }
}

      },
      { replayLast: true } // เปิดหน้าแล้วได้ค่าล่าสุดทันที (ถ้า broker/แอปเคยส่งมาแล้ว)
    );

    return () => off();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    onSensorOor, // เพิ่ม onSensorOor ใน dependencies
    MM_EMPTY,
    
    FULL_PCT,
    SAFE_PCT,
    DOOR_OPEN_WARN_S,
    COOLDOWN_S,
    topics.join("|"),
  ]);
}

/** ดึง slot_id จาก topic ได้ หาก payload ไม่มี */
function inferSlotFromTopic(topic: string): string | undefined {
  // smartlocker/C01/slot/SC002/status
  // smartlocker/C01/slot_id/SC002/status
  const p = topic.split("/");
  const i = p.findIndex((s) => s === "slot" || s === "slot_id");
  if (i >= 0 && p[i + 1]) return p[i + 1];
  return undefined;
}
