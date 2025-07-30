import { Box, useTheme, useMediaQuery } from "@mui/material";
import Sidebar from ".././feature/home/components/sidebar/Sidebar";
import { Outlet } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { SlotProvider } from "../feature/management/Cupboard/contexts/SlotContext"; // ✅ import ให้ถูก path

type MainLayoutProps = {
  profileImage: string | null;
  setProfileImage: React.Dispatch<React.SetStateAction<string | null>>;
};

export default function MainLayout({
  profileImage,
  setProfileImage,
}: MainLayoutProps) {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const isMediumScreen = useMediaQuery(theme.breakpoints.between("sm", "md"));

  const location = useLocation();
  const isCBManagementPage = location.pathname === "/app/management/cupboard";
  const isQRManagementPage = location.pathname === "/app/management/qr";
  

  return (
    <Box sx={{ display: "flex" }}>
      <Sidebar profileImage={profileImage} />
      <Box
        sx={{
          flex: 1,
          p: 5,
          bgcolor: "#D6E4EF",
          minHeight: "100vh",
          boxSizing: "border-box",
        }}
      >
        <Box
          sx={{
            width: "100%",
            bgcolor: "#fff",
            borderRadius: "35px",
            px: isSmallScreen ? 3 : isMediumScreen ? 4 : 6,
            pt: isSmallScreen ? 3 : isMediumScreen ? 4 : 6,
            pb: isCBManagementPage || isQRManagementPage ? 1 : 6,
            minHeight: "100%",
            boxSizing: "border-box",
            height: "auto",
          }}
        >
          {/* ✅ ครอบ Outlet ด้วย SlotProvider */}
          <SlotProvider>
            <Outlet
              context={{
                setProfileImage,
              }}
            />
          </SlotProvider>
        </Box>
      </Box>
    </Box>
  );
}
