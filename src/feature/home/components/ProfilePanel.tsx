import {
  Box, Menu, MenuItem, Tooltip, Typography, Divider, Button, Grid, Paper, useTheme, useMediaQuery,
} from "@mui/material";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
//import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import CameraIcon from "../../../assets/icons/camera.svg?react";
import DeleteIcon from "../../../assets/icons/bin.svg?react";
import VisibilityIcon from "../../../assets/icons/eye.svg?react";
import EditIcon from "../../../assets/icons/gallery.svg?react";
//import DeleteIcon from "@mui/icons-material/Delete";


type ProfilePanelProps = {
  setIsLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;
  profileImage: string | null;
  setProfileImage: React.Dispatch<React.SetStateAction<string | null>>;
};


export default function ProfilePanel({
  setIsLoggedIn,
  profileImage,
  setProfileImage,
}: ProfilePanelProps) {
  const theme = useTheme();
  const isLarge = useMediaQuery(theme.breakpoints.up("lg"));
  const navigate = useNavigate();
  const handleSignOut = () => {
    localStorage.removeItem("isLoggedIn");
    setIsLoggedIn(false);
    navigate("/");
  };
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [openPreview, setOpenPreview] = useState(false);
  //const [menuPosition, setMenuPosition] = useState<{ top: number; left: number } | null>(null);

  // ...


  const handleOpenPreview = () => {
    setOpenPreview(true);
  };



  const handleClosePreview = () => {
    setOpenPreview(false);
  };

  // const handleUploadClick = () => {
  //   if (profileImage) {
  //     // มีรูปแล้ว: เปิดเมนู
  //     return;
  //   }
  //   // ยังไม่มีรูป: เปิดไฟล์
  //   fileInputRef.current?.click();
  // };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setProfileImage(imageUrl);
    }
  };

  const handleRemoveImage = () => {
    setProfileImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    //setMenuAnchorEl(null); // ปิดเมนู
  };

  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>) => {
    if (profileImage) {
      setMenuAnchorEl(event.currentTarget);
    } else {
      fileInputRef.current?.click();
    }
  };



  // const handleCloseMenu = () => {
  //   setMenuAnchorEl(null);
  // };

  const handleChangeImage = () => {
    fileInputRef.current?.click();
  };


  if (!isLarge) return null;


  return (
    <>
      <Box
        sx={{
          borderRadius: "50px",
          minHeight: 500,
          width: "auto",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        {/* My Profile */}
        <Typography
          variant="subtitle1"
          fontWeight="300"
          fontSize="25px"
          mt={2}
          mb={1}
          alignSelf="flex-start"
          color="#133E87"
        >
          My Profile
        </Typography>

        <Grid sx={{ p: 2 }}>
          <Tooltip title={profileImage ? "จัดการรูปโปรไฟล์" : "เลือกรูปโปรไฟล์"}>
            <Box
              onClick={handleOpenMenu}
              sx={{
                bgcolor: "#fff",
                //p: 2,
                border: profileImage ? "none" : "2px solid #608BC1",
                borderRadius: "100%",
                width: 75,
                height: 75,
                alignItems: "center",
                display: "flex",
                justifyContent: "center",
                cursor: "pointer",
                overflow: "hidden",
                transition: "all 0.3s ease",
                "&:hover": {
                  bgcolor: "#f0f4fa",
                  //boxShadow: "0 0 0 3px #608BC1",
                },
              }}
            >
              {profileImage ? (
                <img
                  src={profileImage}
                  alt="Profile"
                  style={{
                    width: "100%",
                    height: "100%",
                    borderRadius: "50%",
                    objectFit: "cover",
                  }}
                />
              ) : (
                <CameraIcon color="#CBDCEB" style={{ width: 35, height: 35 }} />
              )}
            </Box>
          </Tooltip>

          {/* Menu */}
          <Menu
            anchorEl={menuAnchorEl}
            open={Boolean(menuAnchorEl)}
            onClose={() => setMenuAnchorEl(null)}
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "center",
              
            }}
            transformOrigin={{
              vertical: "top",
              horizontal: "center",
            }}
            PaperProps={{
              sx: {
                minWidth: 160,
                boxShadow: "0 2px 8px rgba(0,0,0,0.20)",
                borderRadius: 3,
                overflow: "hidden",
                p: 0,
              },
            }}
            MenuListProps={{
              disablePadding: true,
            }}
          >
            <MenuItem
              onClick={() => {
                handleOpenPreview();
                setMenuAnchorEl(null);
              }}
              sx={{
                py: 1,
                color: "#7A7A7A", // สีฟ้าเzข้ม
                "&:hover": {
                  bgcolor: "#ECF6FF",
                  fontWeight: "500",
                },
              }}
            >
              <VisibilityIcon style={{
                width: 20,     // ขนาดความกว้าง
                height: 20,    // ขนาดความสูง
                marginRight: 8, // ช่องว่างทางขวา (8px)
                verticalAlign: "middle" // จัดให้อยู่กลางบรรทัด
              }}
              />
              View
            </MenuItem>
            <MenuItem
              onClick={() => {
                handleChangeImage();
                setMenuAnchorEl(null);
              }}
              sx={{
                py: 1,
                color: "#7A7A7A", // ส้ม
                "&:hover": {
                  bgcolor: "#ECF6FF",
                  fontWeight: "500",
                },
              }}
            >
              <EditIcon
                style={{
                  width: 20,     // ขนาดความกว้าง
                  height: 20,    // ขนาดความสูง
                  marginRight: 8, // ช่องว่างทางขวา (8px)
                  verticalAlign: "middle" // จัดให้อยู่กลางบรรทัด
                }}
              />

              Edit
            </MenuItem>
            <MenuItem
              onClick={() => {
                handleRemoveImage();
                setMenuAnchorEl(null);
              }}
              sx={{
                py: 1,
                color: (theme) => theme.palette.error.main,
                "&:hover": {
                  bgcolor: (theme) => theme.palette.error.main,
                  color: "#fff",
                  fontWeight: "500",
                },
              }}
            >
              <DeleteIcon style={{
                width: 20,     // ขนาดความกว้าง
                height: 20,    // ขนาดความสูง
                marginRight: 8, // ช่องว่างทางขวา (8px)
                verticalAlign: "middle" // จัดให้อยู่กลางบรรทัด
              }}
              />
              Delete
            </MenuItem>
          </Menu>


          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            style={{ display: "none" }}
            onChange={handleFileChange}
          />
        </Grid>

        {/* User Info */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            <Typography color="#133E87" fontWeight="500" fontSize="22px">
              Chananchida Akkarakit
            </Typography>
          </Box>
          <Typography fontWeight="300" fontSize="16px" variant="body2" color="text.secondary">
            Administrator
          </Typography>

          <Box sx={{ mt: 4, mb: 3 }}>
            <Paper
              sx={{
                py: 1,
                px: 2,
                width: 320,
                height: 60,
                bgcolor: "#CBDCEB",
                borderRadius: "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              elevation={0}
            >
              <Box
                sx={{
                  flex: 2,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "start",
                  justifyContent: "center",
                  height: "100%",
                }}
              >
                <Typography fontSize={14} color="#133E87">
                  Faculty
                </Typography>
                <Typography fontWeight="bold" fontSize={14} color="#133E87">
                  Computer Engineering
                </Typography>
              </Box>
              <Divider
                orientation="vertical"
                flexItem
                sx={{ mx: 2, borderColor: "#fff", borderBottomWidth: "20px" }}
              />
              <Box
                sx={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "start",
                  justifyContent: "center",
                  height: "100%",
                }}
              >
                <Typography fontSize={14} color="#133E87">
                  Job Title
                </Typography>
                <Typography fontWeight="bold" fontSize={14} color="#133E87">
                  Developer
                </Typography>
              </Box>
            </Paper>
          </Box>

          <Button
            sx={{
              bgcolor: "#133E87",
              borderRadius: 20,
              fontStyle: "italic",
              textTransform: "none",
              fontWeight: "700",
              fontSize: 20,
              width: 200,
              height: 45,
            }}
            variant="contained"
            onClick={handleSignOut}
          >
            Sign out
          </Button>
        </Box>
      </Box>
      <Dialog open={openPreview} onClose={handleClosePreview}  >
        <IconButton
          aria-label="close"
          onClick={handleClosePreview}
          sx={{
            position: "absolute",
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
        <DialogContent sx={{ p: 0 }}>
          {profileImage && (
            <img
              src={profileImage}
              alt="Profile Large"
              style={{
                width: "100%",
                height: "100%",
                display: "block",
              }}
            />
          )}
        </DialogContent>
      </Dialog>

    </>
  );
}
