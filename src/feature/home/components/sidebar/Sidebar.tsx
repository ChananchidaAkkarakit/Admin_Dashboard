import { useState } from "react";
import {
  Box,
  Typography,
  List,
  IconButton,
  Drawer,
  useMediaQuery,
} from "@mui/material";
import MenuIcon from "../../../../assets/icons/menu.svg?react";
import CloseIcon from "@mui/icons-material/Close";
import UserIcon from "../../../../assets/icons/user.svg?react";
import HomeIcon from "../../../../assets/icons/home.svg?react";
import MonitoringIcon from "../../../../assets/icons/monitoring.svg?react";
import SettingsIcon from "../../../../assets/icons/settings.svg?react";
//import EditPenIcon from "../../../../assets/icons/edit-pen.svg?react";
import SidebarNavItem from "./SidebarNavItem";
//import ProfilePanel from "../ProfilePanel"


type SidebarProps = {
  profileImage: string | null;
};

export default function Sidebar({ profileImage }: SidebarProps) {


  const [open, setOpen] = useState(false);
  const [showCloseButton, setShowCloseButton] = useState(false);
  const [showMenuButton, setShowMenuButton] = useState(true);


  const handleOpen = () => {
    setShowMenuButton(false); // ซ่อนปุ่มเมนูทันที
    setOpen(true);
    setTimeout(() => setShowCloseButton(true), 175);
  };

  const handleClose = () => {
    setShowCloseButton(false);
    setOpen(false);
    // หลัง Drawer ปิดแล้ว ค่อยๆเฟดปุ่มเมนูกลับมา
    setTimeout(() => setShowMenuButton(true), 100);
  }


  const isSmallScreen = useMediaQuery("(max-width:900px)");
  //const [profileOpen, setProfileOpen] = useState(false);
  const sidebarContent = (

    <Box
      sx={{
        width: 350,
        bgcolor: "#D6E4EF",
        minHeight: "100vh",
        pl: {
          xs: 6,   // จอเล็ก
          // sm: 6,
          md: 6
        },   // จอเล็กขึ้นมาหน่อย}
        pr: {
          xs: 6,   // จอเล็ก
          // sm: 6,
          md: 1
        },   // จอเล็กขึ้นมาหน่อย}
        pt: 13,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      {/* <Sidebar profileImage={profileImage} /> */}
      {/* ✅ Avatar Profile */}
      <Box
        sx={{
          justifyContent: "center",
          alignItems: "center",
          display: "flex",
          mb: 1,
          width: 65,
          height: 65,
          bgcolor: "#fff",
          borderRadius: 20,
          overflow: "hidden",
        }}
      >
        {profileImage ? (
          <img
            src={profileImage}
            alt="Profile"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        ) : (
          <UserIcon style={{ width: 40, height: 40 }} />
        )}
      </Box>


      <Box
        sx={{
          display: "flex",
          alignItems: "center",      // เรียงกลางแนวตั้ง
          gap: 1,                     // ระยะห่างระหว่างข้อความกับไอคอน
          mt: 1,
          mb: 3,
        }}
      >
        <Typography
          color="#133E87"
          variant="body1"
          fontWeight="bold"
        >
          Guy Buranon
        </Typography>
        {/* ถ้าเป็น SVG React Component ที่ใช้ style + sx ไม่ได้ ให้ wrap ด้วย <Box> */}
        {/* <Box
  sx={{ display: { xs: "block", md: "none" } }}
  onClick={() => setProfileOpen(true)}
>
  <EditPenIcon
    color="#7A7A7A"
    style={{ width: 18, height: 18 }}
  /> */}
        {/* </Box> */}

      </Box>

      <List
        sx={{
          width: "100%",
          display: "flex",
          flexDirection: "column",
          gap: 3,
          m:4
        }}
      >
        <SidebarNavItem
          to="/app/home"
          icon={<HomeIcon style={{ width: 40, height: 40 }} />}
          label="Home"
        />

        <SidebarNavItem
          to="/app/monitoring"
          icon={<MonitoringIcon style={{ width: 40, height: 40 }} />}
          label="Monitoring"
        />
        <SidebarNavItem
          to="/app/settings"
          icon={<SettingsIcon style={{ width: 40, height: 40 }} />}
          label="Settings"
        />
      </List>
    </Box>
  );

  return (

    <>
      {/* ปุ่ม Menu */}
      {isSmallScreen && (
        <IconButton
          onClick={handleOpen}
          sx={{
            position: "fixed",
            top: 55,
            left: 45,
            zIndex: 1301,
            color: "#133E87",
            opacity: showMenuButton ? 1 : 0,
            pointerEvents: showMenuButton ? "auto" : "none",
            transition: "opacity 0.1s ease",
            "&:hover": { color: "#133E87" },
          }}
        >
          <MenuIcon style={{ width: 30, height: 30 }} />
        </IconButton>
      )}

      {/* ปุ่ม Close */}
      {isSmallScreen && (
        <IconButton
          onClick={handleClose}
          sx={{
            position: "fixed",
            top: 10,
            left: 300,
            zIndex: 1301,
            color: "#133E87",
            bgcolor: "transparent",
            opacity: showCloseButton ? 1 : 0,
            pointerEvents: showCloseButton ? "auto" : "none",
            transition: "opacity 0.1s ease",
            "&:hover": { bgcolor: "transparent" },
          }}
        >
          <CloseIcon />
        </IconButton>
      )}

      {/* Drawer */}
      {isSmallScreen ? (
        <Drawer
          anchor="left"
          open={open}
          onClose={() => setOpen(false)}
          variant="temporary"
          PaperProps={{ sx: { bgcolor: "#D6E4EF", width: 350 } }}
        >
          {sidebarContent}
        </Drawer>
      ) : (
        sidebarContent
      )}

      {/* Drawer Profile Panel ด้านขวา */}
      {/* <Drawer
        anchor="right"
        open={profileOpen}
        onClose={() => setProfileOpen(false)}
        variant="temporary"
        PaperProps={{
          sx: { width: { xs: "100%", sm: 450 }, bgcolor: "#D6E4EF" }
        }}
      >
        <Box
          sx={{
            p: 3,
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          <ProfilePanel setIsLoggedIn={setIsLoggedIn} />
        </Box>
      </Drawer> */}
    </>
  );
}
