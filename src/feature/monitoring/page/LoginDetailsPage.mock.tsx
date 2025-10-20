// src/pages/Monitoring/LoginDetailsPage.mock.tsx
import { useMemo, useState } from "react";
import {
    Box,
    Button,
    Card,
    Chip,

    Divider,
    IconButton,
    Stack,
    TextField,
    Typography,
    InputAdornment,
} from "@mui/material";
import MenuItem from "@mui/material/MenuItem";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import { useNavigate } from "react-router-dom";
import ArrowBackIcon from "../../../assets/icons/arrow-back.svg?react";
import RestartAltRoundedIcon from "@mui/icons-material/RestartAltRounded";

type LogRow = {
    id: string;
    name: string | null;
    description: string | null;
    action: "login" | "logout";
    ip_addr?: string | null;
    user_agent?: string | null;
    success?: boolean | null; // false = FAILED
    created_at: string; // ISO (timestamptz-like)
};

// ---------- MOCK DATA ----------
const MOCK_ROWS: LogRow[] = [
    {
        id: "1",
        name: "Danupohn Saekhoo",
        description: "Login from dashboard",
        action: "login",
        ip_addr: "192.168.1.23",
        user_agent: "Chrome 141 / Windows",
        success: true,
        created_at: "2025-10-12T12:10:15+07:00",
    },
    {
        id: "2",
        name: "Danupohn Saekhoo",
        description: "Manual sign-out",
        action: "logout",
        ip_addr: "192.168.1.23",
        user_agent: "Chrome 141 / Windows",
        success: true,
        created_at: "2025-10-12T12:35:02+07:00",
    },
    {
        id: "3",
        name: "Guest",
        description: "Invalid password",
        action: "login",
        ip_addr: "203.0.113.5",
        user_agent: "Safari iOS",
        success: false,
        created_at: "2025-10-11T22:19:44+07:00",
    },
    {
        id: "4",
        name: "Teacher-A",
        description: "Login from mobile",
        action: "login",
        ip_addr: "10.0.0.51",
        user_agent: "Chrome Android",
        success: true,
        created_at: "2025-10-11T08:05:11+07:00",
    },
    {
        id: "5",
        name: "Teacher-A",
        description: "Logout normal",
        action: "logout",
        ip_addr: "10.0.0.51",
        user_agent: "Chrome Android",
        success: true,
        created_at: "2025-10-11T09:10:47+07:00",
    },
    {
        id: "6",
        name: "Admin",
        description: "Login from admin console",
        action: "login",
        ip_addr: "172.16.0.10",
        user_agent: "Firefox 132 / Linux",
        success: true,
        created_at: "2025-10-10T14:20:00+07:00",
    },
    {
        id: "7",
        name: "Admin",
        description: "Manual sign-out",
        action: "logout",
        ip_addr: "172.16.0.10",
        user_agent: "Firefox 132 / Linux",
        success: true,
        created_at: "2025-10-10T16:41:12+07:00",
    },
    {
        id: "8",
        name: "Guest",
        description: "Invalid password",
        action: "login",
        ip_addr: "198.51.100.7",
        user_agent: "Edge / Windows",
        success: false,
        created_at: "2025-10-10T18:22:33+07:00",
    },
    {
        id: "9",
        name: "Student-01",
        description: "Login from dashboard",
        action: "login",
        ip_addr: "192.168.1.80",
        user_agent: "Chrome 141 / macOS",
        success: true,
        created_at: "2025-10-09T11:05:27+07:00",
    },
    {
        id: "10",
        name: "Student-01",
        description: "Logout normal",
        action: "logout",
        ip_addr: "192.168.1.80",
        user_agent: "Chrome 141 / macOS",
        success: true,
        created_at: "2025-10-09T12:33:59+07:00",
    },
];

const PAGE_SIZE = 20;
// ด้านบนของไฟล์ (ใกล้ๆ imports) — เพิ่มค่านิยมใช้ซ้ำ
// ====== ค่าใช้ซ้ำ ======
const CONTROL_H = 36;
const RADIUS = 12;

// โฟกัส: เปลี่ยนแค่สีเส้น ไม่ใส่แหวน/เงา
const baseInputSx = {
    "& .MuiOutlinedInput-root": {
        height: CONTROL_H,
        borderRadius: RADIUS,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#ffffffff",
        "& fieldset": { borderColor: "#E3EDF7", borderWidth: 1 },
        "&:hover fieldset": { borderColor: "#B5CAE4" },
        "&.Mui-focused fieldset": { borderColor: "#133E87" },
    },
    // ปิดผลของ legend/รอยบาก + ตัด padding 8px ที่ทำให้ขนาดแกว่ง
    "& .MuiOutlinedInput-notchedOutline": { padding: 0 },
    "& .MuiOutlinedInput-notchedOutline legend": { display: "flex", width: 0 },
    "& .MuiInputBase-input": { py: 0, fontSize: 14, lineHeight: 1 },
};

const selectSx = {
    ...baseInputSx,
    "& .MuiSelect-select": { py: 0, fontSize: 14, lineHeight: 1.4 },
};

export default function LoginDetailsPageMock() {
    const navigate = useNavigate();

    // filters (client-side)
    const [q, setQ] = useState("");
    const [action, setAction] = useState<"" | "login" | "logout">("");
    const [dateFrom, setDateFrom] = useState<string>("");
    const [dateTo, setDateTo] = useState<string>("");

    // paging
    const [page, setPage] = useState(0);

    const headerGrid = "1.3fr .9fr .9fr 1.4fr .9fr 1.2fr";
    const rowGrid = headerGrid;

    const filtered = useMemo(() => {
        const f = MOCK_ROWS.filter((r) => {
            // ค้นหาคำใน name/description
            const hitQ =
                !q.trim() ||
                (r.name || "").toLowerCase().includes(q.toLowerCase()) ||
                (r.description || "").toLowerCase().includes(q.toLowerCase());

            // กรองประเภท
            const hitAction = !action || r.action === action;

            // กรองวันที่
            const t = new Date(r.created_at).getTime();
            const fromOK = !dateFrom
                ? true
                : t >= new Date(`${dateFrom}T00:00:00+07:00`).getTime();
            const toOK = !dateTo
                ? true
                : t <= new Date(`${dateTo}T23:59:59.999+07:00`).getTime();

            return hitQ && hitAction && fromOK && toOK;
        }).sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at));
        return f;
    }, [q, action, dateFrom, dateTo]);

    const total = filtered.length;
    const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
    const pageRows = filtered.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

    const formatDate = (iso: string) =>
        new Date(iso).toLocaleDateString("th-TH", { timeZone: "Asia/Bangkok" });
    const formatTime = (iso: string) =>
        new Date(iso).toLocaleTimeString("th-TH", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            timeZone: "Asia/Bangkok",
        });

    const exportCSV = () => {
        const header = [
            "Name",
            "Date",
            "Time",
            "Action",
            "Result",
            "IP",
            "Description",
            "UserAgent",
        ];

        // helper: escape เครื่องหมายคำพูด + ตัดขึ้นบรรทัดใหม่
        const csvEscape = (v: unknown) =>
            `"${String(v ?? "")
                .replace(/"/g, '""')
                .replace(/\r?\n/g, " ")
            }"`;

        const lines = filtered.map((r) => {
            const date = formatDate(r.created_at);
            const time = formatTime(r.created_at);
            const result = r.success === false ? "FAILED" : "OK";

            return [
                r.name,
                date,
                time,
                r.action ?? "",
                result,
                r.ip_addr,
                r.description,
                r.user_agent,
            ].map(csvEscape).join(",");
        });

        const csv = [header.join(","), ...lines].join("\n");
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.download = `login_details_mock_${new Date().toISOString().slice(0, 10)}.csv`;
        a.href = url;
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleApplyFilter = () => {
        setPage(0);
    };

    // ----- handler รีเซ็ต -----
    const handleResetFilters = () => {
        setQ("");
        setAction("");
        setDateFrom("");
        setDateTo("");
        setPage(0);
        // ถ้ามี fetch ฝั่ง server ให้เรียกด้วย (mock ไม่จำเป็น)
        // fetchLogs?.();
    };

    // label compact (เล็ก, โทนอ่อน, ไม่ชนขอบ)
    const labelProps = {
        shrink: true,
        sx: {

            fontSize: 13,
            fontWeight: 700,
            lineHeight: 1,
            color: "#5B7AA6",
            letterSpacing: 0.2,
            // ยกขึ้นให้ชิดเส้นบน แต่ไม่ทับมากไป
            transform: "translate(12px, -20px) scale(0.9)",
            // ❌ เอาพื้นหลังที่เคยบังเส้นออก
            // backgroundColor: "#fff",
            // px: 0.5,
            "&.Mui-focused": { color: "#133E87" },
        },
    } as const;

    const menuProps = {
        PaperProps: {
            sx: {
                minWidth: 100,
                boxShadow: "0 2px 8px rgba(0,0,0,0.20)",
                borderRadius: 3,
                overflow: "hidden",
            },
        },

        MenuListProps: {
            disablePadding: true,
            sx: {
                py: 0,
                "&& .MuiMenuItem-root": {
                    fontSize: 14,
                    //py: 0.75,
                    "&.Mui-selected": { bgcolor: "#EAF2FB", color: "#133E87" },
                    "&.Mui-selected:hover": { bgcolor: "#E3EDF7" },
                },
            },
        },
        anchorOrigin: { vertical: "bottom", horizontal: "left" },
        transformOrigin: { vertical: "top", horizontal: "left" },

    } as const;

    return (
        <Box sx={{ display: "flex", flexDirection: "column", width: "100%" }}>
            <Box sx={{ flex: 1, width: "100%" }}>
                {/* Header บนสุด */}
                <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}>
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
                        Monitoring
                    </Typography>
                </Box>
                <Divider
                    sx={{ mt: 1, mb: 3, mx: 2, borderBottomWidth: 2, borderColor: "#CBDCEB" }}
                />

                {/* <Container maxWidth="lg" sx={{ py: 3 }}> */}
                <Stack direction="row" alignItems="center" spacing={1} mb={1}>
                    {/* <Typography
                        fontStyle="italic"
                        fontWeight={300}
                        fontSize="20px"
                        color="#133E87"
                    >
                        Login Details
                    </Typography> */}
                    <Typography color="#133E87" variant="h5" fontWeight={700} mb={2}>
                        Login Details
                    </Typography>
                    <Box flex={1} />
                    <Button
                        startIcon={<DownloadRoundedIcon />}
                        variant="outlined"
                        onClick={exportCSV}
                        sx={{
                            borderRadius: "24px",
                            textTransform: "none",
                            fontWeight: 700,
                            px: 2.5,
                        }}
                    >
                        Export CSV
                    </Button>
                    <IconButton onClick={() => setPage((p) => p /* refresh page only */)}>
                        <RefreshRoundedIcon />
                    </IconButton>
                </Stack>

                {/* Filters */}
                <Card
                    elevation={0}
                    sx={{ pt: 3, mb: 2, border: "none", bgcolor: "transparent", boxShadow: "none" }}
                >
                    <Box
                        sx={{
                            display: "grid",
                            //gap: 0.2,
                            alignItems: "center",
                            gridAutoFlow: "row dense",
                            gridTemplateColumns: {
                                gap: 30,
                                xs: "repeat(12, minmax(0, 1fr))",          // จอแคบ: 12 คอลัมน์
                                md: "minmax(260px,1fr) 150px 160px 160px auto", // จอกว้าง: 5 คอลัมน์เดิม
                            },
                        }}
                    >
                        {/* search: แถวบน เต็มบรรทัด */}
                        <TextField
                            value={q}
                            onChange={(e) => setQ(e.target.value)}
                            placeholder="ค้นหาชื่อหรือคำอธิบาย..."
                            size="small"
                            fullWidth
                            sx={{ ...baseInputSx, gridColumn: { xs: "1 / -1", md: "auto" } }}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchRoundedIcon sx={{ fontSize: 20, color: "#133E87" }} />
                                    </InputAdornment>
                                ),
                            }}
                        />

                        {/* ประเภท: แถวล่าง คอลัมน์ที่ 1-4 */}
                        <TextField
                            select
                            label="ประเภท"
                            size="small"
                            value={action}
                            onChange={(e) => setAction(e.target.value as any)}
                            sx={{ minWidth: { md: 150 }, ...selectSx, gridColumn: { xs: "1 / span 4", md: "auto" } }}
                            InputLabelProps={labelProps}
                            InputProps={{ notched: false }}
                            SelectProps={{
                                displayEmpty: true,
                                IconComponent: ExpandMoreRoundedIcon,
                                MenuProps: menuProps,
                                renderValue: (value) => (value === "" ? <span>ทั้งหมด</span> : String(value)),
                            }}
                        >
                            <MenuItem value=""><Typography variant="body2" color="#7A7A7A">ทั้งหมด</Typography></MenuItem>
                            <MenuItem value="login"><Typography variant="body2" color="#7A7A7A">login</Typography></MenuItem>
                            <MenuItem value="logout"><Typography variant="body2" color="#7A7A7A">logout</Typography></MenuItem>
                        </TextField>

                        {/* จากวันที่: แถวล่าง คอลัมน์ที่ 5-8 */}
                        <TextField
                            type="date"
                            label="จากวันที่"
                            size="small"
                            value={dateFrom}
                            onChange={(e) => setDateFrom(e.target.value)}
                            sx={{ ...baseInputSx, gridColumn: { xs: "5 / span 4", md: "auto" } }}
                            InputLabelProps={labelProps}
                            InputProps={{ notched: false }}
                        />

                        {/* ถึงวันที่: แถวล่าง คอลัมน์ที่ 9-12 */}
                        <TextField
                            type="date"
                            label="ถึงวันที่"
                            size="small"
                            value={dateTo}
                            onChange={(e) => setDateTo(e.target.value)}
                            sx={{ ...baseInputSx, gridColumn: { xs: "9 / span 4", md: "auto" } }}
                            InputLabelProps={labelProps}
                            InputProps={{ notched: false }}
                        />

                        <Stack
                            direction="row"
                            spacing={0.75}
                            sx={{
                                // xs: เต็มบรรทัดถัดจาก 3 ฟิลด์ล่าง  ➜ อยู่แถวล่าง ชิดขวา
                                gridColumn: { xs: "1 / -1", md: "auto" },
                                justifyContent: "flex-end",
                                justifySelf: { xs: "end", md: "end" },
                                alignSelf: "center",
                                mt: { xs: 0.5, md: 0 }, // ระยะห่างเล็กน้อยตอนเป็นแถวใหม่
                            }}
                        >
                            <Button
                                onClick={handleResetFilters}
                                variant="outlined"
                                size="small"
                                startIcon={<RestartAltRoundedIcon sx={{ fontSize: 18 }} />}
                                sx={{
                                    height: CONTROL_H,
                                    px: 1.75,
                                    borderRadius: RADIUS,
                                    textTransform: "none",
                                    fontWeight: 700,
                                    borderColor: "#CBDCEB",
                                    color: "#133E87",
                                    "&:hover": { borderColor: "#133E87", bgcolor: "#EAF2FB" },
                                }}
                            >
                                Reset
                            </Button>
                            <Button
                                onClick={handleApplyFilter}
                                variant="contained"
                                size="small"
                                sx={{
                                    height: CONTROL_H,
                                    px: 2,
                                    borderRadius: RADIUS,
                                    textTransform: "none",
                                    fontWeight: 700,
                                    bgcolor: "#133E87",
                                    "&:hover": { bgcolor: "#0f2f6b" },
                                }}
                            >
                                Apply
                            </Button>
                        </Stack>

                    </Box>
                </Card>

                {/* Table */}
                <Card sx={{ borderRadius: 6, overflow: "hidden", border: "1px solid #CBDCEB" }}>
                    <Box
                        sx={{
                            display: "grid",
                            gridTemplateColumns: headerGrid,
                            bgcolor: "#E3EDF7",
                            px: 2,
                            py: 1,
                            fontWeight: 700,
                            color: "#133E87",
                        }}
                    >
                        <Box>Name</Box>
                        <Box>Date</Box>
                        <Box>Time</Box>
                        <Box>Description</Box>
                        <Box>Result</Box>
                        <Box>Device / IP</Box>
                    </Box>

                    <Box sx={{ minHeight: 240, maxHeight: 340, overflowY: "auto" }}>
                        {pageRows.length === 0 ? (
                            <Typography px={2} py={1.5} color="text.secondary">
                                — ไม่มีข้อมูล —
                            </Typography>
                        ) : (
                            pageRows.map((row) => (
                                <Box
                                    key={row.id}
                                    sx={{
                                        fontSize: 14,
                                        color: "#5e5e5eff",
                                        display: "grid",
                                        gridTemplateColumns: rowGrid,
                                        px: 2,
                                        py: 1.2,
                                        borderTop: "1px solid #EFF4F9",
                                    }}
                                >
                                    <Box
                                        sx={{
                                            pr: 1,
                                            overflow: "hidden",
                                            textOverflow: "ellipsis",
                                            whiteSpace: "nowrap",
                                        }}
                                    >
                                        {row.name || "-"}
                                    </Box>
                                    <Box sx={{
                                        pr: 1,
                                    }}
                                    >
                                        {formatDate(row.created_at)}</Box>
                                    <Box sx={{
                                        pl: 0.5,
                                    }}
                                    >
                                        {formatTime(row.created_at)}</Box>
                                    <Box
                                        sx={{
                                            pl: 0.7,
                                            overflow: "hidden",
                                            textOverflow: "ellipsis",
                                            whiteSpace: "nowrap",
                                        }}
                                    >
                                        {row.description || "-"}
                                    </Box>
                                    <Box sx={{
                                        pl: 1,
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                        whiteSpace: "nowrap",
                                    }}
                                    >
                                        {row.success === false ? (
                                            <Chip size="small" label="FAILED" color="error" />
                                        ) : (
                                            <Chip
                                                size="small"
                                                label={row.action?.toUpperCase() || "OK"}
                                                sx={{ bgcolor: "#E8F5E9", color: "#1B5E20", fontWeight: 700 }}
                                            />
                                        )}
                                    </Box>
                                    <Box
                                        sx={{
                                            pl: 1.5,
                                            overflow: "hidden",
                                            textOverflow: "ellipsis",
                                            whiteSpace: "nowrap",
                                        }}
                                    >
                                        {row.ip_addr || "-"}
                                    </Box>
                                </Box>
                            ))
                        )}
                    </Box>

                    {/* Pagination */}
                    <Divider />
                    <Stack
                        direction="row"
                        alignItems="center"
                        justifyContent="space-between"
                        px={2}
                        py={1.2}
                    >
                        <Typography color="text.secondary" fontSize={14}>
                            Showing {pageRows.length} / {total} rows • Page {page + 1} / {totalPages}
                        </Typography>
                        <Stack direction="row" spacing={1}>
                            <Button
                                disabled={page <= 0}
                                onClick={() => setPage((p) => Math.max(0, p - 1))}
                                variant="outlined"
                                sx={{ borderRadius: "20px", textTransform: "none" }}
                            >
                                Prev
                            </Button>
                            <Button
                                disabled={page + 1 >= totalPages}
                                onClick={() => setPage((p) => p + 1)}
                                variant="outlined"
                                sx={{ borderRadius: "20px", textTransform: "none" }}
                            >
                                Next
                            </Button>
                        </Stack>
                    </Stack>
                </Card>
                {/* </Container> */}
            </Box>
        </Box>
    );
}
