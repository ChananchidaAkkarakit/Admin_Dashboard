// src/feature/monitoring/page/MonitoringOverviewPage.tsx
import { Box, Typography, Grid, Button, Card, CardContent, CircularProgress } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../../../supabaseClient";

export default function MonitoringOverviewPage() {
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    loading: true,
    error: null as string | null,
    slotsTotal: 0,
    slotsActive: 0,     // connection_status = 'online'
    slotsOffline: 0,    // connection_status = 'offline'
    teachersTotal: 0,
    qrTotal: 0,
    qrActive: 0,        // is_active = true
  });

  useEffect(() => {
    let alive = true;
    (async () => {
      setStats(s => ({ ...s, loading: true, error: null }));
      try {
        const [
          slotsTotalRes,
          slotsActiveRes,
          slotsOfflineRes,
          teachersRes,
          qrTotalRes,
          qrActiveRes,
        ] = await Promise.all([
          supabase.from("slots").select("slot_id", { count: "exact", head: true }),
          supabase.from("slots").select("slot_id", { count: "exact", head: true }).eq("connection_status", "active"),
          supabase.from("slots").select("slot_id", { count: "exact", head: true }).eq("connection_status", "inactive"),
          supabase.from("teachers").select("teacher_id", { count: "exact", head: true }),
          supabase.from("qrcodes").select("qr_id", { count: "exact", head: true }),
          supabase.from("qrcodes").select("qr_id", { count: "exact", head: true }).eq("is_active", true),
        ]);

        const err =
          slotsTotalRes.error || slotsActiveRes.error || slotsOfflineRes.error ||
          teachersRes.error || qrTotalRes.error || qrActiveRes.error;
        if (err) throw err;

        if (!alive) return;
        setStats({
          loading: false,
          error: null,
          slotsTotal: slotsTotalRes.count ?? 0,
          slotsActive: slotsActiveRes.count ?? 0,
          slotsOffline: slotsOfflineRes.count ?? 0,
          teachersTotal: teachersRes.count ?? 0,
          qrTotal: qrTotalRes.count ?? 0,
          qrActive: qrActiveRes.count ?? 0,
        });
      } catch (e: any) {
        if (!alive) return;
        setStats(s => ({ ...s, loading: false, error: e?.message ?? "failed to load stats" }));
        console.error("overview stats error:", e);
      }
    })();
    return () => { alive = false; };
  }, []);

  const cards = [
    { label: "Slot ทั้งหมด", value: stats.slotsTotal },
    { label: "Online", value: stats.slotsActive },
    { label: "Offline", value: stats.slotsOffline },
    { label: "อาจารย์ทั้งหมด", value: stats.teachersTotal },
    { label: "QR ใช้งาน", value: `${stats.qrActive} / ${stats.qrTotal}` },
  ];

  return (
    <Box>
      <Typography fontSize="40px" fontWeight={900} fontStyle="italic" color="#133E87" mb={4}>
        Monitoring
      </Typography>

      {/* 📊 สถิติรวม */}
      {stats.loading ? (
        <Box display="flex" alignItems="center" gap={1} mb={2}>
          <CircularProgress size={20} />
          <Typography color="text.secondary" fontStyle="italic">Loading summary…</Typography>
        </Box>
      ) : stats.error ? (
        <Typography color="error" mb={2}>โหลดสถิติไม่สำเร็จ: {stats.error}</Typography>
      ) : null}

      <Grid container spacing={3}>
        {cards.map((item, i) => (
          <Grid item xs={12} sm={6} md={4} key={i}>
            <Card elevation={2} sx={{ borderRadius: 7 }}>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary">
                  {item.label}
                </Typography>
                <Typography variant="h5" fontWeight={700}>
                  {item.value}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* ปุ่มลัด */}
      <Box mt={4} display="flex" gap={2}>
        <Button
          variant="outlined"
          onClick={() => navigate("/app/monitoring/items")}
          sx={{ borderRadius: "25px", fontSize: "15px", fontWeight: "bold", px: 5, py: 1, textTransform: "none" }}
        >
          ดูข้อมูลตู้ทั้งหมด
        </Button>
        <Button
          variant="outlined"
          onClick={() => navigate("/app/monitoring/login-details")}
          sx={{ borderRadius: "25px", fontSize: "15px", fontWeight: "bold", px: 5, py: 1, textTransform: "none" }}
        >
          ดูประวัติการเข้าสู่ระบบ
        </Button>
      </Box>

      {/* ⚠️ ความผิดปกติ */}
      {/* <Box mt={6}>
        <Typography variant="h6" fontWeight={700} color="error" gutterBottom>
          ความผิดปกติล่าสุด
        </Typography>
        <Box pl={2}>
          <Typography>🔴 SC104 Offline มากกว่า 18 นาที</Typography>
          <Typography>🟡 QR T002 ถูกใช้นอกเวลา</Typography>
        </Box>
      </Box> */}
    </Box>
  );
}
