import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Typography, Divider } from "@mui/material";
import ArrowBackIcon from "../../../../assets/icons/arrow-back.svg?react";
import SideProfilePanel from "../../../home/components/SideProfilePanel";
import NotificationForm from "../components/NotificationForm";
import type { NotificationFormValues } from "../components/NotificationForm";

import { addNotification } from "../../../../api/notifications";   // ✅ ใช้ API Supabase
import { supabase } from "../../../../supabaseClient";              // ✅ ใช้คำนวณ previewId

type NotificationAddPageProps = {
  setIsLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;
  profileImage: string | null;
  setProfileImage: React.Dispatch<React.SetStateAction<string | null>>;
};

export default function NotificationAddPage({
  setIsLoggedIn,
  profileImage,
  setProfileImage,
}: NotificationAddPageProps) {
  const [previewId, setPreviewId] = useState("M--");
  const navigate = useNavigate();

  // ✅ นับจำนวนจากตาราง message (ไม่ใช่ notification)
  useEffect(() => {
    (async () => {
      try {
        const { count, error } = await supabase
          .from("message")                              // ✅ นับจาก message
          .select("*", { count: "exact", head: true });
        if (error) throw error;
        const next = (count ?? 0) + 1;
        setPreviewId(`M${String(next).padStart(2, "0")}`);
      } catch (e) {
        console.error("preview id error:", e);
        setPreviewId("M--");
      }
    })();
  }, []);

const handleSubmit = async (data: NotificationFormValues) => {
  const payload = {
    messageName: data.messageName,
    message: data.message,
    type: data.type === "warning" || data.type === "error" ? data.type : "notification" as const,
  };
  await addNotification(payload);
  alert("เพิ่มเทมเพลตสำเร็จ");
  navigate("/app/management/notification");
};


  return (
    <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "column", md: "none", lg: "row" }, width: "100%" }}>
      <Box sx={{ flex: 1, width: "100%", pr: { xs: 0, md: 0, lg: 3 } }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}>
          <ArrowBackIcon onClick={() => navigate(-1)} style={{ width: 28, height: 28, cursor: "pointer" }} />
          <Typography fontSize="40px" fontWeight={900} fontStyle="italic" color="#133E87">Management</Typography>
        </Box>

        <Box sx={{ borderRadius: "35px", height: "55px", px: 2, bgcolor: "#E4EDF6", border: "2px solid #CBDCEB",
                   boxShadow: "0 2px 8px 0 rgba(18, 42, 66, 0.04)", alignContent: "center", color: "#133E87", fontSize: 16 }}>
          Notification Management
        </Box>

        <Divider sx={{ mt: 3, mb: 2, borderColor: "#CBDCEB" }} />

        <NotificationForm previewId={previewId} mode="add" onSubmit={handleSubmit} />
      </Box>

      <SideProfilePanel setIsLoggedIn={setIsLoggedIn} profileImage={profileImage} setProfileImage={setProfileImage} />
    </Box>
  );
}
