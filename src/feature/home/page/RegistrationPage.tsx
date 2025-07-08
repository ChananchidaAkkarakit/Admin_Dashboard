// import React, { useState } from "react";
// import WelcomeHeader from "../components/WelcomeHeader";
// import {
//   Box,
//   Grid,
//   Paper,
//   Typography,
//   TextField,
//   Button,
//   Card,
//   CardContent,
// } from "@mui/material";
// import ProfilePanel from "../components/ProfilePanel"; // ปรับ path ให้ถูกต้อง

// export default function RegistrationPage() {
//   const [searchQuery, setSearchQuery] = useState("");
//   const [searched, setSearched] = useState(false);
//   const [results, setResults] = useState<any[]>([]);

//   const mockData = [
    
//     {
//       id: 1,
//       name: "ผศ.สมรสชัย จันทร์รัตน์",
//       subjects: ["Computer Programming", "Logic Design"],
//       email: "samatchai.j@en.rmutt.ac.th",
//     },
//     {
//       id: 2,
//       name: "อ.วิชาญ ปรีชากุล",
//       subjects: ["Data Structures", "Algorithms"],
//       email: "wichan@university.ac.th",
//     },
//   ];

//   const handleSearch = () => {
//     const filtered = mockData.filter((item) =>
//       item.name.includes(searchQuery)
//     );
//     setResults(filtered);
//     setSearched(true);
//   };

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
//         {/* ช่องค้นหาและผลลัพธ์ (ครึ่งซ้าย) */}
//         <WelcomeHeader />
//         <Grid item xs={12} md={8}>
//           <Paper
//             elevation={10}
//             sx={{
//               borderRadius: "24px",
//               p: 5,
//               pt: 5,
//               width: "100%",
//               backgroundColor: "#ffffff",
//               boxShadow: "0px 10px 20px rgba(0,0,0,0.1)",
//             }}
//           >
//             <Typography variant="h6" gutterBottom>
//               📋 Registration Search
//             </Typography>

//             <Grid container spacing={1}>
//               <Grid item xs={12} md={9}>
//                 <TextField
//                   fullWidth
//                   label="ค้นหาด้วยชื่ออาจารย์"
//                   value={searchQuery}
//                   onChange={(e) => setSearchQuery(e.target.value)}
//                 />
//               </Grid>
//               <Grid item xs={12} md={3}>
//                 <Button fullWidth variant="contained" onClick={handleSearch}>
//                   Search
//                 </Button>
//               </Grid>
//             </Grid>

//             <Box mt={2}>
//               {results.length > 0 ? (
//                 results.map((item) => (
//                   <Card key={item.id} sx={{ mb: 1 }}>
//                     <CardContent>
//                       <Typography variant="h6">{item.name}</Typography>
//                       <Typography>
//                         Subjects: {item.subjects.join(", ")}
//                       </Typography>
//                       <Typography>Email: {item.email}</Typography>
//                     </CardContent>
//                   </Card>
//                 ))
//               ) : (
//                 <Typography color="textSecondary">
//                   {searched ? "ไม่พบข้อมูลที่ค้นหา" : "กรอกคำค้นหาแล้วกด Search"}
//                 </Typography>
//               )}
//             </Box>
//           </Paper>
//         </Grid>

//         {/* Profile panel (ครึ่งขวา) */}
//         <Grid item xs={12} md={4}>
//           <ProfilePanel />
//         </Grid>
//       </Grid>
//     </Box>
//   );
// }
