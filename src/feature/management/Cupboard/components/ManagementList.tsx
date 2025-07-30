import { List, ListItemButton, ListItemText, Box } from "@mui/material";
import ArrowIcon from "../../../../assets/icons/arrow-outlined.svg?react";
import { useNavigate } from "react-router-dom";

export default function ManagementList() {
  const navigate = useNavigate();

  const items = [
    { label: "Cupboard Management", path: "/app/management/cupboard" },
    { label: "QR Code Management", path: "/app/management/qr" },
    { label: "Notification Management", path: "/app/management/notification" },
  ];

  return (
    <Box
      sx={{
        borderRadius: 2,
        width: "100%",
        //maxWidth: "668px",
        mx: "auto",
      }}
    >
      <List sx={{ mt: 0 }}>
        {items.map(({ label, path }) => (
          <ListItemButton
            key={label}
            onClick={() => navigate(path)}
            sx={{
              bgcolor: "#fff",
              border: "2px solid #CBDCEB",
              borderRadius: "35px",
              mb: 2,
              boxShadow: "0 2px 8px 0 rgba(18, 42, 66, 0.04)",
              transition: "all 0.15s",
              "&:hover": {
                bgcolor: "#E4EDF6",
              },
            }}
          >
            <ListItemText
              primary={label}
              sx={{
                color: "#133E87",
              }}
            />
            <Box
              sx={{
                bgcolor: "#133E87",
                borderRadius: 10,
                width: 35,
                height: 35,
                alignItems: "center",
                justifyContent: "center",
                display: "flex",
              }}
            >
              <ArrowIcon color="#fff" style={{ width: 30, height: 30 }} />
            </Box>
          </ListItemButton>
        ))}
      </List>
    </Box>
  );
}
