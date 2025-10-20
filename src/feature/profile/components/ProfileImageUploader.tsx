// components/profile/ProfileImageUploader.tsx
import { useRef, useState, useEffect } from "react";
import { Box, Menu, MenuItem, Tooltip } from "@mui/material";
import CameraIcon from "../../../assets/icons/camera.svg?react";
import DeleteIcon from "../../../assets/icons/bin.svg?react";
import VisibilityIcon from "../../../assets/icons/eye.svg?react";
import EditIcon from "../../../assets/icons/gallery.svg?react";

interface Props {
    profileImage: string | null;
    setProfileImage: (url: string | null) => void;
    onPreview: () => void;
}

export default function ProfileImageUploader({ profileImage, setProfileImage, onPreview }: Props) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);

    useEffect(() => {
        const savedImage = localStorage.getItem("profileImage");
        if (savedImage) {
            setProfileImage(savedImage);
        }
    }, []);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64 = reader.result as string;
                setProfileImage(base64);
                localStorage.setItem("profileImage", base64);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveImage = () => {
        setProfileImage(null);
        localStorage.removeItem("profileImage"); // ลบจาก localStorage ด้วย
    };

    const handleChangeImage = () => {
        fileInputRef.current?.click();
        setMenuAnchorEl(null);
    };

    const handleOpenMenu = (e: React.MouseEvent<HTMLElement>) => {
        profileImage ? setMenuAnchorEl(e.currentTarget) : fileInputRef.current?.click();
    };

    return (
        <>
            <Tooltip title={profileImage ? "จัดการรูปโปรไฟล์" : "เลือกรูปโปรไฟล์"}>
                <Box sx={{
                    m: 2
                }}>
                    <Box
                        onClick={handleOpenMenu}
                        sx={{
                            width: 75,
                            height: 75,
                            bgcolor: "#fff",
                            border: profileImage ? "none" : "2px solid #608BC1",
                            borderRadius: "50%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: "pointer",
                            overflow: "hidden",
                            transition: "all 0.3s ease",
                            "&:hover": { bgcolor: "#f0f4fa" },

                        }}

                    >
                        {profileImage ? (
                            <img src={profileImage} alt="Profile" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }} />
                        ) : (
                            <CameraIcon style={{ width: 35, height: 35 }} />
                        )}
                    </Box>
                </Box>
            </Tooltip>
            <Menu
                MenuListProps={{
                    disablePadding: true, // ✅ ปิด padding 8px
                }}
                anchorEl={menuAnchorEl}
                open={Boolean(menuAnchorEl)}
                onClose={() => setMenuAnchorEl(null)}
                anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
                transformOrigin={{ vertical: "top", horizontal: "center" }}
                PaperProps={{
                    sx: {
                        minWidth: 160, boxShadow: "0 2px 8px rgba(0,0,0,0.20)", borderRadius: 3, overflow: "hidden",
                    }
                }}
            >
                <MenuItem onClick={onPreview}
                    sx={{
                        py: 1,
                        color: "#7A7A7A", // สีฟ้าเข้ม
                        "&:hover": {
                            bgcolor: "#ECF6FF",
                            fontWeight: "500",
                        },
                    }}>
                    <VisibilityIcon style={{ width: 20, height: 20, marginRight: 8, }} />View</MenuItem>
                <MenuItem onClick={handleChangeImage}
                    sx={{
                        py: 1,
                        color: "#7A7A7A", // สีฟ้าเข้ม
                        "&:hover": {
                            bgcolor: "#ECF6FF",
                            fontWeight: "500",
                        },
                    }}>
                    <EditIcon style={{ width: 20, height: 20, marginRight: 8 }} />Edit</MenuItem>
                <MenuItem onClick={handleRemoveImage}
                    sx={{
                        py: 1,
                        color: (theme) => theme.palette.error.main,
                        "&:hover": {
                            bgcolor: (theme) => theme.palette.error.main,
                            color: "#fff",
                            fontWeight: "500",
                        },
                    }}>
                    <DeleteIcon style={{ width: 20, height: 20, marginRight: 8 }} />Delete</MenuItem>
            </Menu>
            <input type="file" ref={fileInputRef} accept="image/*" style={{ display: "none" }} onChange={handleFileChange} />
        </>
    );
}
