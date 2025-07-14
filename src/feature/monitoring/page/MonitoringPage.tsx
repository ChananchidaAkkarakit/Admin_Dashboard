import { Box, Typography, Paper } from "@mui/material";
import MonitoringList from "../components/MonitoringList";

export default function MonitoringPage() {
  return (
    <Box>
      <Typography
        variant="h4"
        fontWeight="bold"
        mb={2}
        fontSize={{ xs: "1.5rem", md: "2rem" }}
      >
        📈 Monitoring
      </Typography>
      <Paper
        sx={{
          p: { xs: 2, md: 3 },
          width: "100%",
          boxSizing: "border-box",
        }}
      >
        <MonitoringList />
      </Paper>
    </Box>
  );
}
