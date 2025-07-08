import { Grid, Paper, Typography } from "@mui/material";

export default function MonitoringList() {
  const items = [
    { id: "001", status: "Normal", capacity: "80%" },
    { id: "002", status: "Warning", capacity: "50%" },
    { id: "003", status: "Error", capacity: "85%" },
    { id: "004", status: "Empty", capacity: "0%" },
  ];

  return (
    <Grid container spacing={2}>
      {items.map((item) => (
        <Grid item xs={12} sm={6} md={3} key={item.id}>
          <Paper sx={{ p: 2, textAlign: "center" }}>
            <Typography fontWeight="bold">Slot {item.id}</Typography>
            <Typography>Status: {item.status}</Typography>
            <Typography>Capacity: {item.capacity}</Typography>
          </Paper>
        </Grid>
      ))}
    </Grid>
  );
}
