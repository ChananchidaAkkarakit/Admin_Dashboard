import { Grid, Paper, Typography } from "@mui/material";

export default function MonitoringList() {
  const items = [
    { id: "001", status: "Normal", capacity: "80%" },
    { id: "002", status: "Warning", capacity: "50%" },
    { id: "003", status: "Error", capacity: "85%" },
    { id: "004", status: "Empty", capacity: "0%" },
  ];

  return (
    <Grid container spacing={{ xs: 2, md: 3 }}>
      {items.map((item) => (
        <Grid
          item
          xs={12}
          sm={6}
          md={5}
          key={item.id}
        >
          <Paper
            sx={{
              p: { xs: 4, sm: 6 },
              textAlign: "center",
              height: "100%",
              minWidth: 0,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >

            <Typography
              fontWeight="bold"
              fontSize={{ xs: "1.1rem", md: "1.3rem" }}
              mb={1}
            >
              Slot {item.id}
            </Typography>
            <Typography
              fontSize={{ xs: "0.9rem", md: "1rem" }}
            >
              Status: {item.status}
            </Typography>
            <Typography
              fontSize={{ xs: "0.9rem", md: "1rem" }}
            >
              Capacity: {item.capacity}
            </Typography>
          </Paper>
        </Grid>
      ))}
    </Grid>
  );
}
