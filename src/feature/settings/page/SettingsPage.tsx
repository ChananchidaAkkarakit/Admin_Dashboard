import NotificationToggle from "../components/NotificationToggle";
//import NotificationsIcon from "@mui/icons-material/Notifications";
import LockIcon from "../../../assets/icons/lock.svg?react";
import ServerIcon from "../../../assets/icons/server.svg?react";
import CupboardIcon from "../../../assets/icons/box-broken.svg?react";
import InfaredIcon from "../../../assets/icons/infrared.svg?react";
import { Box, Typography, Avatar, Button, Grid } from "@mui/material";
import { useState } from "react";

export default function SettingsPage() {
  const [isOpen, setIsOpen] = useState(true);
  const [toggles, setToggles] = useState({
    cupboardDoor: true,
    connection: false,
    full: true,
    sensorError: false,
  });

  const handleToggle = (key: keyof typeof toggles) => {
    setToggles((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <Box
      sx={{
        //maxWidth: "1200px",
        //height: "100%"
        //mx: "auto",
        //py: 6,
        //px: { xs: 2, md: 0 },
      }}
    >
      <Typography
        fontSize="40px"
        fontWeight={900}
        fontStyle="italic"
        color="#133E87"
        mb={4}
      >
        Settings
      </Typography>

      <Grid container spacing={0}>
        {/* Grid item ฝั่งซ้าย */}
        <Grid item xs={12} md={2.5} >
          <Button
            sx={{
              bgcolor: isOpen ? "#E8F1FB" : "#E8F1FB",
              "&:hover": {
                bgcolor: "#EEEEEE",
              },
              borderRadius: "35px",
              minWidth: 180,
              width: "80%",
              //maxWidth: 180,
              minHeight: 170,
              maxHeight: 250,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              p: 2,
              mb: 2,
              //flexWrap:"wrap"
            }}
            onClick={() => setIsOpen((prev) => !prev)}
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
              <CupboardIcon color="#133E87" style={{ width: 35, height: 35 }} />
            </Avatar>
            <Typography
              textTransform="none"
              fontWeight="bold"
              color="#133E87"
              fontSize={18}
            >
              Cupboard Door
            </Typography>
            <Typography
              textTransform="none"
              color={isOpen ? "#2FA620" : "#B21B1B"}
              fontSize={15}
            >
              {isOpen ? "Open" : "Close"}
            </Typography>
          </Button>
        </Grid>

        {/* Grid item ฝั่งขวา */}
        <Grid item xs={12} md={9.5}>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 2,
              width: "auto"
              //borderRadius: "0px"
            }}
          >
            <NotificationToggle
              icon={
                <LockIcon
                  color="#133E87"
                  style={{ width: 30, height: 30 }}
                />
              }
              label="Notification"
              detail="(Cupboard Door)"
              status={toggles.cupboardDoor ? "Status : On" : "Status : Off"}
              checked={toggles.cupboardDoor}
              onChange={() => handleToggle("cupboardDoor")}
            />
            <NotificationToggle
              icon={
                <ServerIcon
                  color="#133E87"
                  style={{ width: 30, height: 30 }}
                />
              }
              label="Notification"
              detail="(Connection between cupboard and server)"
              status={toggles.connection ? "Status : On" : "Status : Off"}
              checked={toggles.connection}
              onChange={() => handleToggle("connection")}
            />
            <NotificationToggle
              icon={
                <CupboardIcon
                  color="#133E87"
                  style={{ width: 30, height: 30 }}
                />
              }
              label="Notification"
              detail="(The cupboard is full.)"
              status={toggles.full ? "Status : On" : "Status : Off"}
              checked={toggles.full}
              onChange={() => handleToggle("full")}
            />
            <NotificationToggle
              icon={
                <InfaredIcon
                  color="#133E87"
                  style={{ width: 30, height: 30 }}
                />
              }
              label="Notification"
              detail="(Sensor malfunction)"
              status={toggles.sensorError ? "Status : On" : "Status : Off"}
              checked={toggles.sensorError}
              onChange={() => handleToggle("sensorError")}
            />
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}
