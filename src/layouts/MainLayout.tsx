import { Box, useTheme, useMediaQuery } from "@mui/material";
import Sidebar from ".././feature/home/components/sidebar/Sidebar";
import { Outlet } from "react-router-dom";

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
            p: isSmallScreen ? 3 : isMediumScreen ? 4 : 6,
            minHeight: "100%",
            boxSizing: "border-box",
            height: "auto",
          }}
        >
          {/* 💡 Important: ส่ง context ของ props ต่อให้ Outlet */}
          <Outlet
            context={{
              setProfileImage, // ✅ ทำให้ Outlet สามารถใช้ได้
            }}
          />
        </Box>
      </Box>
    </Box>
  );
}
