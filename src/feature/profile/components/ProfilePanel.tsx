// src/components/your-path/ProfilePanel.tsx
import {
  Box,
  Typography,
  Button,
  Paper,
  Divider,
  Dialog,
  DialogContent,
  IconButton,
  Snackbar,
  Alert,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ProfileImageUploader from "./ProfileImageUploader";
import { supabase } from "../../../supabaseClient";
import { useNotifications } from "../../../hooks/useNotifications";
import { useNavigate } from "react-router-dom";
import NotificationBellIcon from "../../../assets/icons/notification_bell.svg?react";
import NotificationBellNewIcon from "../../../assets/icons/notification_bell_new.svg?react";
import NotificationBellSolidIcon from "../../../assets/icons/notification_bell_solid.svg?react";
import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { useDerivedAlerts, type DerivedEvent } from "../../../hooks/useDerivedAlerts";
import type { SupabaseClient } from "@supabase/supabase-js";

type MyAdminProfileRow = {
  display_name: string | null;
  name_thai: string | null;
  name_eng: string | null;
  role: string | null;
  faculty: string | null;
  job_title: string | null;
};

function isMissingRpc(err: any) {
  const msg = (err?.message || "").toString();
  const code = (err?.code || "").toString();
  return /does not exist/i.test(msg) || /42883/.test(code) || /PGRST302/.test(code) || /Not found/i.test(msg);
}

async function broadcastSlotFullFallback(opts: {
  slot_id: string;
  cupboard_id?: string;
  capacity_mm: number;
  capacity_pct: number; // 0..100
  link?: string;
  supabase: SupabaseClient;
  currentUserId?: string;
}) {
  const { slot_id, cupboard_id = "", capacity_mm, capacity_pct, link, supabase, currentUserId } = opts;
  const payload = {
    slot_id,
    cupboard_id,
    capacity_mm,
    capacity_pct,
    link: link ?? `/manage/slots/${slot_id}`,
    timestamp: new Date().toISOString(),
  };

  // พยายามใช้ RPC รวม (ถ้ามี)
  try {
    const { error } = await supabase.rpc("fn_broadcast_slot_full", {
      p_slot_id: slot_id,
      p_cupboard_id: cupboard_id,
      p_capacity_mm: capacity_mm,
      p_capacity_pct: capacity_pct,
      p_link: payload.link,
    });
    if (error) {
      if (!isMissingRpc(error)) throw error;
    } else {
      return; // สำเร็จ
    }
  } catch (e) {
    if (!isMissingRpc(e)) throw e;
  }

  // Fallback: อย่างน้อยแจ้ง “ผู้ใช้ปัจจุบัน”
  if (!currentUserId) return;
  await supabase.rpc("fn_upsert_active_notification", {
    p_user_id: currentUserId,
    p_message_name: "alert_slot_full",
    p_payload: payload,
    p_source: "system",
  });
}

async function resolveSlotFullFallback(opts: { slot_id: string; supabase: SupabaseClient; currentUserId?: string }) {
  const { slot_id, supabase, currentUserId } = opts;
  try {
    const { error } = await supabase.rpc("fn_resolve_slot_full", { p_slot_id: slot_id });
    if (error) {
      if (!isMissingRpc(error)) throw error;
    } else {
      return;
    }
  } catch (e) {
    if (!isMissingRpc(e)) throw e;
  }

  // Fallback: ส่ง resolved เบา ๆ ให้ผู้ใช้ปัจจุบัน (ไม่แก้สถานะเดิมใน DB)
  if (!currentUserId) return;
  await supabase.rpc("fn_upsert_active_notification", {
    p_user_id: currentUserId,
    p_message_name: "alert_slot_full_resolved",
    p_payload: { slot_id, timestamp: new Date().toISOString() },
    p_source: "system",
  });
}

type Props = {
  setIsLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;
  profileImage: string | null;
  setProfileImage: React.Dispatch<React.SetStateAction<string | null>>;
};

export default function ProfilePanel({ setIsLoggedIn, profileImage, setProfileImage }: Props) {
  const [openPreview, setOpenPreview] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [toast, setToast] = useState<{ open: boolean; msg: string; sev: "success" | "info" | "warning" | "error" }>({
    open: false,
    msg: "",
    sev: "info",
  });
  const navigate = useNavigate();

  const DEV_UID = (import.meta.env.VITE_DEV_AUTH_UID ?? "").trim();
  const [authUserId, setAuthUserId] = useState<string | undefined>(undefined);
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setAuthUserId(data.user?.id));
  }, []);

  const resolvedUserId = authUserId || (DEV_UID || undefined);

  // ---------- ข้อมูลโปรไฟล์จาก DB (ไม่เปลี่ยน UI/สไตล์) ----------
  type AdminProfileView = { displayName: string; roleText: string; faculty: string; jobTitle: string };
  const DEFAULT_PROFILE_VIEW: AdminProfileView = {
    displayName: "Chananchida Akkarakit",
    roleText: "Administrator",
    faculty: "Computer Engineering",
    jobTitle: "Developer",
  };
  const [profileView, setProfileView] = useState<AdminProfileView>(DEFAULT_PROFILE_VIEW);

  useEffect(() => {
    if (!resolvedUserId) return;
    let cancelled = false;
    (async () => {
      try {
        const { data, error } = await supabase.rpc("my_admin_profile");
        const p = (Array.isArray(data) ? data[0] : data) as MyAdminProfileRow | undefined;
        if (p) {
          setProfileView({
            displayName: p.display_name ?? p.name_eng ?? p.name_thai ?? DEFAULT_PROFILE_VIEW.displayName,
            roleText: p.role ? p.role.charAt(0).toUpperCase() + p.role.slice(1) : DEFAULT_PROFILE_VIEW.roleText,
            faculty: p.faculty ?? DEFAULT_PROFILE_VIEW.faculty,
            jobTitle: p.job_title ?? DEFAULT_PROFILE_VIEW.jobTitle,
          });
          return;
        }

      } catch (e) {
        console.warn("load admin profile failed:", e);
        // คงค่า DEFAULT ไว้ → UI ไม่พัง
      }
    })();
    return () => { cancelled = true; };
  }, [resolvedUserId]);
  // ⬇️ ใช้ refetch จาก hook เพื่อรีเฟรชลิสต์หลัง RPC
  const { items: notifications, markAsRead, markAllAsRead, interpolate, refetch } =
    useNotifications(resolvedUserId);

  const unreadCount = useMemo(() => notifications.filter((n) => n.status).length, [notifications]);
  const hasUnread = unreadCount > 0;
  const toggleNotification = () => setShowNotification((prev) => !prev);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem("isLoggedIn");
    setIsLoggedIn(false);
  };

  // ✅ ป้องกัน spam ด้วย cooldown
  const recentNotifications = useRef<Map<string, number>>(new Map());

  // ✅ สร้าง/อัปเดตการแจ้งเตือนผ่าน RPC (ไม่มี 409 และ atomic)
  const handleSensorError = useCallback(
    async (event: Extract<DerivedEvent, { kind: "sensor_oor" }>) => {
      console.log("📡 Sensor Out of Range Event received:", event);
      setToast({ open: true, msg: `ช่อง ${event.slot_id} อ่านค่าผิดปกติ: ${event.capacity_mm} mm`, sev: "error" });

      if (!resolvedUserId) {
        console.error("❌ User ID not resolved");
        return;
      }

      const roundedValue = Math.round(event.capacity_mm);
      const eventKey = `${resolvedUserId}-${event.slot_id}-${roundedValue}`;

      // Cooldown
      const now = Date.now();
      const lastCreated = recentNotifications.current.get(eventKey) || 0;
      const FIVE_MINUTES_MS = 5 * 60 * 1000;
      if (now - lastCreated < FIVE_MINUTES_MS) {
        console.log(`⏭️ Cooldown active for ${event.slot_id}, skipping`);
        return;
      }

      try {
        const payload = {
          slot_id: event.slot_id,
          value: String(roundedValue),
          cupboard_id: event.cupboard_id || "",
          timestamp: new Date().toISOString(),
        };

        const { error } = await supabase.rpc("fn_upsert_active_notification", {
          p_user_id: resolvedUserId,
          p_message_name: "alert_sensor_out_of_range",
          p_payload: payload,
          p_source: "system",
        });

        if (error) {
          setToast({ open: true, msg: `Error: ${error.message}`, sev: "error" });
          return;
        }

        recentNotifications.current.set(eventKey, now);
        // รีเฟรชลิสต์ทันที (กรณี RPC ทำ UPDATE จะไม่ได้ยิง event INSERT)
        await refetch?.();
      } catch (error: any) {
        const msg = error?.message || String(error);
        console.error("❌ Error:", msg, error);
        setToast({ open: true, msg: `Error: ${msg}`, sev: "error" });
      }
    },
    [resolvedUserId, refetch]
  );

  // Setup derived alerts
  useDerivedAlerts({
    topics: [
      "smartlocker/+/slot/+/status",
      "smartlocker/+/slot_id/+/status",
      "smartlocker/+/slot/+/warning",
      "smartlocker/+/slot_id/+/warning",
    ],
    onEvent: (ev) => {
      switch (ev.kind) {
        case "slot_full":
          setToast({ open: true, msg: `ช่อง ${ev.slot_id} เต็มแล้ว (~${ev.capacity_pct}%)`, sev: "warning" });
          // เขียน DB → แล้วรีเฟรชลิสต์ เพื่อให้ hasUnread = true ไอคอนขึ้น NEW
          broadcastSlotFullFallback({
            slot_id: ev.slot_id,
            cupboard_id: ev.cupboard_id,
            capacity_mm: ev.capacity_mm,
            capacity_pct: ev.capacity_pct,
            supabase,
            currentUserId: resolvedUserId,
          })
            .then(() => refetch?.())
            .catch((e) => console.error("broadcastSlotFullFallback error:", e));
          break;

        case "slot_back_to_safe":
          setToast({ open: true, msg: `ช่อง ${ev.slot_id} กลับมาปลอดภัย (~${ev.capacity_pct}%)`, sev: "info" });
          // 👉 ปิดแจ้งเตือน ถ้ามี RPC; ถ้าไม่มี ส่ง resolved แบบเบา ๆ
          resolveSlotFullFallback({ slot_id: ev.slot_id, supabase, currentUserId: resolvedUserId })
            .then(() => refetch?.())
            .catch((e) => console.error("resolveSlotFullFallback error:", e));
          break;

        case "door_open_too_long":
          setToast({ open: true, msg: `ประตูช่อง ${ev.slot_id} เปิดค้าง ${ev.open_seconds}s`, sev: "warning" });
          break;

        case "sensor_oor":
          break; // ทำงานผ่าน onSensorOor ด้านล่าง
      }
    },
    onSensorOor: handleSensorError,
  });

  return (
    <Box
      sx={{
        borderRadius: "50px",
        minHeight: 500,
        width: "auto",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        position: "relative",
      }}
    >
      <Box
        sx={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mt: 2,
          mb: 1,
        }}
      >
        <Typography variant="subtitle1" fontWeight="300" fontSize="25px" color="#133E87">
          My Profile
        </Typography>

        <Box sx={{ position: "relative" }}>
          <Box sx={{ cursor: "pointer", "&:hover": { opacity: 0.8 } }} onClick={toggleNotification}>
            {showNotification ? (
              <NotificationBellSolidIcon width={25} height={25} />
            ) : hasUnread ? (
              <NotificationBellNewIcon width={25} height={25} />
            ) : (
              <NotificationBellIcon width={25} height={25} />
            )}
          </Box>
          {unreadCount > 0 && (
            <Box
              sx={{
                position: "absolute",
                top: -6,
                right: -6,
                minWidth: 18,
                height: 18,
                px: 0.5,
                borderRadius: "999px",
                bgcolor: "#D32F2F",
                color: "#fff",
                fontSize: 11,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "2px solid #fff",
                lineHeight: 1,
              }}
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </Box>
          )}
        </Box>
      </Box>

      {showNotification && (
        <Box
          sx={{
            position: "absolute",
            top: 60,
            right: 20,
            width: 320,
            height: 420,
            bgcolor: "#133E87",
            borderRadius: 2,
            boxShadow: 6,
            color: "#fff",
            zIndex: 10,
            overflow: "hidden",
          }}
        >
          <Box sx={{ px: 2, py: 1.5, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Typography sx={{ fontWeight: 700, fontSize: 18, fontStyle: "italic" }}>Notification</Typography>
            <Button size="small" onClick={markAllAsRead} sx={{ color: "#fff", textTransform: "none" }}>
              Mark all
            </Button>
          </Box>
          <Divider sx={{ bgcolor: "rgba(255,255,255,0.2)" }} />

          <Box sx={{ height: "calc(100% - 56px)", overflowY: "auto", pr: 1 }}>
            {notifications.length === 0 ? (
              <Box sx={{ p: 3, textAlign: "center", opacity: 0.7 }}>
                <Typography>ไม่มีการแจ้งเตือน</Typography>
              </Box>
            ) : (
              notifications.map((n) => {
                const displayBody = interpolate(n.message?.body, n.payload) || n.message?.body || "ไม่มีข้อความ";
                return (
                  <Box
                    key={n.notification_id}
                    sx={{
                      p: 1.5,
                      bgcolor: n.status ? "rgba(255,255,255,0.1)" : "transparent",
                      "&:hover": { bgcolor: "rgba(255,255,255,0.2)" },
                      cursor: "pointer",
                      borderBottom: "1px solid rgba(255,255,255,0.1)",
                    }}
                    onClick={() => {
                      markAsRead(n.notification_id);
                      const link = n.payload?.link;
                      if (link) navigate(link);
                    }}
                  >
                    <Typography fontSize={15} sx={{ mb: 0.5 }}>
                      {displayBody}
                    </Typography>
                    <Typography variant="caption" sx={{ opacity: 0.8 }}>
                      {new Date(n.created_at).toLocaleString("th-TH", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </Typography>
                  </Box>
                );
              })
            )}
          </Box>
        </Box>
      )}

      <ProfileImageUploader
        profileImage={profileImage}
        setProfileImage={setProfileImage}
        onPreview={() => setOpenPreview(true)}
      />

      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        <Typography color="#133E87" fontWeight="500" fontSize="22px">
          {profileView.displayName}
        </Typography>
        <Typography fontWeight="300" fontSize="16px" variant="body2" color="text.secondary">
          {profileView.roleText}
        </Typography>

        <Box sx={{ mt: 4, mb: 3 }}>
          <Paper
            sx={{
              py: 1,
              px: 2,
              width: 320,
              height: 60,
              bgcolor: "#CBDCEB",
              borderRadius: "12px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            elevation={0}
          >
            <Box sx={{ flex: 2 }}>
              <Typography fontSize={14} color="#133E87">
                Faculty
              </Typography>
              <Typography fontWeight="bold" fontSize={14} color="#133E87">
                {profileView.faculty}
              </Typography>
            </Box>
            <Divider orientation="vertical" flexItem sx={{ mx: 2, borderColor: "#fff", borderBottomWidth: "20px" }} />
            <Box sx={{ flex: 1 }}>
              <Typography fontSize={14} color="#133E87">
                Job Title
              </Typography>
              <Typography fontWeight="bold" fontSize={14} color="#133E87">
                {profileView.jobTitle}
              </Typography>
            </Box>
          </Paper>
        </Box>

        <Button
          sx={{
            bgcolor: "#133E87",
            borderRadius: 20,
            fontStyle: "italic",
            textTransform: "none",
            fontWeight: "700",
            fontSize: 20,
            width: 200,
            height: 45,
          }}
          variant="contained"
          onClick={handleSignOut}
        >
          Sign out
        </Button>
      </Box>

      <Dialog open={openPreview} onClose={() => setOpenPreview(false)}>
        <IconButton onClick={() => setOpenPreview(false)} sx={{ position: "absolute", top: 8, right: 8 }}>
          <CloseIcon />
        </IconButton>
        <DialogContent sx={{ p: 0 }}>
          {profileImage && <img src={profileImage} alt="Profile Large" style={{ width: "100%", height: "100%" }} />}
        </DialogContent>
      </Dialog>

      <Snackbar
        open={toast.open}
        autoHideDuration={3500}
        onClose={() => setToast((v) => ({ ...v, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert severity={toast.sev} variant="filled" sx={{ width: "100%" }} onClose={() => setToast((v) => ({ ...v, open: false }))}>
          {toast.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
}
