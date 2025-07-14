import { List, ListItemButton, ListItemText, Box } from "@mui/material";
import ArrowIcon from "../../../assets/icons/arrow-outlined.svg?react"

export default function ManagementList() {
  const items = [
    "Cupboard Management",
    "QR Code Management",
    "Notification Management",
  ];
    return (
    <Box
      sx={{
        borderRadius: 2,
        width: "100%",
        maxWidth: "668px",
        mx: "auto",
      }}
    >

    {/* <Paper sx={{ p: 3, borderRadius: 2 }}> */}
      {/* <Typography variant="h6" gutterBottom>
        📂 Management Menu
      </Typography> */}
      <List sx={{mt:1}}>
        {items.map((text) => ( //, idx
          <ListItemButton
            key={text}
            sx={{
              bgcolor: "#fff",
              border: "2px solid #CBDCEB",
              borderRadius: "35px",
              mb: 2.5,
              boxShadow: "0 2px 8px 0 rgba(18, 42, 66, 0.04)",
              transition: "all 0.15s",
              "&:hover": {
                bgcolor: "#E4EDF6",
                //borderColor: "#133E87",
              },
              // เพิ่มระยะห่างระหว่างรายการ
              //...(idx === items.length - 0 && { mb: 0 }),
            }}
          >
            <ListItemText primary={text} 
            sx={{
              color: "#133E87"
            }}/>
          <Box
            sx={{
              bgcolor: "#133E87",
              borderRadius: 10,
              width: 35,
              height: 35,
              alignItems: "center",
              justifyContent:"center",
              display: "flex"
            }}
            >
              <ArrowIcon color="#fff" style={{width: 30, height:30}}/>
          </Box>
          </ListItemButton>
        ))}
      </List>

    </Box>
  );
}
