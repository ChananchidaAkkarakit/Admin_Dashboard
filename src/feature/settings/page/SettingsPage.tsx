import NotificationToggle from "../components/NotificationToggle";
//import NotificationsIcon from "@mui/icons-material/Notifications";
import LockIcon from "../../../assets/icons/lock.svg?react";
import ServerIcon from "../../../assets/icons/server.svg?react";
import CupboardIcon from "../../../assets/icons/box-broken.svg?react";
import InfaredIcon from "../../../assets/icons/infrared.svg?react";
import { Box, Typography, Avatar, Button } from "@mui/material";
import { useState } from "react";

export default function SettingsPage(){
   const [isOpen, setIsOpen] = useState(true);
  const [toggles, setToggles ] = useState({
    cupboardDoor: true,
    connection: false,
    full: true,
    sensorError: false,
  });

  const handleToggle = (key: keyof typeof toggles) => {
    setToggles((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <Box //egde
      // sx={{
      //   borderRadius: "35px",
      //   py: 6,
      //   px: 10,
      //   //pr: 3,
      //   //pr:1,
      //   maxWidth: "1200px",
      //   mx: "auto",
      //   height: "100%",
      //   bgcolor: "#fff",

      // }}
    >
      <Typography
        fontSize="40px"
        fontWeight={900}
        fontStyle={"italic"}
        color="#133E87"
        mb={4}
      >
        Settings
      </Typography>
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          gap: 8,
          justifyContent: "center",
          alignItems: "flex-start",
        }}
      >
        {/* ฝั่งซ้าย */}
        <Button
          sx={{
            bgcolor: isOpen ? "#E8F1FB" :"#E8F1FB",
            "&:hover": {
              bgcolor: "#EEEEEE",
              //opacity: 1//border: "2px solid #D3E8FF"
            },
            borderRadius: "35px",
            minWidth: 180,
            minHeight: 170,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            // boxShadow: "0px 2px 10pxrgba(191, 225, 255, 0.33)",
            // border: "3px solid #CBDCEB",
            p: 1,
            //flex: 1
          }}      
          onClick={() => setIsOpen((prev) => !prev)} // Toggle เมื่อกดปุ่ม
        >
          <Avatar
            sx={{
              bgcolor: "#fff",
              color: "#133E87",
              width: 70,
              height: 70,
              mb: 2,
              border: "1px solid #CBDCEB",
            }}
          >
            <CupboardIcon color="#133E87" style={{ width: 35, height: 35 }}/>
          </Avatar>
          <Typography textTransform= "none" fontWeight="bold" color="#133E87" fontSize={18}>
            Cupboard Door
          </Typography>
      <Typography textTransform= "none" color={isOpen ? "#2FA620" : "#B21B1B"} fontSize={15}>
        {isOpen ? "Open" : "Close"}
      </Typography>
        </Button>

        {/* ฝั่งขวา */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            flex: 2,
            gap: 2,
          }}
        >
          <NotificationToggle
            icon={<LockIcon color="#133E87"style={{ width: 30, height: 30 }}/>}
            label="Notification"
            detail="(Cupboard Door)"
            status={toggles.cupboardDoor ? "Status : On" : "Status : Off"}
            // status={
            //   toggles.cupboardDoor
            //     ? "Status : Close the door"
            //     : "Status : Open the door"
            // }
            checked={toggles.cupboardDoor}
            onChange={() => handleToggle("cupboardDoor")}
          />
          <NotificationToggle
            icon={<ServerIcon color="#133E87"style={{ width: 30, height: 30 }}/>}
            label="Notification"
            detail="(Connection between cupboard and server)"
            status={toggles.connection ? "Status : On" : "Status : Off"}
            checked={toggles.connection}
            onChange={() => handleToggle("connection")}
          />
          <NotificationToggle
            icon={<CupboardIcon color="#133E87"style={{ width: 30, height: 30 }}/>}
            label="Notification"
            detail="(The cupboard is full.)"
            status={toggles.full ? "Status : On" : "Status : Off"}
            checked={toggles.full}
            onChange={() => handleToggle("full")}
          />
          <NotificationToggle
            icon={<InfaredIcon color="#133E87"style={{ width: 30, height: 30 }}/>}
            label="Notification"
            detail="(Sensor malfunction)"
            status={toggles.sensorError ? "Status : On" : "Status : Off"}
            checked={toggles.sensorError}
            onChange={() => handleToggle("sensorError")}
          />
        </Box>
      </Box>
    </Box>
  );
}
