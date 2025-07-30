import { Box, Typography, Card, CircularProgress } from "@mui/material";
//import { Flex } from "antd";
//import { Grid } from "antd";

interface ItemCardProps {
  title: string;
  percentage?: number;
  status: "active" | "inactive";
  onClick?: () => void;
}

export default function ManageItemCard({ title, percentage, status, onClick }: ItemCardProps) {
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
            right: 10,
            width: 10,
            height: 10,
            borderRadius: "50%",
            bgcolor: statusColor,
          }}
        />
        {/* Title */}
        <Typography fontWeight={500} fontSize="13px">
          {title}
        </Typography>
      </Box>
      {/* Circular Progress */}
      {status === "active" && percentage !== undefined ? (
        <Box
          mt={1}
          bgcolor="#fff"
          p={2}
          borderRadius="12px"
          position="relative"
          display="inline-flex"
        >
          <Box
            bgcolor="#CBDCEB"
            p={1.5}
            display="flex"
            borderRadius="100%"
            position="relative"
          >
            {/* วงล่าง - track สีขาว/เทาอ่อน */}
            <CircularProgress
              thickness={3}
              variant="determinate"
              value={100}
              size={40}
              sx={{ color: "#ffffff" }} // ซ้อนวงล่างเป็นสีขาวหรือเทาอ่อน
            />
            {/* วงบน - ค่าจริง */}
            <CircularProgress
              thickness={3}
              variant="determinate"
              value={percentage}
              size={40}
              sx={{
                color: "#133E87", // สีหลักของ progress
                position: "absolute",
                display: "flex",
                //left: 0,
                //top: 0,
              }}
            />
            {/* ตัวเลขกลางวง */}
            <Box
              sx={{
                top: 0,
                left: 0,
                bottom: 0,
                right: 0,
                position: "absolute",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Typography
                variant="caption"
                fontSize="12px"
                fontStyle="italic"
                fontWeight={600}
              >
                {percentage}%
              </Typography>
            </Box>
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
          {/* คุณอาจใส่ข้อความกำกับเช่น "Off" หรือปล่อยว่างก็ได้ */}
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
