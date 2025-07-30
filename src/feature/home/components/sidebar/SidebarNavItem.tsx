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


    // สำหรับปุ่ม Home โดยเฉพาะ:
    const isHomeRelated =
        to === "/app/home" &&
        (
            path.startsWith("/app/home") ||
            path.startsWith("/app/userinfo") ||
            path.startsWith("/app/management")
        );

    // กรณีทั่วไป (เมนูอื่น)
    const isGeneralMatch = to !== "/app/home" && path.startsWith(to);

    const isActive = isHomeRelated || isGeneralMatch;

    return (

        <ListItemButton
            sx={{
                display: "flex",
                flexDirection: "row", // แนวนอน
                justifyContent: "flex-center",
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
                    width: 100,
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
                    textAlign: "center"
                }}
            />
        </ListItemButton>
    );
}
