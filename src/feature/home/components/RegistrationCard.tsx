import { Box, Typography } from "@mui/material";
import UserSettingIcon from "../../../assets/icons/user-setting.svg?react";

export default function RegistrationCard({ active }: { active: boolean }) {
  return (
    <Box
      sx={{
        bgcolor: active ? "#D6E4EF" : "#fff",
        border: active ? "2.5px solid #D6E4EF" : "2px solid #D6E4EF",
        width: 300,
        height: 210,
        borderRadius: "28px",
        textAlign: "center",
        cursor: "pointer",
        transition: "all 0.2s",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        // hover effect เฉพาะตอนที่ยังไม่ active
        "&:hover": !active
          ? {
              bgcolor: "#F4F4F4",  
              border: "2.5px solid #F4F4F4"        // ฟ้าอ่อนตอน hover
              //border: "2px solid #133E87",  // กรอบเข้มขึ้นเล็กน้อย
            }
          : {},
      }}
    >
      {/* วงกลมพื้นหลังไอคอน */}
      <Box
        sx={{
          bgcolor: active ? "#fff" : "#D6E4EF",
          color: "#133E87",
          borderRadius: "50%",
          width: 85,
          height: 85,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          mb: 1,
          //boxShadow: active ? "0 2px 8px 0#e6f2ff" : undefined,
          transition: "all 0.2s",
          
        }}
      >
        <UserSettingIcon style={{ width: 45, height: 45 }} />
      </Box>
      <Typography
        variant="h6"
        fontWeight="bold"
        fontSize="32px"
        color="#133E87"
      >
        Registration
      </Typography>
    </Box>
  );
}
