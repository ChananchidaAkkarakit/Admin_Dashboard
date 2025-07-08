import { Box } from "@mui/material";
import Sidebar from ".././feature/home/components/sidebar/Sidebar"; 
//import ProfilePanel from ".././feature/home/components/ProfilePanel"; 
import { Outlet } from "react-router-dom";

export default function MainLayout() {
  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      {/* ส่ง setIsLoggedIn ไป Sidebar หรือ ProfilePanel ถ้าต้องการ */}
      <Sidebar />
      <Box
        sx={{
          flex: 1,
          p: 5,
          pl: 0,
          bgcolor: "#D6E4EF",
          height: "100vh",
          overflowY: "auto",
        }}
      >
            <Box
              sx={{
                borderRadius: "35px",
                py: 6,
                pl: 6,
                pr: 3,
                //pr:1,
                maxWidth: "1200px",
                mx: "auto",
                height: "100%",
                bgcolor: "#fff",
              }}
            >
              <Outlet />
              </Box>
        
      </Box>
    </Box>
  );
}
