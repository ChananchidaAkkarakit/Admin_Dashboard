// import { Box, Typography, Paper } from "@mui/material";
// import MonitoringList from "../components/MonitoringList";

// export default function MonitoringPage() {
//   return (
//     <Box>
//       <Typography
//         variant="h4"
//         fontWeight="bold"
//         mb={2}
//         fontSize={{ xs: "1.5rem", md: "2rem" }}
//       >
//         📈 Monitoring
//       </Typography>
//       <Paper
//         sx={{
//           p: { xs: 2, md: 3 },
//           width: "100%",
//           boxSizing: "border-box",
//         }}
//       >
//         <MonitoringList />
//       </Paper>
//     </Box>
//   );
// }
//import React from "react";
import { Box, Typography, Grid, Button, Card, CardContent } from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function MonitoringOverviewPage() {
  const navigate = useNavigate();

  return (
    <Box>
      <Typography         fontSize="40px"
        fontWeight={900}
        fontStyle="italic"
        color="#133E87"
        mb={4}
      >
        Monitoring
      </Typography>

      {/* 📊 สถิติรวม */}
      <Grid container spacing={3}>
        {[
          { label: "Slot ทั้งหมด", value: 24 },
          { label: "Active", value: 22 },
          { label: "Offline", value: 2 },
          { label: "อาจารย์ทั้งหมด", value: 12 },
          { label: "QR ใช้งาน", value: "45 / 60" },
        ].map((item, i) => (
          <Grid item xs={12} sm={6} md={4} key={i}>
            <Card elevation={3} sx={{ borderRadius: 3 }}>
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
          onClick={() => navigate("/monitoring/slot-details")}
          sx={{
            borderRadius: "25px",
            fontSize: "15px",
            fontWeight: "bold",
            px: 5,
            py: 1,
            textTransform: "none",
          }}
        >
          ดูข้อมูลตู้ทั้งหมด
        </Button>
        {/* <Button
          variant="outlined"
          onClick={() => navigate("/monitoring/qr-details")}
                    sx={{
            borderRadius: "25px",
            fontSize: "15px",
            fontWeight: "bold",
            px: 5,
            py: 1,
            textTransform: "none",
          }}
        >
          ดู QR Codes
        </Button> */}

        <Button
          variant="outlined"
          onClick={() => navigate("/monitoring/login-details")}
                    sx={{
            borderRadius: "25px",
            fontSize: "15px",
            fontWeight: "bold",
            px: 5,
            py: 1,
            textTransform: "none",
          }}
        >
          ดูประวัติการเข้าสู่ระบบ
        </Button>
      </Box>

      {/* ⚠️ ความผิดปกติ */}
      <Box mt={6}>
        <Typography variant="h6" fontWeight={700} color="error" gutterBottom>
          ความผิดปกติล่าสุด
        </Typography>
        <Box pl={2}>
          <Typography>🔴 SC104 Offline มากกว่า 18 นาที</Typography>
          <Typography>🟡 QR T002 ถูกใช้นอกเวลา</Typography>
        </Box>
      </Box>
    </Box>
  );
}