// 📁 QrCode/components/QRmanagementItemCard.tsx
//import React from "react";
import { Box, Typography, Card } from "@mui/material";
import QRIcon from "../../../../assets/icons/qrcode.svg?react"
//import LogoIconbg from "../../../../assets/icons/droppoint-bg.svg?react";
type Props = {
  title: string;
  percentage?: number;
  status: "active" | "inactive";
  qrID: String;
  teacherName: String;
  onClick?: () => void;
};

export default function QRmanagementItemCard({ title, status, qrID, onClick }: Props) {
  const statusColor = status === "active" ? "#39B129" : "#D41E1E";
  return (

    <Card
      sx={{
        width: 130,
        height: 160,
        borderRadius: 4,
        px: 2,
        pt: 2,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        alignItems: "center",
        position: "relative",
        cursor: "pointer",
        backgroundColor: "#CBDCEB"
      }}
      onClick={onClick}
    >
      <Box
        sx={{
          position: "relative", // สำคัญ: ให้ dot อยู่ภายใน box นี้
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: 100,
          height: 25,
          backgroundColor: "#fff",
          borderRadius: 20,
          //p: 1
          //py: 1,
        }}
      >
        {/* Status Dot */}
        <Box
          sx={{
            position: "absolute",
            top: 8,
            right: 5,
            width: 10,
            height: 10,
            borderRadius: "50%",
            bgcolor: statusColor,
          }}
        />
        {/* Title */}
        <Typography pr={1.5} fontWeight={500} fontSize="10px">
          {title}
        </Typography>
      </Box>
      {/* Circular Progress */}
      {status === "active" ? (
        <Box
          mt={1}
          bgcolor="#fff"
          p={1}
          borderRadius="12px"
          width={96}
          height={96}
          display="flex"
          alignItems="center"
          justifyContent="center"
          position="relative"
        >
          {/* QR Icon */}
          <QRIcon style={{ width: 80, height: 80 }} />

          {/* วงกลมสีขาวซ้อนกลาง */}
          <Box
            sx={{
              position: "absolute",
              top: "50%", // 🔄 ตำแหน่งจากบน 50%
              left: "50%", // 🔄 จากซ้าย 50%
              transform: "translate(-50%, -50%)", // ✅ center ทั้งแกน X/Y
              width: 45,
              height: 45,
              backgroundColor: "#fff",
              borderRadius: "50%",
              zIndex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {/* ข้อความ QR บนวงกลม */}
            <Typography
              sx={{
                fontSize: "12px",
                fontWeight: 500,
                color: "#133E87",
                zIndex: 2,
              }}
            >
              {qrID}
            </Typography>
          </Box>
        </Box>

      ) : (
        <Box
          mt={1}
          width={96}
          height={96}
          bgcolor="#ffffff"
          borderRadius="12px"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          {/* กรณี inactive */}
        </Box>
      )}


      {/* Footer */}
      <Box sx={{ width: "100%", textAlign: "right" }}>
        <Typography variant="body2" color="primary" fontSize="12px">
          See all &gt;
        </Typography>
      </Box>
    </Card>
  );
}
