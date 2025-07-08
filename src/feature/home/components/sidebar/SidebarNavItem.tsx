import { NavLink } from "react-router-dom";
import { Box, ListItemButton, ListItemText } from "@mui/material";

interface SidebarNavItemProps {
    to: string;
    icon: React.ReactElement;
    label: string;
}

export default function SidebarNavItem({ to, icon, label }: SidebarNavItemProps) {
    return (
        <NavLink
            to={to}
            end
            style={{ display: "block", textDecoration: "none" }}
        >
            {({ isActive }) => (
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
            )}
        </NavLink>
    );
}
