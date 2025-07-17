import { NavLink, useLocation } from "react-router-dom";
import { Box, ListItemButton, ListItemText } from "@mui/material";

interface SidebarNavItemProps {
  to: string;
  icon: React.ReactElement;
  label: string;
}

export default function SidebarNavItem({ to, icon, label }: SidebarNavItemProps) {
  const location = useLocation();
  const path = location.pathname;

  // 🌟 เงื่อนไข active แบบ custom
  const isActive =
    (to === "/app" && (
      path === "/app" || path.startsWith("/app/userinfo") || path.startsWith("/app/management/cupboard")
    )) ||
    (to !== "/app" && path.startsWith(to));

    return (

                <ListItemButton
                    sx={{
                        display: "flex",
                        flexDirection: "row", // แนวนอน
                        justifyContent: "flexcenter",
                        alignItems: "center",
                        borderRadius: "38px",
                        height: 100, // ตั้งความสูงชัดเจน
                        px: 0,
                        backgroundColor: isActive ? "#133E87" : "transparent", // พื้นหลังปุ่ม (ฟ้าเข้ม)
                        "&:hover": {
                            backgroundColor: isActive ? "#0D3A75" : "#C0D6E9",
                        },
                    }}
                          component={NavLink}
      to={to}
                >
                    {/* Icon container */}
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width:100,
                            height: 100,
                            borderRadius: "38px",
                            backgroundColor: isActive ? "#173260" : "#ffffff",
                            color: isActive ? "#ffffff" : "#0D3A75",
                        }}
                    >
                        {icon}
                    </Box>
                    {/* ข้อความ */}
                    <ListItemText
                        primary={label}
                        primaryTypographyProps={{
                            fontSize: 17,
                            fontWeight: 500,
                            color: isActive ? "#ffffff" : "#0D3A75",
                            textAlign:"center"
                        }}
                    />
                </ListItemButton>
    );
}
