import { Box, Avatar, Typography, List } from "@mui/material";
import UserIcon from "../../../../assets/icons/user.svg?react";
import HomeIcon from "../../../../assets/icons/home.svg?react";
import MonitoringIcon from "../../../../assets/icons/monitoring.svg?react";
import SettingsIcon from "../../../../assets/icons/settings.svg?react";
import SidebarNavItem from "./SidebarNavItem"; 

export default function Sidebar() {
  return (
    <Box
      sx={{
        width: 350,
        bgcolor: "#D6E4EF",
        height: "100vh",
        px: 6,
        pt: 13,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <Avatar
      sx={{ 
        justifyContent: "center",
        alignItems: "center",
        display: "flex",
        mb: 1, 
        width: 65,
        height: 65,
        bgcolor: "#fff",
        borderRadius: 20
        }}
        >
        <UserIcon color="#133E87" style={{width: 40, height: 40}}/>
      </Avatar>
      <Typography color="#133E87" variant="body1" fontWeight="bold" mt={1} mb={3}>
        Guy Buranon
      </Typography>

<List
  sx={{
    width: "100%",
    display: "flex",
    flexDirection: "column",
    gap: 3, // ระยะห่างระหว่างปุ่ม
  }}
>

        <SidebarNavItem
          to="/app"
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
}
