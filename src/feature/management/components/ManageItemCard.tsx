import { Box, Typography, Card, CircularProgress } from "@mui/material";
//import { Grid } from "antd";

interface ItemCardProps {
  title: string;
  percentage?: number;
  status: "active" | "inactive";
  onClick?: () => void;
}

export default function ManageItemCard({ title, percentage, status, onClick }: ItemCardProps) {
  const statusColor = status === "active" ? "green" : "red";

  return (
    <Card
      sx={{
        width: 160,
        height: 200,
        borderRadius: 4,
        p: 2,
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
          width: 120,
          backgroundColor: "#fff",
          borderRadius: 20,
          p: 1
          //py: 1,
        }}
      >
        {/* Status Dot */}
        <Box
          sx={{
            position: "absolute",
            top: 14,
            right: 10,
            width: 12,
            height: 12,
            borderRadius: "50%",
            bgcolor: statusColor,
          }}
        />
        {/* Title */}
        <Typography fontWeight={600} fontSize="1rem">
          {title}
        </Typography>
      </Box>

      {/* Circular Progress */}
      {percentage !== undefined ? (
        <Box position="relative" display="inline-flex">
          <CircularProgress variant="determinate" value={percentage} size={60} />
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
              padding: 2
            }}
          >
            <Typography variant="caption" fontSize="1rem" fontWeight={600}>
              {percentage}%
            </Typography>
          </Box>
        </Box>
      ) : (
        <Typography variant="caption" color="text.secondary">
          No data
        </Typography>
      )}

      {/* Footer */}
      <Typography variant="body2" color="primary" fontSize="0.75rem">
        See all &gt;
      </Typography>
    </Card>
  );
}
