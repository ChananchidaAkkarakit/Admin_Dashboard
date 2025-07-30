// src/Notification/pages/NotificationAddPage.tsx

import React from "react";
import { useNavigate } from "react-router-dom";
import NotificationForm from "../components/NotificationForm";
import { Box, Typography } from "@mui/material";
import ArrowBackIcon from "../../../../assets/icons/arrow-back.svg?react";
import { addNotification } from "../../../.././api/notifications"; // 🔁 ปรับตาม path จริงของคุณ

export default function NotificationAddPage() {
  const navigate = useNavigate();

  const handleSubmit = async (data: any) => {
    try {
      await addNotification(data);
      navigate("/notifications/add");
    } catch (error) {
      console.error("Failed to add notification:", error);
    }
  };

  return (
    <Box p={3}>
      <Box display="flex" alignItems="center" gap={2} mb={2}>
                  <ArrowBackIcon
            onClick={() => navigate(-1)}
            style={{ width: 28, height: 28, cursor: "pointer" }}
          />
        <Typography variant="h5" fontWeight={700} color="primary">
          เพิ่ม Notification ใหม่
        </Typography>
      </Box>

      <NotificationForm mode="add" onSubmit={handleSubmit} />
    </Box>
  );
}
