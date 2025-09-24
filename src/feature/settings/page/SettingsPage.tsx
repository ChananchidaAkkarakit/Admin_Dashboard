import { useEffect, useMemo, useState } from "react";
import { Box, Typography, Avatar, Button, Grid } from "@mui/material";
import NotificationToggle from "../components/NotificationToggle";
import LockIcon from "../../../assets/icons/lock.svg?react";
import ServerIcon from "../../../assets/icons/server.svg?react";
import CupboardIcon from "../../../assets/icons/box-broken.svg?react";
import InfaredIcon from "../../../assets/icons/infrared.svg?react";
import {
  fetchSettings,
  saveSettings,
  ensureUserId,
  type NotificationSettings,
} from "../../../api/notificationSettings";

export default function SettingsPage() {
  const [isOpen, setIsOpen] = useState(true); // ปุ่มภาพรวมซ้าย (ยังไม่ผูก DB ในรอบนี้)
  const [loading, setLoading] = useState(true);

  // สถานะ toggle ที่โชว์บน UI
  const [toggles, setToggles] = useState({
    cupboardDoor: true,
    connection: false,
    full: true,
    sensorError: false,
  });

  const cupboardId = "default"; // หรือมาจาก params/selection

  // โหลดค่าจาก Supabase ครั้งแรก
  useEffect(() => {
    (async () => {
      setLoading(true);
      const s = await fetchSettings(cupboardId);
      setToggles({
        cupboardDoor: s.alert_cupboard_door,
        connection: s.alert_connection,
        full: s.alert_full,
        sensorError: s.alert_sensor_error,
      });
      setLoading(false);
    })();
  }, [cupboardId]);

  // helper: รวม state -> payload สำหรับบันทึก
  const toPayload = useMemo<NotificationSettings>(() => ({
    user_id: localStorage.getItem("uid") || "",
    cupboard_id: cupboardId,
    alert_cupboard_door: toggles.cupboardDoor,
    alert_connection: toggles.connection,
    alert_full: toggles.full,
    alert_sensor_error: toggles.sensorError,
  }), [toggles, cupboardId]);

  // กด toggle → อัปเดต UI ทันที (optimistic) → เซฟลง DB
  const handleToggle = (key: keyof typeof toggles) => {
    const next = { ...toggles, [key]: !toggles[key] };
    setToggles(next);

    // เตรียม payload ใหม่ให้ตรงกับค่า next
    const payload: NotificationSettings = {
      ...toPayload,
      alert_cupboard_door: key === "cupboardDoor" ? !toggles[key] : next.cupboardDoor,
      alert_connection:    key === "connection"   ? !toggles[key] : next.connection,
      alert_full:          key === "full"         ? !toggles[key] : next.full,
      alert_sensor_error:  key === "sensorError"  ? !toggles[key] : next.sensorError,
    };

    // สร้าง uid ถ้ายังไม่มี (ครั้งแรก)
    ensureUserId().then(() => saveSettings(payload)).catch((e) => {
      console.error(e);
      // ถ้าบันทึกพลาด คุณอาจ rollback UI หรือแสดง snackbar ก็ได้
    });
  };

  return (
    <Box>
      <Typography fontSize="40px" fontWeight={900} fontStyle="italic" color="#133E87" mb={4}>
        Settings
      </Typography>

      {/* <Grid container spacing={0}> */}
        {/* ฝั่งซ้าย - ปุ่ม Cupboard Door (ยังไม่เซฟ DB ในรอบนี้) */}
        {/* <Grid item xs={12} md={2.5}>
          <Button
            sx={{ bgcolor: "#E8F1FB", borderRadius: "35px", minWidth: 180, width: "80%", minHeight: 170, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", p: 2, mb: 2 }}
            onClick={() => setIsOpen((prev) => !prev)}
            disabled={loading}
          >
            <Avatar sx={{ bgcolor: "#fff", color: "#133E87", width: 70, height: 70, mb: 2, border: "1px solid #CBDCEB" }}>
              <CupboardIcon color="#133E87" style={{ width: 35, height: 35 }} />
            </Avatar>
            <Typography fontWeight="bold" color="#133E87" fontSize={18}>Cupboard Door</Typography>
            <Typography color={isOpen ? "#2FA620" : "#B21B1B"} fontSize={15}>
              {isOpen ? "Open" : "Close"}
            </Typography>
          </Button>
        </Grid> */}

        {/* ฝั่งขวา - Toggle ที่เซฟลง Supabase */}
        <Grid item xs={12} md={9.5}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <NotificationToggle
              icon={<LockIcon color="#133E87" style={{ width: 30, height: 30 }} />}
              label="Notification"
              detail="(Cupboard Door)"
              status={toggles.cupboardDoor ? "Status : On" : "Status : Off"}
              checked={toggles.cupboardDoor}
              onChange={() => handleToggle("cupboardDoor")}
            />
            <NotificationToggle
              icon={<ServerIcon color="#133E87" style={{ width: 30, height: 30 }} />}
              label="Notification"
              detail="(Connection between cupboard and server)"
              status={toggles.connection ? "Status : On" : "Status : Off"}
              checked={toggles.connection}
              onChange={() => handleToggle("connection")}
            />
            <NotificationToggle
              icon={<CupboardIcon color="#133E87" style={{ width: 30, height: 30 }} />}
              label="Notification"
              detail="(The cupboard is full.)"
              status={toggles.full ? "Status : On" : "Status : Off"}
              checked={toggles.full}
              onChange={() => handleToggle("full")}
            />
            <NotificationToggle
              icon={<InfaredIcon color="#133E87" style={{ width: 30, height: 30 }} />}
              label="Notification"
              detail="(Sensor malfunction)"
              status={toggles.sensorError ? "Status : On" : "Status : Off"}
              checked={toggles.sensorError}
              onChange={() => handleToggle("sensorError")}
            />
          </Box>
        </Grid>
      {/* </Grid> */}
    </Box>
  );
}
