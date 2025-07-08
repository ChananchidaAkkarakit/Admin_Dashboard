import { Box, Typography, Switch, Avatar } from "@mui/material";
// import OnIcon from "../../../assets/icons/toggle-on.svg?react";
// import OffIcon from "../../../assets/icons/toggle-off.svg?react";


type NotificationToggleProps = {
  icon: React.ReactElement;
  label: string;
  detail: string;
  status: string;
  checked: boolean;
  onChange: () => void;
};

export default function NotificationToggle({
  icon,
  label,
  detail,
  status,
  checked,
  onChange,
}: NotificationToggleProps) {
  return (

    <Box
      sx={{
        bgcolor: "#E8F1FB",
        borderRadius: "35px",
        p: 1.5,
        display: "flex",
        alignItems: "center",
        gap: 2,
        mb: 1,
      }}
    >
      <Avatar sx={{ bgcolor: "#fff", width: 48, height: 48 }}>{icon}</Avatar>
      <Box flex={1}>
        <Typography fontWeight="bold" color="#133E87" display="inline">
          {label}
        </Typography>
        <Typography component="span" fontSize="15px" color="#133E87" ml={1}>
          {detail}
        </Typography>
        <Typography color="#6E90C6">{status}</Typography>
      </Box>
<Switch
  checked={checked}
  onChange={onChange}
  sx={{
    width: 75,
    height: 55,
    
    //border: 10,
    "& .MuiSwitch-switchBase": {
      //margin: 2,
      padding: 2.2,
      transform: "translateX(1px)",
      "&.Mui-checked": {
        //color: "#fff",
        transform: "translateX(20px)",
        "& .MuiSwitch-thumb": {
          backgroundColor: checked ? "#fff" : "#fff", // เปลี่ยนสีปุ่ม
        },
        "& + .MuiSwitch-track": {
          backgroundColor: "##133E87", // เปลี่ยนสีแถบพื้นหลังตอนเปิด
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
      backgroundColor: "#55B3FF", // สีแถบพื้นหลังตอนปิด 90caf9
      
    },
  }}
/>

    </Box>
  );
}
