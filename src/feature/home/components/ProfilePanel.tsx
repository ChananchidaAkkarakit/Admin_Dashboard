import { Box, Typography, Divider, Button, Grid, Paper } from "@mui/material";
import { useNavigate } from "react-router-dom";
import CameraIcon from "../../../assets/icons/camera.svg?react"
import EditPenIcon from "../../../assets/icons/edit-pen.svg?react"

type ProfilePanelProps = {
  setIsLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function ProfilePanel({ setIsLoggedIn }: ProfilePanelProps) {
  const navigate = useNavigate();
  const handleSignOut = () => {
    localStorage.removeItem("isLoggedIn");
    setIsLoggedIn(false);
    navigate("/");
  };
  return (
    <Box
      sx={{
        //p: 15,
        borderRadius: "50px",
        height: 650,
        minWidth: 335, //335
        width: "auto",
        display: "flex",
        flexDirection: "column",
        //bgcolor:"#000000",
        alignItems: "center", // ทุก child อยู่กลางแนวนอน
      }}
    >
      {/* My Profile ชิดซ้าย */}
      <Typography
        variant="subtitle1"
        fontWeight="300"
        fontSize="25px"
        mt={2}
        mb={1}
        alignSelf="flex-start" // แยกจากที่เหลือ
        color="#133E87"
      >
        My Profile
      </Typography>
      <Grid sx={{ p: 4 }} >
        <Box
          sx={{
            bgcolor: "#fff",
            p: 2,
            border: " 2px solid #608BC1",
            borderRadius: "100%",
            width: 75,
            height: 75,
            alignItems: "center",
            display: "flex",
            justifyContent: "center"
          }}>
          <CameraIcon color="#CBDCEB" style={{ width: 35, height: 35 }} />
        </Box>
      </Grid>
      {/* <Avatar sx={{ width: 56, height: 56, mb: 5 }} /> */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",      // จัดแนวแกนหลักเป็น column
          alignItems: "center",         // จัดให้อยู่กึ่งกลางแนวนอน
          justifyContent: "center",     // กึ่งกลางแนวตั้ง (เฉพาะกรณีตั้งความสูงด้วย)
          textAlign: "center",
          //p: 2,
          //minHeight: 80,                // ปรับความสูงถ้าต้องการแนวตั้งกลางหน้าจอ
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",       // ให้ Text กับ Icon เรียงกันและอยู่กลาง
            gap: 1,                     // เว้นช่องห่างระหว่างชื่อกับไอคอน
          }}
        >
          <Typography color="#133E87" fontWeight="500" fontSize="22px">
            Chananchida Akkarakit
          </Typography>
          <EditPenIcon color="#7A7A7A" style={{ width: 18, height: 18 }} />
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
            <Divider orientation="vertical" flexItem sx={{ mx: 2, borderColor: "#fff", borderBottomWidth: "20px" }} />
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
            //padding: 3,
            width: 200,
            height: 45
          }}
          variant="contained" onClick={handleSignOut}>
          Sign out
        </Button>

        {/* <Button variant="contained">ปุ่มแบบ Contained</Button>
      <Button variant="outlined">ปุ่มแบบ Outlined</Button>
      <Button variant="text">ปุ่มแบบ Text</Button> */}
      </Box>
    </Box>
  );
}
