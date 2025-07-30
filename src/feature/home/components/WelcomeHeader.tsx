import { Box, Typography } from "@mui/material";

export default function WelcomeHeader() {
  return (
    <Box sx={{ mb: 2, }}>
      <Typography
        fontStyle="italic"
        variant="h4"
        fontSize="clamp(25px, 4vw, 48px)"
        fontWeight="900"
        color="#133E87"
        sx={{
          textAlign: {
            xs: "center",
            sm: "center",
            md: "start",
            lg: "start"  // จอใหญ่
          },
        }}
      >
        Welcome Back!
      </Typography>

    </Box>
  );
}
