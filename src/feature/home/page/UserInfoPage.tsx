import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Box, Typography, Divider, CardContent, Card, Switch, FormControlLabel } from "@mui/material";
import UserIcon from "../../../assets/icons/user.svg?react";
import SideProfilePanel from "../components/SideProfilePanel";
//import RegistrationSearch from "../components/RegistrationSearch";
import ArrowBackIcon from "../../../assets/icons/arrow-back.svg?react";


interface UserItem {
  id: number;
  role: "teacher" | "student";
  nameThai: string;
  nameEng: string;
  tel?: string | null;
  email?: string | null;
  subjects?: string[];
  studentId?: string;
}

type UserInfoPageProps = {
  setIsLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;
  profileImage: string | null;
  setProfileImage: React.Dispatch<React.SetStateAction<string | null>>;
};

export default function UserInfoPage({
  setIsLoggedIn,
  profileImage,
  setProfileImage,
}: UserInfoPageProps) {
  const { state } = useLocation() as { state: UserItem };
  const navigate = useNavigate();
  const [checked, setChecked] = React.useState(false);
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setChecked(event.target.checked);
  };


  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: { xs: "column", sm: "column", md: "none", lg: "row" },
        //gap: { xs: 3, md: 0 },
        // px: 2,
        // mt: 4,
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

        {/* Title */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            mb: 4,
          }}
        >
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
            Registration
          </Typography>
        </Box>
        {/* 
<RegistrationSearch/> */}
        {/* Card */}
        <Card key={state.id}
          sx={{
            mb: 2,
            bgcolor: "#D6E4EF",
            borderRadius: "28px",
            maxWidth: 600,
            width: "100%",
            minHeight: 150,
            mx: "auto",
          }}>
          <CardContent>
            <Box sx={{
              flex: 1,
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 2.5,
              mb: 2,
              position: "relative",
              left: 10,
            }}>
              <Box sx={{
                justifyContent: "center",
                alignItems: "center",
                display: "flex",
                width: 65,
                height: 65,
                bgcolor: "#fff",
                borderRadius: 20,
              }}>
                <UserIcon color="#133E87" style={{ width: 40, height: 40 }} />
              </Box>
              <Box sx={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "start",
                justifyContent: "center",
              }}>
                <Typography fontFamily="Noto Sans Thai" color="#133E87" fontSize="20px" fontWeight="500">
                  {state.nameThai}
                </Typography>
                <Typography color="#133E87" fontSize="20px" fontWeight="300">
                  {state.nameEng}
                </Typography>

                <Box sx={{
                  position: "absolute",
                  left: "75%",
                  top: "50%",
                  transform: "translateY(-50%)",
                }}>
                  <FormControlLabel
                    label={checked ? "Enable" : "Disable"}
                    control={

                      <Switch
                        checked={checked}
                        onChange={handleChange}
                        sx={{
                          justifyContent: "flex-end",
                          width: 75,
                          height: 55,

                          //border: 10,
                          "& .MuiSwitch-switchBase": {
                            //margin: 2,
                            padding: 2.2,
                            transform: "translateX(px)",
                            "&.Mui-checked": {
                              //color: "#fff",
                              transform: "translateX(20px)",
                              "& .MuiSwitch-thumb": {
                                backgroundColor: checked ? "#fff" : "#fff", // เปลี่ยนสีปุ่ม
                              },
                              "& + .MuiSwitch-track": {
                                backgroundColor: "#39B129", // เปลี่ยนสีแถบพื้นหลังตอนเปิด
                                opacity: 1,
                              },
                            },
                          },
                          "& .MuiSwitch-thumb": {
                            backgroundColor: "#ffff", // สีปุ่ม
                            width: 20,
                            height: 20,

                          },
                          "& .MuiSwitch-track": {
                            borderRadius: 20 / 2,
                            backgroundColor: "#D41E1E", // สีแถบพื้นหลังตอนปิด 90caf9
                            opacity: 1,
                          },
                        }}
                      />
                    } sx={{
                      "& .MuiFormControlLabel-label": {
                        fontSize: "15px",
                        fontWeight: 400,
                        fontStyle: "italic",
                        color: "#133E87",
                      },
                    }}
                  /></Box>
              </Box>
            </Box>

            <Divider sx={{ borderColor: "#fff", borderBottomWidth: "1px" }} />
            <Box sx={{ display: "flex", px: 2, mt: 1 }}>
              {state.role === "student" && (
                <Box sx={{
                  flex: 2,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                  justifyContent: "start",
                }}>
                  <Typography fontWeight="500" fontSize="20px" color="#133E87" gutterBottom>
                    Student ID :
                  </Typography>
                  <Typography fontWeight="300" fontSize="18px" color="#133E87">
                    {state.studentId}
                  </Typography>
                </Box>
              )}
              {/* Subjects เฉพาะอาจารย์ */}
              {state.role === "teacher" && (
                <Box sx={{
                  flex: 2,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                  justifyContent: "start",
                }}>
                  <Typography fontWeight="500" fontSize="20px" color="#133E87" gutterBottom>
                    Subjects :
                  </Typography>

                  {state.subjects?.map((subject, idx) => (
                    <Typography fontWeight="300" fontSize="18px" color="#133E87"
                      key={idx}>{subject}</Typography>
                  ))}

                </Box>

              )}
              <Divider orientation="vertical" flexItem sx={{ mx: 2, borderColor: "#fff", borderBottomWidth: "2px" }} />
              <Box sx={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                justifyContent: "start",
              }}>
                <Typography fontWeight="500" fontSize="20px" color="#133E87" gutterBottom>
                  Contact{state.role === "student" ? "s" : ""} :
                </Typography>
                <Typography fontWeight="300" fontSize="18px" color="#133E87">
                  {state.tel ?? "-"}
                </Typography>
                <Typography fontWeight="300" fontSize="20px" color="#325288">
                  {state.email}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Column ขวา */}
      <SideProfilePanel
        setIsLoggedIn={setIsLoggedIn}
        profileImage={profileImage}
        setProfileImage={setProfileImage}
      />
    </Box>
  );
}
