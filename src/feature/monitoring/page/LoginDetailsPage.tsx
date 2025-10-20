// // src/pages/Monitoring/LoginDetailsPage.tsx
// import { useEffect, useMemo, useState } from "react";
// import {
//   Box,
//   Button,
//   Card,
//   Chip,
//   CircularProgress,
//   Container,
//   Divider,
//   IconButton,
//   Stack,
//   TextField,
//   Typography,
// } from "@mui/material";
// import ArrowBackIosNewRoundedIcon from "@mui/icons-material/ArrowBackIosNewRounded";
// import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
// import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";
// import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
// import { useNavigate } from "react-router-dom";
// import { supabase } from "../../../supabaseClient";

// type LogRow = {
//   id: string;
//   name: string | null;
//   description: string | null;
//   action: "login" | "logout" | string | null;
//   ip_addr?: string | null;
//   user_agent?: string | null;
//   success?: boolean | null;
//   created_at: string; // timestamptz
// };

// const PAGE_SIZE = 20;

// export default function LoginDetailsPage() {
//   const navigate = useNavigate();

//   const [rows, setRows] = useState<LogRow[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [errorMsg, setErrorMsg] = useState<string | null>(null);

//   // filters
//   const [q, setQ] = useState("");
//   const [action, setAction] = useState<"" | "login" | "logout">("");
//   const [dateFrom, setDateFrom] = useState<string>(""); // "YYYY-MM-DD"
//   const [dateTo, setDateTo] = useState<string>("");

//   // paging
//   const [page, setPage] = useState(0);
//   const [total, setTotal] = useState<number>(0);

//   const offset = page * PAGE_SIZE;

//   const headerGrid = "1.3fr .9fr .9fr 1.4fr .9fr 1.2fr";
//   const rowGrid = headerGrid;

//   async function fetchLogs() {
//     setLoading(true);
//     setErrorMsg(null);
//     try {
//       let query = supabase
//         .from("login_history") // ← ชื่อตารางตัวอย่าง ด้านล่างมี SQL สร้างให้
//         .select(
//           "id,name,description,action,ip_addr,user_agent,success,created_at",
//           { count: "exact" }
//         )
//         .order("created_at", { ascending: false })
//         .range(offset, offset + PAGE_SIZE - 1);

//       if (q.trim()) {
//         // ค้นหาจาก name/description (ilike)
//         query = query.ilike("name", `%${q}%`).or(`description.ilike.%${q}%`);
//       }
//       if (action) {
//         query = query.eq("action", action);
//       }
//       if (dateFrom) {
//         query = query.gte("created_at", `${dateFrom}T00:00:00+07:00`);
//       }
//       if (dateTo) {
//         // รวมทั้งวันสิ้นสุด
//         query = query.lte("created_at", `${dateTo}T23:59:59.999+07:00`);
//       }

//       const { data, error, count } = await query;

//       if (error) throw error;
//       setRows((data || []) as LogRow[]);
//       setTotal(count || 0);
//     } catch (err: any) {
//       setErrorMsg(err.message || "Fetch error");
//     } finally {
//       setLoading(false);
//     }
//   }

//   useEffect(() => {
//     fetchLogs();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [page]);

//   const handleApplyFilter = () => {
//     setPage(0);
//     fetchLogs();
//   };

//   const totalPages = useMemo(
//     () => Math.max(1, Math.ceil(total / PAGE_SIZE)),
//     [total]
//   );

//   const formatDate = (iso: string) =>
//     new Date(iso).toLocaleDateString("th-TH", { timeZone: "Asia/Bangkok" });
//   const formatTime = (iso: string) =>
//     new Date(iso).toLocaleTimeString("th-TH", {
//       hour: "2-digit",
//       minute: "2-digit",
//       second: "2-digit",
//       timeZone: "Asia/Bangkok",
//     });

//   const exportCSV = () => {
//     const header = [
//       "Name",
//       "Date",
//       "Time",
//       "Action",
//       "Result",
//       "IP",
//       "Description",
//       "UserAgent",
//     ];
//     const lines = rows.map((r) => {
//       const date = formatDate(r.created_at);
//       const time = formatTime(r.created_at);
//       const result = r.success === false ? "FAILED" : "OK";
//       return [
//         r.name ?? "",
//         date,
//         time,
//         r.action ?? "",
//         result,
//         r.ip_addr ?? "",
//         (r.description ?? "").replace(/\n/g, " "),
//         (r.user_agent ?? "").replace(/\n/g, " "),
//       ]
//         .map((s) => `"${String(s).replaceAll('"', '""')}"`)
//         .join(",");
//     });
//     const csv = [header.join(","), ...lines].join("\n");
//     const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
//     const url = URL.createObjectURL(blob);
//     const a = document.createElement("a");
//     a.download = `login_details_page_${new Date()
//       .toISOString()
//       .slice(0, 10)}.csv`;
//     a.href = url;
//     a.click();
//     URL.revokeObjectURL(url);
//   };

//   return (
//     <Container maxWidth="lg" sx={{ py: 3 }}>
//       <Stack direction="row" alignItems="center" spacing={1} mb={2}>
//         <IconButton onClick={() => navigate(-1)}>
//           <ArrowBackIosNewRoundedIcon />
//         </IconButton>
//         <Typography
//           fontStyle="italic"
//           fontWeight={300}
//           fontSize="20px"
//           color="#133E87"
//         >
//           Login Details
//         </Typography>
//         <Box flex={1} />
//         <Button
//           startIcon={<DownloadRoundedIcon />}
//           variant="outlined"
//           onClick={exportCSV}
//           sx={{
//             borderRadius: "24px",
//             textTransform: "none",
//             fontWeight: 700,
//             px: 2.5,
//           }}
//         >
//           Export CSV
//         </Button>
//         <IconButton onClick={fetchLogs}>
//           <RefreshRoundedIcon />
//         </IconButton>
//       </Stack>

//       {/* Filters */}
//       <Card
//         sx={{
//           borderRadius: 6,
//           p: 2,
//           mb: 2,
//           border: "1px solid #CBDCEB",
//           bgcolor: "#F7FAFF",
//         }}
//       >
//         <Stack spacing={1.5} direction={{ xs: "column", md: "row" }}>
//           <TextField
//             value={q}
//             onChange={(e) => setQ(e.target.value)}
//             placeholder="ค้นหาชื่อหรือคำอธิบาย..."
//             InputProps={{ startAdornment: <SearchRoundedIcon /> }}
//             fullWidth
//           />
//           <TextField
//             select
//             label="ประเภท"
//             value={action}
//             onChange={(e) => setAction(e.target.value as any)}
//             SelectProps={{ native: true }}
//             sx={{ minWidth: 160 }}
//           >
//             <option value="">ทั้งหมด</option>
//             <option value="login">login</option>
//             <option value="logout">logout</option>
//           </TextField>
//           <TextField
//             type="date"
//             label="จากวันที่"
//             value={dateFrom}
//             onChange={(e) => setDateFrom(e.target.value)}
//             InputLabelProps={{ shrink: true }}
//           />
//           <TextField
//             type="date"
//             label="ถึงวันที่"
//             value={dateTo}
//             onChange={(e) => setDateTo(e.target.value)}
//             InputLabelProps={{ shrink: true }}
//           />
//           <Button
//             onClick={handleApplyFilter}
//             variant="contained"
//             sx={{
//               borderRadius: "24px",
//               textTransform: "none",
//               fontWeight: 700,
//               bgcolor: "#133E87",
//               "&:hover": { bgcolor: "#0f2f6b" },
//             }}
//           >
//             Apply
//           </Button>
//         </Stack>
//       </Card>

//       {/* Table */}
//       <Card sx={{ borderRadius: 6, overflow: "hidden", border: "1px solid #CBDCEB" }}>
//         <Box
//           sx={{
//             display: "grid",
//             gridTemplateColumns: headerGrid,
//             bgcolor: "#E3EDF7",
//             px: 2,
//             py: 1,
//             fontWeight: 700,
//             color: "#133E87",
//           }}
//         >
//           <Box>Name</Box>
//           <Box>Date</Box>
//           <Box>Time</Box>
//           <Box>Description</Box>
//           <Box>Result</Box>
//           <Box>Device / IP</Box>
//         </Box>

//         <Box sx={{ minHeight: 240, maxHeight: 520, overflowY: "auto" }}>
//           {loading && (
//             <Stack alignItems="center" py={4}>
//               <CircularProgress />
//             </Stack>
//           )}

//           {!loading && errorMsg && (
//             <Typography color="error" px={2} py={1.5}>
//               {errorMsg}
//             </Typography>
//           )}

//           {!loading && !errorMsg && rows.length === 0 && (
//             <Typography px={2} py={1.5} color="text.secondary">
//               — ไม่มีข้อมูล —
//             </Typography>
//           )}

//           {!loading &&
//             !errorMsg &&
//             rows.map((row) => (
//               <Box
//                 key={row.id}
//                 sx={{
//                   display: "grid",
//                   gridTemplateColumns: rowGrid,
//                   px: 2,
//                   py: 1.2,
//                   borderTop: "1px solid #EFF4F9",
//                 }}
//               >
//                 <Box sx={{ pr: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
//                   {row.name || "-"}
//                 </Box>
//                 <Box>{formatDate(row.created_at)}</Box>
//                 <Box>{formatTime(row.created_at)}</Box>
//                 <Box sx={{ pr: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
//                   {row.description || "-"}
//                 </Box>
//                 <Box>
//                   {row.success === false ? (
//                     <Chip size="small" label="FAILED" color="error" />
//                   ) : (
//                     <Chip
//                       size="small"
//                       label={row.action?.toUpperCase() || "OK"}
//                       sx={{ bgcolor: "#E8F5E9", color: "#1B5E20", fontWeight: 700 }}
//                     />
//                   )}
//                 </Box>
//                 <Box sx={{ pr: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
//                   {row.ip_addr || "-"}
//                 </Box>
//               </Box>
//             ))}
//         </Box>

//         {/* Pagination */}
//         <Divider />
//         <Stack
//           direction="row"
//           alignItems="center"
//           justifyContent="space-between"
//           px={2}
//           py={1.2}
//         >
//           <Typography color="text.secondary" fontSize={14}>
//             Showing {rows.length} / {total} rows • Page {page + 1} / {totalPages}
//           </Typography>
//           <Stack direction="row" spacing={1}>
//             <Button
//               disabled={page <= 0 || loading}
//               onClick={() => setPage((p) => Math.max(0, p - 1))}
//               variant="outlined"
//               sx={{ borderRadius: "20px", textTransform: "none" }}
//             >
//               Prev
//             </Button>
//             <Button
//               disabled={page + 1 >= totalPages || loading}
//               onClick={() => setPage((p) => p + 1)}
//               variant="outlined"
//               sx={{ borderRadius: "20px", textTransform: "none" }}
//             >
//               Next
//             </Button>
//           </Stack>
//         </Stack>
//       </Card>
//     </Container>
//   );
// }
