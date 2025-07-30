// src/feature/management/Notification/pages/NotificationEditPage.tsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Box, Typography, Divider } from "@mui/material";
import ArrowBackIcon from "../../../../assets/icons/arrow-back.svg?react";
import NotificationForm from "../components/NotificationForm";
import { fetchNotificationsById, updateNotification } from "../../../../api/notifications";
import SideProfilePanel from "../../../home/components/SideProfilePanel";


type NotificationEditPageProps = {
    setIsLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;
    profileImage: string | null;
    setProfileImage: React.Dispatch<React.SetStateAction<string | null>>;
};

export default function NotificationEditPage({
    setIsLoggedIn,
    profileImage,
    setProfileImage,
}: NotificationEditPageProps) {
    const { id } = useParams();
    const navigate = useNavigate();
    const [initialData, setInitialData] = useState<any>(null);

    useEffect(() => {
        if (id) {
            fetchNotificationsById(id).then(setInitialData);
        }
    }, [id]);

    const handleSubmit = async (data: any) => {
        await updateNotification(id!, data);
        navigate("/notifications/edit"); // ✅ กลับหน้าหลัก
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

                {initialData && (
                    <NotificationForm
                        mode="edit"
                        onSubmit={handleSubmit}
                        initialData={initialData}
                    />
                )}
            </Box>

            <SideProfilePanel
                setIsLoggedIn={setIsLoggedIn}
                profileImage={profileImage}
                setProfileImage={setProfileImage}
            />

        </Box>
    );
}
