import { Box, Typography, Button, Paper, Divider, Dialog, DialogContent, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useState } from "react";
import ProfileImageUploader from "./ProfileImageUploader";

type Props = {
    setIsLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;
    profileImage: string | null;
    setProfileImage: React.Dispatch<React.SetStateAction<string | null>>;
};

export default function ProfilePanel({ setIsLoggedIn, profileImage, setProfileImage }: Props) {
    const [openPreview, setOpenPreview] = useState(false);

    const handleSignOut = () => {
        localStorage.removeItem("isLoggedIn");
        setIsLoggedIn(false);
        // navigate("/") ถ้าใช้ react-router
    };

  return (
   
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


            {/* รูปโปรไฟล์ */}
            <ProfileImageUploader
                profileImage={profileImage}
                setProfileImage={setProfileImage}
                onPreview={() => setOpenPreview(true)}
            />

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
              //p: 1,
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

            {/* Dialog preview */}
            <Dialog open={openPreview} onClose={() => setOpenPreview(false)}>
                <IconButton onClick={() => setOpenPreview(false)} sx={{ position: "absolute", top: 8, right: 8 }}>
                    <CloseIcon />
                </IconButton>
                <DialogContent sx={{ p: 0 }}>
                    {profileImage && <img src={profileImage} alt="Profile Large" style={{ width: "100%", height: "100%" }} />}
                </DialogContent>
            </Dialog>
        </Box>
    );
}
