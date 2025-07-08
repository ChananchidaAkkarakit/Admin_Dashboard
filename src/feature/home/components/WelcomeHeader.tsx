import { Box, Typography } from "@mui/material";

export default function WelcomeHeader() {
  return (
    <Box sx={{ mb: 2 }}>
      <Typography fontStyle="italic" variant="h4" fontSize="48px" fontWeight="900" color="#133E87" textAlign="start">
        Welcome Back!
      </Typography>
    </Box>
  );
}
