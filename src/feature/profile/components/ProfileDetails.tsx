// // src/feature/profile/components/ProfileDetails.tsx
// import { Box, Typography, Avatar, Button, Divider, Grid, TextField } from "@mui/material";
// import CameraAltIcon from "@mui/icons-material/CameraAlt";

// export default function ProfileDetails() {
//   return (
//     <Box>
//       <Typography variant="h5" fontWeight="bold" mb={2}>
//         My Profile
//       </Typography>
//       <Divider sx={{ mb: 2 }} />

//       <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
//         <Avatar sx={{ width: 80, height: 80, mb: 1 }}>
//           <CameraAltIcon fontSize="large" />
//         </Avatar>
//         <Typography variant="h6" fontWeight="bold">
//           Buranon Buncharoen
//         </Typography>
//         <Typography variant="body2" color="text.secondary">
//           Administrator
//         </Typography>
//       </Box>

//       <Grid container spacing={2} mt={2}>
//         <Grid item xs={12} md={6}>
//           <TextField
//             label="Faculty"
//             defaultValue="Computer Engineering"
//             fullWidth
//             InputProps={{
//               readOnly: true,
//             }}
//           />
//         </Grid>
//         <Grid item xs={12} md={6}>
//           <TextField
//             label="Job Title"
//             defaultValue="Developer"
//             fullWidth
//             InputProps={{
//               readOnly: true,
//             }}
//           />
//         </Grid>
//         <Grid item xs={12}>
//           <TextField
//             label="Email"
//             defaultValue="buranon@yourdomain.com"
//             fullWidth
//             InputProps={{
//               readOnly: true,
//             }}
//           />
//         </Grid>
//       </Grid>

//       <Button
//         variant="contained"
//         sx={{ mt: 3 }}
//         fullWidth
//       >
//         Edit Profile
//       </Button>
//     </Box>
//   );
// }
