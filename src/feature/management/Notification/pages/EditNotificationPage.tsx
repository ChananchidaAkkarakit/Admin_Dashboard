import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Box, Typography, Divider, CircularProgress, Button, Stack } from "@mui/material";
import ArrowBackIcon from "../../../../assets/icons/arrow-back.svg?react";
import NotificationForm from "../components/NotificationForm";
import type { NotificationFormValues } from "../components/NotificationForm";
import { fetchNotificationsById, updateNotification, sendNotificationToRole } from "../../../../api/notifications";
import SideProfilePanel from "../../../home/components/SideProfilePanel";

type NotificationEditPageProps = {
  setIsLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;
  profileImage: string | null;
  setProfileImage: React.Dispatch<React.SetStateAction<string | null>>;
};

export default function NotificationEditPage({
  setIsLoggedIn,
  profileImage,
  setProfileImage,
}: NotificationEditPageProps) {

  const { id } = useParams();
  const navigate = useNavigate();
  const [initialData, setInitialData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function run() {
      if (!id) return;
      setLoading(true);
      try {
        const data = await fetchNotificationsById(id); // ✅ id = messageId
        if (active) {
          // ✅ map ให้ตรงกับฟอร์ม โดยไม่เปลี่ยน UI
          setInitialData({
            messageId: data.messageId,
            messageName: data.messageName,
            message: data.message,
            type: data.type === "info" ? "notification" : data.type,
            source: data.source,
            status: data.status,
          });
        }
      } finally {
        if (active) setLoading(false);
      }
    }
    run();
    return () => { active = false; };
  }, [id]);

  const handleSubmit = async (data: NotificationFormValues) => {
    // ✅ map type กลับก่อนอัปเดต
    const payload = {
      ...data,
      type: data.type === "notification" ? "info" : data.type,
    };
    await updateNotification(id!, data as any); // ✅ id = messageId
    navigate("/app/management/notification");
  };
  // ✅ ส่งแจ้งเตือนตาม role (สคีมา: 'teacher' | 'student')
  const handleQuickSend = async (role: "teacher" | "student") => {
    try {
      if (!initialData?.messageId) return alert("ไม่พบ messageId ของเทมเพลต");
      await sendNotificationToRole(initialData.messageId, role);
      alert(role === "teacher" ? "ส่งแจ้งเตือนให้อาจารย์แล้ว" : "ส่งแจ้งเตือนให้นักศึกษาแล้ว");
    } catch (e) {
      console.error(e);
      alert("ส่งแจ้งเตือนไม่สำเร็จ");
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: { xs: "column", sm: "column", md: "none", lg: "row" },
        width: "100%",
      }}
    >
      <Box sx={{ flex: 1, width: "100%", pr: { xs: 0, md: 0, lg: 3 } }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}>
          <ArrowBackIcon
            onClick={() => navigate(-1)}
            style={{ width: 28, height: 28, cursor: "pointer" }}
          />
          <Typography fontSize="40px" fontWeight={900} fontStyle="italic" color="#133E87">
            Management
          </Typography>
        </Box>

        <Box
          sx={{
            borderRadius: "35px",
            height: "55px",
            px: 2,
            bgcolor: "#E4EDF6",
            border: "2px solid #CBDCEB",
            boxShadow: "0 2px 8px 0 rgba(18, 42, 66, 0.04)",
            alignContent: "center",
            color: "#133E87",
            fontSize: 16,
          }}
        >
          Notification Management
        </Box>

        <Divider sx={{ mt: 3, mb: 2, borderColor: "#CBDCEB" }} />

        {loading ? (
          <Box display="flex" alignItems="center" justifyContent="center" py={4} gap={1}>
            <CircularProgress size={22} />
            <Typography>Loading…</Typography>
          </Box>
        ) : initialData ? (
          <>
            <NotificationForm mode="edit" onSubmit={handleSubmit} initialData={initialData} />
            {/* แอดปุ่มเฉพาะตรงนี้ ไม่แตะ UI อื่น */}
            <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
              <Button variant="contained" onClick={() => handleQuickSend("teacher")}>
                ส่งให้อาจารย์
              </Button>
              <Button variant="outlined" onClick={() => handleQuickSend("student")}>
                ส่งให้นักศึกษา
              </Button>
            </Stack>
          </>
        ) : (
          <Typography color="error" fontStyle="italic">
            Not found.
          </Typography>
        )}
      </Box>

      <SideProfilePanel
        setIsLoggedIn={setIsLoggedIn}
        profileImage={profileImage}
        setProfileImage={setProfileImage}
      />
    </Box>
  );
}
