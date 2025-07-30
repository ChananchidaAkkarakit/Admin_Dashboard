
// src/Notification/pages/NotificationAddPage.tsx

//import React from "react";
import { useNavigate } from "react-router-dom";
import NotificationForm from "../components/NotificationForm";
import { Box, Typography, Divider } from "@mui/material";
import ArrowBackIcon from "../../../../assets/icons/arrow-back.svg?react";
import { addNotification } from "../../../.././api/notifications"; // 🔁 ปรับตาม path จริงของคุณ
import SideProfilePanel from "../../../home/components/SideProfilePanel";
type NotificationAddPageProps = {
    setIsLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;
    profileImage: string | null;
    setProfileImage: React.Dispatch<React.SetStateAction<string | null>>;
};

export default function NotificationAddPage({
    setIsLoggedIn,
    profileImage,
    setProfileImage,
}: NotificationAddPageProps) {

    const navigate = useNavigate();


    const handleSubmit = async (data: any) => {
        try {
            await addNotification(data);
            navigate("/notifications/add");
        } catch (error) {
            console.error("Failed to add notification:", error);
        }
    };

    return (
        <Box
            sx={{
                display: "flex",
                flexDirection: { xs: "column", sm: "column", md: "none", lg: "row" },
                width: "100%",
            }}
        >
            {/* Column ซ้าย */}
            <Box
                sx={{
                    flex: 1,
                    width: "100%",
                    pr: { xs: 0, md: 0, lg: 3 },
                }}
            >
                {/* Header */}
                <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}>
                    <ArrowBackIcon
                        onClick={() => navigate(-1)}
                        style={{ width: 28, height: 28, cursor: "pointer" }}
                    />
                    <Typography
                        fontSize="40px"
                        fontWeight={900}
                        fontStyle="italic"
                        color="#133E87"
                    >
                        Management
                    </Typography>
                </Box>

                <Box
                    sx={{
                        borderRadius: "35px",
                        height: "55px",
                        px: 2,
                        bgcolor: "#E4EDF6",
                        border: "2px solid #CBDCEB",
                        boxShadow: "0 2px 8px 0 rgba(18, 42, 66, 0.04)",
                        alignContent: "center",
                        color: "#133E87",
                        fontSize: 16,
                    }}
                >
                    Notification Management
                </Box>
                <Divider
                    sx={{
                        mt: 3,
                        mb: 2,
                        borderColor: "#CBDCEB"
                    }}
                />

<NotificationForm mode="add" onSubmit={handleSubmit} />
            </Box>

            <SideProfilePanel
                setIsLoggedIn={setIsLoggedIn}
                profileImage={profileImage}
                setProfileImage={setProfileImage}
            />

        </Box>
    );
}