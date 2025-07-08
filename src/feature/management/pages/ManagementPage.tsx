// import React from "react";
// import {
//   Box,
//   Grid,
//   Paper,
//   Typography,
//   List,
//   ListItemButton,
//   ListItemText,
//   Divider,
// } from "@mui/material";
// import ProfilePanel from "../../home/components/ProfilePanel"; // ปรับ path ตามจริง

// export default function ManagementPage() {
//   return (
//     <Box
//       sx={{
//         borderRadius: "24px",
//         p: 4,
//         width: "100%",
//         maxWidth: 1200,
//         mx: "auto",
//         bgcolor: "#ffffff",
//         boxShadow: "0px 10px 20px rgba(0,0,0,0.1)",
//       }}
//     >
//       <Grid container spacing={2}>
//         {/* Sidebar ยังอยู่ใน Layout เลยไม่ต้องแสดงที่นี่ */}

//         {/* กลาง: รายการจัดการ */}
//         <Grid item xs={12} md={8}>
//           <Box
//             sx={{
//               borderRadius: "24px",
//               p: 3,
//               backgroundColor: "#f5faff",
//               boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
//             }}
//           >
//             <Box
//               sx={{
//                 display: "flex",
//                 gap: 2,
//                 mb: 3,
//               }}
//             >
//               <Paper
//                 elevation={0}
//                 sx={{
//                   flex: 1,
//                   p: 2,
//                   textAlign: "center",
//                   borderRadius: 3,
//                   backgroundColor: "#d2e0f1", // active style
//                   cursor: "pointer",
//                 }}
//               >
//                 <Typography variant="h6" fontWeight="bold">
//                   Registration
//                 </Typography>
//               </Paper>

//               <Paper
//                 elevation={0}
//                 sx={{
//                   flex: 1,
//                   p: 2,
//                   textAlign: "center",
//                   borderRadius: 3,
//                   backgroundColor: "#e9f0fa",
//                   cursor: "pointer",
//                 }}
//               >
//                 <Typography variant="h6" fontWeight="bold">
//                   Management
//                 </Typography>
//                 <Typography variant="caption" color="text.secondary">
//                   Go to Management Page
//                 </Typography>
//               </Paper>
//             </Box>

//             {/* รายการจัดการย่อย */}
//             <List
//               sx={{
//                 bgcolor: "background.paper",
//                 borderRadius: 3,
//                 border: "1px solid #b5cee9",
//               }}
//             >
//               {[
//                 "Cupboard Management",
//                 "Qr code Management",
//                 "Notification Management",
//               ].map((text) => (
//                 <React.Fragment key={text}>
//                   <ListItemButton>
//                     <ListItemText primary={text} />
//                     <Typography
//                       variant="body2"
//                       sx={{
//                         backgroundColor: "#133E87",
//                         color: "white",
//                         borderRadius: "50%",
//                         width: 28,
//                         height: 28,
//                         display: "flex",
//                         alignItems: "center",
//                         justifyContent: "center",
//                       }}
//                     >
//                       &gt;
//                     </Typography>
//                   </ListItemButton>
//                   <Divider />
//                 </React.Fragment>
//               ))}
//             </List>
//           </Box>
//         </Grid>

//         {/* ขวา: Profile Panel */}
//         <Grid item xs={12} md={4}>
//           <ProfilePanel />
//         </Grid>
//       </Grid>
//     </Box>
//   );
// }
