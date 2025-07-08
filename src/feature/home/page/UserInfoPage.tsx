//import React from "react";
import { useLocation } from "react-router-dom";
import { Box, Typography, Divider } from "@mui/material";
import UserIcon from "../../../assets/icons/user.svg?react";

interface UserItem {
  id: number;
  role: "teacher" | "student";
  nameThai: string;
  nameEng: string;
  tel?: string | null;
  email?: string | null;
  subjects?: string[];
  studentId?: string;
}

export default function ReviewPage() {
  const { state } = useLocation() as { state: UserItem };

  if (!state) {
    return (
      <Box p={4}>
        <Typography color="error">ไม่พบข้อมูล (โปรดลองค้นหาใหม่)</Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        p: 4,
        borderRadius: 3,
        maxWidth: 700,
        mx: "auto",
        bgcolor: "#F3F6F9",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
        <Box
          sx={{
            width: 70,
            height: 70,
            bgcolor: "#fff",
            borderRadius: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            mr: 2,
          }}
        >
          <UserIcon style={{ width: 40, height: 40, color: "#133E87" }} />
        </Box>
        <Box>
          <Typography variant="h6" fontWeight="bold">
            {state.nameThai}
          </Typography>
          <Typography>{state.nameEng}</Typography>
        </Box>
      </Box>

      <Divider sx={{ my: 2 }} />

      {state.role === "student" && (
        <Typography><b>Student ID:</b> {state.studentId}</Typography>
      )}

      {state.role === "teacher" && (
        <Box>
          <Typography fontWeight="500">Subjects:</Typography>
          {state.subjects?.map((s) => (
            <Typography key={s}>- {s}</Typography>
          ))}
        </Box>
      )}

      <Box mt={2}>
        <Typography fontWeight="500">Contact:</Typography>
        <Typography>Tel: {state.tel ?? "-"}</Typography>
        <Typography>Email: {state.email ?? "-"}</Typography>
      </Box>
    </Box>
  );
}
