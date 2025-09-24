// src/feature/monitoring/page/SlotDashboard.tsx
import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  CircularProgress,
  Chip,
  Divider,
  CardActionArea,
  Button,
  Stack,
} from "@mui/material";
import ArrowBackIcon from "../../../assets/icons/arrow-back.svg?react";
import BoxIcon from "../../../assets/icons/box.svg?react";
import ErrorIcon from "../../../assets/icons/error.svg?react";
import InboxIcon from "../../../assets/icons/inbox.svg?react";
import CheckIcon from "../../../assets/icons/checkmark.svg?react";
import WiFiIcon from "../../../assets/icons/wifi.svg?react";
import { supabase } from "../../../supabaseClient";
import { useMqtt } from "../../../hooks/useMqtt";

// ตารางใน Supabase (แก้ชื่อได้ตรงนี้)
const TBL = {
  slots: "slots",
  login: null,        // ตอนนี้ยังไม่มี
  activation: null,   // ตอนนี้ยังไม่มี
};

type SlotRow = {
  slot_id: string;
  cupboard_id: string;
  connection_status: "online" | "offline" | string;
  capacity: number | null;
  is_open?: boolean;

  // เพิ่มให้ตรงกับ enum ใน DB
  sensor_status?: "ok" | "error" | "unknown";
  wifi_status?: "connected" | "disconnected" | "unknown";

  // ออปชั่น: ถ้าอยากใช้ใน UI ต่อ
  wifi_rssi?: number | null;
  ip_addr?: string | null;
  last_sensor_at?: string | null;
  last_seen_at?: string | null;
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

export default function SlotDashboard() {
  const { slotId } = useParams<{ slotId: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const [slot, setSlot] = useState<SlotRow | null>(null);
  const [loginHistory, setLoginHistory] = useState<LoginLog[]>([]);
  const [activationHistory, setActivationHistory] = useState<ActivationLog[]>([]);

  // helper: แปลง state เป็นข้อความ/สี
  const isOpen = !!slot?.is_open;
  const usageText = isOpen ? "On" : "Off";
  const usageColor = isOpen ? "#39B129" : "#B21B1B";

  // (ใหม่) state ระหว่างส่งคำสั่ง
  const [sending, setSending] = useState<"open" | "close" | null>(null);

  // state ที่อาจถูกส่งมาจากหน้ารายการ (ไว้ fallback ให้จอไม่ว่าง)
  const fromState = useMemo(() => {
    const s = location.state as Partial<{
      slotId: string;
      cupboardId: string;
      connectionStatus: SlotRow["connection_status"];
      wifiStatus: SlotRow["wifi_status"];
      sensorStatus: SlotRow["sensor_status"];
      capacity: number;
    }> | undefined;
    return s;
  }, [location.state]);

  // ดึงจาก DB เป็นหลัก, ถ้ายังไม่โหลดเสร็จ ใช้ location.state ชั่วคราว
  const cupboardId =
    slot?.cupboard_id || (fromState?.cupboardId as string | undefined);

  // MQTT topics (ใช้ cupboard_id + slot_id)
  const statusTopic =
    cupboardId && slotId
      ? `smartlocker/${cupboardId}/slot/${slotId}/status`
      : null;
  const commandTopic =
    cupboardId && slotId
      ? `smartlocker/${cupboardId}/slot/${slotId}/command`
      : null;

  // สมัคร MQTT แบบ dynamic ตาม topic ที่พร้อม
  const { status: mqttStatus, publish, onMessage } = useMqtt(
    statusTopic ? [statusTopic] : []
  );

  // ฟังสถานะจากอุปกรณ์ → อัปเดต UI
  useEffect(() => {
    if (!statusTopic) return;
    const unsubscribe = onMessage((topic, payload) => {
      if (topic !== statusTopic) return;
      setSlot((prev) => {
        const base =
          prev ?? {
            slot_id: slotId!,
            cupboard_id: cupboardId!,
            connection_status: "active",
            capacity: null,
            is_open: false,
            sensor_status: "unknown",
            wifi_status: "unknown",
          };
        return {
          ...base,
          is_open: payload?.door ? payload.door === "open" : base.is_open,
          capacity:
            typeof payload?.capacity === "number" ? payload.capacity : base.capacity,
          sensor_status: payload?.sensor_status ?? base.sensor_status,
          wifi_status: payload?.wifi_status ?? base.wifi_status,
          wifi_rssi:
            typeof payload?.wifi_rssi === "number"
              ? payload.wifi_rssi
              : base.wifi_rssi,
          ip_addr: payload?.ip_addr ?? base.ip_addr,
          last_seen_at: payload?.ts
            ? new Date(payload.ts).toISOString()
            : base.last_seen_at,
        };
      });
    });
    return () => unsubscribe();  // ✅ cleanup เป็นฟังก์ชันเสมอ
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusTopic]);

  // โหลดข้อมูลหลักจาก Supabase
  useEffect(() => {
    let active = true;

    async function run() {
      if (!slotId) return;
      setLoading(true);
      setErr(null);

      try {
        // ---------- SLOT ----------
        const { data: slotData, error: slotErr } = await supabase
          .from(TBL.slots)
          .select(
            `
            slot_id,
            cupboard_id,
            connection_status,
            capacity,
            is_open,
            sensor_status,
            wifi_status,
            wifi_rssi,
            ip_addr,
            last_sensor_at,
            last_seen_at
          `
          )
          .eq("slot_id", slotId)
          .maybeSingle();

        if (slotErr) throw slotErr;

        const mappedSlot = slotData
          ? {
            slot_id: (slotData as any).slot_id,
            cupboard_id: (slotData as any).cupboard_id ?? "-",
            connection_status:
              (slotData as any).connection_status ?? "online",
            capacity: (slotData as any).capacity ?? null,
            is_open: (slotData as any).is_open ?? false,

            sensor_status: (slotData as any).sensor_status ?? "unknown",
            wifi_status: (slotData as any).wifi_status ?? "unknown",

            wifi_rssi: (slotData as any).wifi_rssi ?? null,
            ip_addr: (slotData as any).ip_addr ?? null,
            last_sensor_at: (slotData as any).last_sensor_at ?? null,
            last_seen_at: (slotData as any).last_seen_at ?? null,
          }
          : null;

        // ---------- LOGIN HISTORY (optional) ----------
        let loginData: any[] = [];
        if (TBL.login) {
          try {
            const { data, error } = await supabase
              .from(TBL.login) // <= เรียกเฉพาะเมื่อมีชื่อจริง
              .select("id, name, date, time, description")
              .eq("slot_id", slotId)
              .order("date", { ascending: false })
              .order("time", { ascending: false })
              .limit(10);
            if (error) throw error;
            loginData = data ?? [];
          } catch (e: any) {
            if (!(e?.code === "42P01" || /does not exist/i.test(e?.message))) {
              throw e;
            }
            loginData = [];
          }
        }

        // ---------- ACTIVATION HISTORY (optional) ----------
        let actData: any[] = [];
        if (TBL.activation) {
          try {
            const { data, error } = await supabase
              .from(TBL.activation)
              .select("id, name, date, time, description")
              .eq("slot_id", slotId)
              .order("date", { ascending: false })
              .order("time", { ascending: false })
              .limit(10);
            if (error) throw error;
            actData = data ?? [];
          } catch (e: any) {
            if (!(e?.code === "42P01" || /does not exist/i.test(e?.message))) {
              throw e;
            }
            actData = [];
          }
        }

        if (!active) return;

        setSlot(
          mappedSlot ?? {
            slot_id: slotId,
            cupboard_id: (location.state as any)?.cupboardId ?? "-",
            connection_status:
              (location.state as any)?.connectionStatus ?? "online",
            sensor_status: (location.state as any)?.sensorStatus ?? "ok",
            wifi_status: (location.state as any)?.wifiStatus ?? "connected",
            capacity: (location.state as any)?.capacity ?? null,
          }
        );
        setLoginHistory(loginData);
        setActivationHistory(actData);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slotId]);

  // ✅ แปลงค่าจาก DB -> เปอร์เซ็นต์ 0–100 อย่างปลอดภัย
  const capacityText = slot?.capacity != null ? `${slot.capacity} / 100` : "—";
  const progress = useMemo(() => {
    const n = Number(slot?.capacity);
    if (!Number.isFinite(n)) return 0; // null/NaN -> 0
    return Math.max(0, Math.min(100, Math.round(n))); // clamp 0..100
  }, [slot?.capacity]);

  // ส่งคำสั่งไปอุปกรณ์ + log + sync DB (ออปชั่น)
  async function sendCommand(action: "open" | "close") {
    if (!slot || !commandTopic) return;
    setSending(action);

    // ส่งคำสั่งไปอุปกรณ์
    publish(commandTopic, { action, by: "web-ui", slotId, ts: Date.now() });

    // Optimistic UI
    setSlot((s) => (s ? { ...s, is_open: action === "open" } : s));

    // (ออปชั่น) บันทึกลง activation_logs
    try {
      await supabase.from("activation_logs").insert({
        slot_id: slot.slot_id,
        action,
        cause: "manual",
        metadata: { via: "web-ui" },
      });
    } catch {
      /* ignore */
    }

    // (ออปชั่น) Sync fields สำคัญของ slots
    try {
      await supabase
        .from("slots")
        .update({
          is_open: action === "open",
          last_open_at: action === "open" ? new Date().toISOString() : null,
        })
        .eq("slot_id", slot.slot_id);
    } catch {
      /* ignore */
    } finally {
      setSending(null);
    }
  }

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: { xs: "column", sm: "column", md: "column", lg: "row" },
        width: "100%",
      }}
    >
      {/* คอลัมน์ซ้าย */}
      <Box sx={{ flex: 1, width: "80%" }}>
        {/* Header */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}>
          <ArrowBackIcon
            onClick={() => navigate(-1)}
            style={{ width: 28, height: 28, cursor: "pointer" }}
          />
          <Typography fontSize="40px" fontWeight={900} fontStyle="italic" color="#133E87">
            Monitoring
          </Typography>
        </Box>
        <Divider
          sx={{
            mt: 1,
            mb: 3,
            mx: 2,
            borderBottomWidth: 2,
            borderColor: "#CBDCEB",
          }}
        />

        {/* ชื่อ Slot */}
        <Box mt={1} mb={2} display="flex" justifyContent="center">
          <Typography
            variant="h5"
            fontWeight={800}
            color="#133E87"
            sx={{ letterSpacing: 0.2 }}
          >
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
            <Grid container spacing={5} mb={3} sx={{ px: { xs: 0, md: 10 } }}>
              <Grid item xs={12} md={8}>
                <Card
                  sx={{
                    borderRadius: 15,
                    background: isOpen ? "#D6E4EF" : "white",
                    border: "1px solid #D6E4EF",
                  }}
                >
                  {/* เดิมเป็น CardActionArea toggle; ตอนนี้ใช้ปุ่ม Open/Close แทน */}
                  <CardActionArea
                    disabled
                    sx={{
                      borderRadius: 15,
                      cursor: "default",
                    }}
                  >
                    <CardContent
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        py: 2.5,
                      }}
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
                            fontSize: 22,
                          }}
                        >
                          <BoxIcon height={30} width={30} color="#133E87" />
                        </Box>
                        <Box>
                          <Typography
                            fontWeight={700}
                            fontSize={20}
                            fontStyle="italic"
                            color="#133E87"
                          >
                            Cupboard Usage Status
                          </Typography>
                          <Typography color="#133E87">Status : {usageText}</Typography>
                          <Typography color="#133E87" sx={{ mt: 0.5, fontSize: 12 }}>
                            MQTT: {mqttStatus}{" "}
                            {cupboardId ? `• cupboard_id: ${cupboardId}` : "• loading cupboard_id..."}
                          </Typography>
                        </Box>
                      </Box>

                      <Stack direction="row" spacing={1} sx={{ mr: 2 }}>
                        <Button
                          variant="contained"
                          size="small"
                          disabled={
                            mqttStatus !== "connected" ||
                            sending !== null ||
                            isOpen ||
                            !cupboardId ||
                            slot?.wifi_status === "disconnected"
                          }
                          onClick={() => sendCommand("open")}
                        >
                          {sending === "open" ? "Opening..." : "Open"}
                        </Button>
                        <Button
                          variant="outlined"
                          size="small"
                          disabled={
                            mqttStatus !== "connected" ||
                            sending !== null ||
                            !isOpen ||
                            !cupboardId ||
                            slot?.wifi_status === "disconnected"
                          }
                          onClick={() => sendCommand("close")}
                        >
                          {sending === "close" ? "Closing..." : "Close"}
                        </Button>
                      </Stack>

                      <Chip
                        label=" "
                        sx={{
                          width: 20,
                          height: 20,
                          mr: 1,
                          borderRadius: "50%",
                          bgcolor: usageColor,
                        }}
                      />
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>

              <Grid item xs={12} md={4}>
                <Card
                  sx={{ borderRadius: 15, px: 2, background: "white", border: "1px solid #D6E4EF" }}
                >
                  <CardContent
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyItems: "center",
                      justifyContent: "space-between",
                      py: 2.5,
                    }}
                  >
                    <Box>
                      <Typography
                        fontWeight={700}
                        fontSize={20}
                        fontStyle="italic"
                        color="#133E87"
                      >
                        Sensor
                      </Typography>
                      <Typography color="#133E87">
                        Status :{" "}
                        {(slot?.sensor_status ?? "unknown") === "error"
                          ? "Error"
                          : (slot?.sensor_status ?? "unknown") === "ok"
                            ? "Normal"
                            : "Error" /* unknown = Error */}
                      </Typography>
                    </Box>

                    <Box sx={{ fontSize: 20, display: "flex", justifyContent: "center" }}>
                      {slot?.sensor_status === "ok" ? (
                        <CheckIcon width={35} height={35} color="#39B129" />
                      ) : (
                        <ErrorIcon width={35} height={35} color="#B21B1B" />
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* แถวสอง: Wi-Fi / Capacity + Login History */}
            <Grid container spacing={10} sx={{ px: { xs: 0, md: 10 } }}>
              <Grid item xs={12} md={4}>
                {/* Wi-Fi */}
                <Card
                  sx={{
                    borderRadius: 15,
                    background: "white",
                    border: "1px solid #D6E4EF",
                    mb: 3,
                    px: 2,
                  }}
                >
                  <CardContent>
                    <Typography
                      fontWeight={700}
                      fontSize={20}
                      fontStyle="italic"
                      color="#133E87"
                    >
                      Wi-Fi
                      <WiFiIcon
                        style={{
                          color:
                            slot?.wifi_status === "connected" ? "#39B129" : "#B21B1B",
                          marginLeft: 10,
                        }}
                      />
                    </Typography>
                    <Typography color="#133E87">
                      Status :{" "}
                      {(slot?.wifi_status ?? "unknown") === "connected"
                        ? "Connect"
                        : (slot?.wifi_status ?? "unknown") === "disconnected"
                          ? "Disconnect"
                          : "Unknown"}
                    </Typography>

                    {/* ถ้าจะโชว์ RSSI */}
                    {typeof slot?.wifi_rssi === "number" && (
                      <Typography color="#133E87">RSSI: {slot!.wifi_rssi} dBm</Typography>
                    )}
                  </CardContent>
                </Card>

                {/* Capacity */}
                <Card sx={{ borderRadius: 6, background: "#D8E6F3" }}>
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
                          background: "#ffffffff",
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
                        {/* track (พื้นหลัง) */}
                        <CircularProgress
                          variant="determinate"
                          value={100}
                          size={140}
                          thickness={2}
                          sx={{ color: "#EEF3F8", position: "absolute" }}
                        />
                        {/* progress จริง */}
                        <CircularProgress
                          variant="determinate"
                          value={progress}
                          size={140}
                          thickness={2}
                          sx={{ color: "#1E3E74", "svg circle": { strokeLinecap: "round" } }}
                        />
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
                    <Typography
                      fontStyle="italic"
                      fontWeight="300"
                      fontSize="18px"
                      color="#133E87"
                    >
                      Capacity
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              {/* Login History */}
              <Grid item xs={12} md={8}>
                <Typography
                  fontStyle="italic"
                  fontWeight="300"
                  fontSize="18px"
                  color="#133E87"
                  mb={1}
                >
                  Login History
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
                </Card>

                {/* Activation History */}
                <Typography
                  fontStyle="italic"
                  fontWeight="300"
                  fontSize="18px"
                  color="#133E87"
                  mt={3}
                  mb={1}
                >
                  Cupboard Activation History
                </Typography>
                <Card
                  sx={{ width: "200", borderRadius: 6, overflow: "hidden", border: "1px solid #CBDCEB" }}
                >
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
