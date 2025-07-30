import {
  Paper,
  Box,
  Typography,
  Grid,
  useTheme,
  useMediaQuery
} from "@mui/material";
import LogoIcon from "../assets/icons/droppoint-illustration.svg?react";
import LogoIconbg from "../assets/icons/droppoint-bg.svg?react";
import { Outlet } from "react-router-dom";

export default function AuthLayout() {
  const theme = useTheme();
  const isLg = useMediaQuery(theme.breakpoints.up("lg"));
  const isMd = useMediaQuery(theme.breakpoints.between("md", "lg"));
  const isSm = useMediaQuery(theme.breakpoints.between("sm", "md"));

  // ปรับขนาด Icon ตาม breakpoint
  let iconSize = 500;
  if (isLg) iconSize = 700;
  else if (isMd) iconSize = 450;
  else if (isSm) iconSize = 350;

  return (
    <Box sx={{ width: "100vw", height: "100vh", backgroundColor: "#D6E4EF", px: 10 }}>
      <Grid container sx={{ width: "100%", height: "100%" }}>
        {/* จอใหญ่ (md) */}
        <Grid
          item
          xs={12}
          md={6}
          sx={{
            display: { xs: "none", md: "flex" },
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "column",
            backgroundColor: "#D6E4EF",
            textAlign: "center",
            //pl: 5,
            pr: 5,
          }}
        >
          <Paper
            //elevation={200}
            sx={{
              borderRadius: "24px",
              p: 5,
              pt: 13,
              width: "100%",
              minWidth: 400,
              maxWidth: 500,
              height: "100%",
              maxHeight: 650,
              backgroundColor: "#ffffff",
              boxShadow: "0px 10px 20px rgba(0,0,0,0.1)",
            }}
          >
            <Box ml={0} display="flex" alignItems="center" gap={2} mb={0}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  overflow: "hidden",
                }}
              >
                <LogoIconbg width={40} height={40} />
              </Box>
              <Typography fontWeight="900" color="#1a237e" fontSize={20}>
                DropPoint.
              </Typography>
            </Box>

            <Box display="flex" alignItems="center" gap={1} mb={2}>
              <Typography fontWeight="700" fontSize={60} color="#1a237e" ml={3}>
                Sign in
              </Typography>
            </Box>

            <Outlet />
          </Paper>
        </Grid>

        {/* จอเล็ก (xs) */}
        <Grid
          item
          xs={12}
          md={6}
          sx={{
            display: { xs: "flex", md: "none" },
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "column",
            backgroundColor: "#D6E4EF",
            textAlign: "center",
            p: 2,
          }}
        >
          <Box
            sx={{
              width: "100%",
              minWidth: 300,
              maxWidth: 400,
              bgcolor: "#ffffff",
              borderRadius: 3,
              p: 3,
              boxShadow: "0px 10px 20px rgba(0,0,0,0.1)",
            }}
          >
            <Box display="flex" alignItems="center" justifyContent="start" gap={1} mb={2}>
              <Box
                sx={{
                  width: 30,
                  height: 30,
                  borderRadius: "50%",
                  overflow: "hidden",
                }}
              >
                <LogoIconbg width={30} height={30} />
              </Box>
              <Typography fontWeight="800" color="#1a237e" fontSize={20}>
                DropPoint.
              </Typography>
            </Box>

            <Typography fontWeight="700" fontSize={32} color="#1a237e" mb={2}>
              Sign in
            </Typography>

            <Outlet />
          </Box>
        </Grid>

        {/* จอใหญ่ Illustration */}
        <Grid
          item
          xs={10}
          md={6}
          sx={{
            //pr: 15,
            display: { xs: "none", md: "flex" },
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "column",
            backgroundColor: "#D6E4EF",
            textAlign: "center",
          }}
        >
          <LogoIcon width={iconSize} height={iconSize} />
        </Grid>
      </Grid>
    </Box>
  );
}
