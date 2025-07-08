import { Box, Typography, Paper } from "@mui/material";
import MonitoringList from "../components/MonitoringList";

export default function MonitoringPage() {
  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" mb={2}>
        📈 Monitoring
      </Typography>
      <Paper sx={{ p: 2 }}>
        <MonitoringList />
      </Paper>
    </Box>
  );
}
