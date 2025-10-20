import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import {
    Typography,
    Box,
    TextField,
    Switch,
    FormControlLabel,

    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle
} from "@mui/material";
import ArrowBackIcon from "../../../../assets/icons/arrow-back.svg?react";
import SideProfilePanel from "../../../home/components/SideProfilePanel";
import { useQRCodeContext } from ".././contexts/QRCodeContext";
import type { EnrichedQRCodeSlot as QRCodeSlot } from "../../../../../../backend/src/mock/types";
import { supabase } from "../../../../supabaseClient";

type LogEntry = {
    timestamp: string;
    type: "qrStatus" | "teacherChange";
    message: string;
};

// const teacherList = [
//     { id: "T001", name: "สมรรถชัย จันทรัตน์" },
//     { id: "T002", name: "ปอลิน กองสุวรรณ" },
//     { id: "T003", name: "พัฒณ์รพี สุนันทพจน์" },
//     { id: "T004", name: "วีระชัย แย้มวจี" },
// ];

type QrCodeInfoPageProps = {
    setIsLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;
    profileImage: string | null;
    setProfileImage: React.Dispatch<React.SetStateAction<string | null>>;
};

export default function QrCodeInfoPage({
    setIsLoggedIn,
    profileImage,
    setProfileImage,
}: QrCodeInfoPageProps) {
    const navigate = useNavigate();
    //const { slotId } = useParams();
    const location = useLocation();
    const slot = location.state as QRCodeSlot;
    const { updateSlotStatus } = useQRCodeContext(); // หรือ useSlotContext()

    //nst [pendingTeacher, setPendingTeacher] = useState<string>(slot.teacherId ?? "");
    const [enrichedTeacherName, setEnrichedTeacherName] = useState<string>(""); // ใช้ fallback แสดงชื่อ
    type Teacher = { id: string; name: string };
    const [teacherList, setTeacherList] = useState<Teacher[]>([]);


    //const [teacherId, setTeacherId] = useState(slot.teacherId);         // ค่าปัจจุบัน
    //const [pendingTeacher, setPendingTeacher] = useState<string>(slot.teacherId ?? "");
    const [logs, setLogs] = useState<LogEntry[]>([]);
    // const [prevStatus, setPrevStatus] = useState(slot.connectionStatus === "active");
    const [logOpen, setLogOpen] = useState(false);
    // const [status, setStatus] = useState(slot.connectionStatus === "active");
    // const teacherName =
    //     teacherList.find(t => t.id === (pendingTeacher ?? ""))?.name ?? "-";
    const [qrId, setQrId] = useState<string>(slot.qrId ?? "");
    const [pendingTeacher, setPendingTeacher] = useState<string>(slot.teacherId ?? "");
    const [teacherName, setTeacherName] = useState<string>("-");
    const [status, setStatus] = useState(slot.connectionStatus === "active");
    const [prevStatus, setPrevStatus] = useState(slot.connectionStatus === "active");
    const teacherInfoValue =
        (pendingTeacher && pendingTeacher.trim() !== "" ? pendingTeacher : "-") +
        "          | " +
        teacherName;
    async function fetchQrIdForSlot(slotId: string): Promise<string> {
        const sid = (slotId || "").trim();
        if (!sid) return "";

        const { data, error } = await supabase
            .from("qrcodes")
            .select("qr_id")
            .eq("slot_id", sid)
            .order("created_at", { ascending: false }) // ถ้ามีหลายเรคคอร์ด เลือกตัวล่าสุด
            .limit(1)
            .maybeSingle();

        if (error) {
            console.error("fetchQrIdForSlot error:", error);
            return "";
        }
        return data?.qr_id ?? "";
    }

    useEffect(() => {
        if (!slot?.slotId) return;

        (async () => {
            // 1) slots (คงไว้ตามเดิมถ้าต้องใช้)
            const { data: slotRow, error: slotErr } = await supabase
                .from("slots")
                .select("slot_id, cupboard_id, teacher_id, connection_status")
                .eq("slot_id", slot.slotId)
                .maybeSingle();
            if (slotErr) console.error("slots error:", slotErr);

            // 2) qrcodes: ❗อย่าใช้ maybeSingle ที่นี่ — ใช้ array + แถวแรก
            const { data: qrRows, error: qrErr } = await supabase
                .from("qrcodes")
                .select("qr_id, teacher_id, is_active, created_at")
                .eq("slot_id", slot.slotId)
                .order("created_at", { ascending: false })
                .limit(1);
                console.log("qrErr:", qrErr, "qrRows:", qrRows); // << ถ้า RLS บล็อก จะไม่มี error แต่ qrRows = []
                console.log("slotId:", JSON.stringify(slot.slotId));

            if (qrErr) console.error("qrcodes error:", qrErr);

            const qrRow = Array.isArray(qrRows) && qrRows.length ? qrRows[0] : null;

            // ตั้งค่า qrId จากผลลัพธ์ (จะรีแรนเดอร์แน่ๆ)
            setQrId(qrRow?.qr_id ?? "");

            // อัปเดตสถานะสวิตช์หากมี is_active ใน qrcodes
            if (typeof qrRow?.is_active === "boolean") {
                setStatus(qrRow.is_active);
                setPrevStatus(qrRow.is_active);
            }

            // 3) หา teacherId (ให้ slots ก่อน, ไม่มีก็ใช้ qrcodes)
            const teacherId = slotRow?.teacher_id ?? qrRow?.teacher_id ?? null;

            if (teacherId) {
                const { data: u, error: uErr } = await supabase
                    .from("users")
                    .select("teacher_id, name_thai, name_eng")
                    .eq("teacher_id", teacherId)
                    .maybeSingle();
                if (uErr) console.error("users error:", uErr);

                setTeacherName(u?.name_thai ?? u?.name_eng ?? "-");
                setPendingTeacher(teacherId);
            } else {
                setTeacherName("-");
                setPendingTeacher("");
            }
        })();
    }, [slot?.slotId]);


    return (
        <Box
            sx={{
                display: "flex",
                flexDirection: { xs: "column", sm: "column", md: "none", lg: "row" },
                width: "100%",
            }}
        >
            {/* Column ซ้าย */}
            <Box
                sx={{
                    flex: 1,
                    width: "100%",
                    pr: { xs: 0, md: 0, lg: 3 },
                }}
            >
                {/* Header */}
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
                        Management
                    </Typography>
                </Box>

                {/* Title */}
                <Box
                    sx={{
                        borderRadius: "35px",
                        width: "auto",
                        height: "55px",
                        //maxWidth: "668px",
                        px: 2,
                        bgcolor: "#E4EDF6",
                        border: "2px solid #CBDCEB",
                        boxShadow: "0 2px 8px 0 rgba(18, 42, 66, 0.04)",
                        alignContent: "center",
                        color: "#133E87",
                        fontSize: 16,
                        display: "flex",
                        alignItems: "center",
                    }}
                >
                    QRCode Management
                </Box>

                {/* ข้อมูล */}
                <Box mt={4}>
                    <Box
                        sx={{
                            width: "100%",
                            bgcolor: "#CBDCEB",
                            px: 4,
                            py: 2,
                            borderRadius: "25px",
                        }}
                    >
                        <Typography fontWeight={600} color="primary">
                            Cupboard_id
                        </Typography>
                        <TextField
                            value={slot.cupboardId ?? ""}
                            fullWidth
                            margin="dense"
                            variant="standard"
                            InputProps={{
                                readOnly: true,
                                disableUnderline: true
                            }}
                            sx={{
                                flex: "1 1 240px",
                                mx: 0.5,
                                width: "auto",
                                height: 48,
                                pl: 2,
                                display: "flex",
                                justifyContent: "center",
                                bgcolor: "#fff",
                                borderRadius: "50px",
                                cursor: "not-allowed",
                                // ✅ เปลี่ยนสีตัวหนังสือใน input
                                "& .MuiInputBase-input": {
                                    color: "#aaadb1ff", // ใส่สีที่ต้องการ
                                    cursor: "not-allowed",
                                    //fontSize: "14px",
                                },
                            }}
                        />

                        <Typography fontWeight={600} color="primary">
                            Slot_id
                        </Typography>

                        <Box sx={{ display: "flex", alignItems: "center" }}>
                            {/* TextField ด้านซ้าย */}
                            <TextField
                                value={slot.slotId ?? ""}
                                fullWidth
                                margin="dense"
                                variant="standard"
                                InputProps={{
                                    readOnly: true,
                                    disableUnderline: true,
                                }}
                                sx={{
                                    flex: "1 1 240px",
                                    mx: 0.5,
                                    width: "auto",
                                    height: 48,
                                    pl: 2,
                                    display: "flex",
                                    justifyContent: "center",
                                    bgcolor: "#fff",
                                    borderRadius: "50px",
                                    cursor: "not-allowed",
                                    // ✅ เปลี่ยนสีตัวหนังสือใน input
                                    "& .MuiInputBase-input": {
                                        color: "#aaadb1ff", // ใส่สีที่ต้องการ
                                        cursor: "not-allowed",
                                        //fontSize: "14px",
                                    },
                                }}
                            />
                        </Box>

                        <Typography fontWeight={600} color="primary">
                            Teacher Info
                        </Typography>

                        <Box sx={{ display: "flex", alignItems: "center" }}>
                            {/* TextField ด้านซ้าย */}
                            <TextField
                                value={teacherInfoValue}
                                fullWidth
                                margin="dense"
                                variant="standard"
                                InputProps={{
                                    readOnly: true,
                                    disableUnderline: true,
                                }}
                                sx={{
                                    flex: "1 1 240px",
                                    mx: 0.5,
                                    width: "auto",
                                    height: 48,
                                    p: 2,
                                    display: "flex",
                                    justifyContent: "center",
                                    bgcolor: "#fff",
                                    borderRadius: "50px",
                                    "& .MuiInputBase-input": {
                                        color: "#aaadb1ff", // ใส่สีที่ต้องการ
                                        cursor: "not-allowed",
                                        padding: 0,
                                    },
                                }}
                            />

                        </Box>

                        <Typography fontWeight={600} color="primary">
                            QRCode_id
                        </Typography>

                        <Box sx={{ display: "flex", alignItems: "center" }}>
                            {/* TextField ด้านซ้าย */}
                            <TextField
                                value={qrId || ""}        // เดิม: value={slot.qrId}
                                fullWidth
                                margin="dense"
                                variant="standard"
                                InputProps={{ readOnly: true, disableUnderline: true }}
                                sx={{
                                    flex: "1 1 240px",
                                    mx: 0.5,
                                    width: "auto",
                                    height: 48,
                                    pl: 2,
                                    display: "flex",
                                    justifyContent: "center",
                                    bgcolor: "#fff",
                                    borderRadius: "50px",
                                    cursor: "not-allowed",
                                    // ✅ เปลี่ยนสีตัวหนังสือใน input
                                    "& .MuiInputBase-input": {
                                        color: "#aaadb1ff", // ใส่สีที่ต้องการ
                                        cursor: "not-allowed",
                                        padding: 0,
                                        //fontSize: "14px",
                                    },
                                }}
                            />

                            {/* Switch ด้านขวา */}
                            <Box
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    bgcolor: "#fff",
                                    borderRadius: "50px",
                                    //px: 2,
                                    //m: "dense",
                                    height: 48,
                                    mt: "8px",
                                    mb: "4px",
                                    mx: 0.5,
                                    //width: "auto"
                                }}
                            >
                                <FormControlLabel
                                    label={
                                        <Box
                                            sx={{
                                                maxWidth: 18, // 👈 กำหนดความกว้างคงที่
                                                display: "flex",
                                                textAlign: "center",
                                            }}
                                        >
                                            {status ? "On" : "Off"}
                                        </Box>
                                    }
                                    //labelPlacement="start"
                                    control={
                                        <Switch
                                            checked={status}
                                            onChange={(e) => {
                                                const newStatus = e.target.checked;
                                                setStatus(newStatus); // ✔ เปลี่ยนค่าเฉยๆ รอให้ user กด Apply
                                            }}

                                            sx={{
                                                ml: 1.5,
                                                width: 75,
                                                height: 55,
                                                "& .MuiSwitch-switchBase": {
                                                    padding: 2.2,
                                                    "&.Mui-checked": {
                                                        transform: "translateX(20px)",
                                                        "& .MuiSwitch-thumb": {
                                                            backgroundColor: "#fff",
                                                        },
                                                        "& + .MuiSwitch-track": {
                                                            backgroundColor: "#39B129",
                                                            opacity: 1,
                                                        },
                                                    },
                                                },
                                                "& .MuiSwitch-thumb": {
                                                    backgroundColor: "#fff",
                                                    width: 20,
                                                    height: 20,
                                                },
                                                "& .MuiSwitch-track": {
                                                    borderRadius: 10,
                                                    backgroundColor: "#D41E1E",
                                                    opacity: 1,
                                                },
                                            }}
                                        />
                                    }

                                    sx={{
                                        "& .MuiFormControlLabel-label": {
                                            fontSize: "15px",
                                            fontWeight: 400,
                                            fontStyle: "italic",
                                            color: "#133E87",
                                        },
                                    }}
                                />
                            </Box>
                        </Box>
                    </Box>
                    <Box sx={{ display: "flex", justifyContent: "space-between", mt: 5, px: 5 }}>
                        <Button
                            variant="outlined"
                            color="error"
                            onClick={() => {
                                setStatus(slot.connectionStatus === "active");
                                setPendingTeacher(slot.teacherId ?? "");  // ✅ บังคับเป็น string
                            }}
                            disabled={
                                status === (slot.connectionStatus === "active") &&
                                pendingTeacher === slot.teacherId
                            }
                            sx={{
                                borderRadius: "25px",
                                fontSize: "18px",
                                fontWeight: "bold",
                                px: 6,
                                py: 1.2,
                                textTransform: "none",
                                borderColor: "#D32F2F",
                                color: "#D32F2F",
                                ml: 2,
                                "&:hover": {
                                    backgroundColor: "#fddede",
                                    borderColor: "#D32F2F",
                                },
                            }}
                        >
                            Reset
                        </Button>

                        <Button
                            variant="contained"
                            disabled={status === prevStatus}
                            onClick={async () => {
                                let id = (qrId || "").trim();
                                if (!id) {
                                    // fallback ดึงอีกรอบ (กรณีผู้ใช้เข้าหน้านี้เร็วมาก)
                                    const { data: rows } = await supabase
                                        .from("qrcodes")
                                        .select("qr_id")
                                        .eq("slot_id", slot.slotId)
                                        .order("created_at", { ascending: false })
                                        .limit(1);
                                    id = Array.isArray(rows) && rows.length ? rows[0].qr_id : "";
                                    setQrId(id);
                                }
                                if (!id) {
                                    alert("ไม่พบ QRCode_id สำหรับช่องนี้");
                                    return;
                                }

                                const { error } = await supabase
                                    .from("qrcodes")
                                    .update({ is_active: status })
                                    .eq("qr_id", id);

                                if (error) {
                                    alert("อัปเดตไม่สำเร็จ: " + error.message);
                                    return;
                                }

                                setLogs(prev => [...prev, {
                                    timestamp: new Date().toLocaleString(),
                                    type: "qrStatus",
                                    message: `QR Code ถูก${status ? "เปิดใช้งาน" : "ปิดใช้งาน"}`
                                }]);
                                setPrevStatus(status);
                                alert(`QR Code ${status ? "เปิดใช้งาน" : "ปิดใช้งาน"} แล้ว`);
                            }}


                            sx={{
                                borderRadius: "25px",
                                fontSize: "20px",
                                fontWeight: "bold",
                                px: 7,
                                py: 0.5,
                                textTransform: "none",
                                backgroundColor: status === prevStatus ? "#ccc" : "#133E87",
                                "&:hover": {
                                    backgroundColor: status === (slot.connectionStatus === "active") ? "#ccc" : "#133E87"
                                }
                            }}
                        >
                            Apply
                        </Button>

                        <Button
                            variant="outlined"
                            color="secondary"
                            onClick={() => setLogOpen(true)}
                            sx={{
                                borderRadius: "25px",
                                fontSize: "18px",
                                fontWeight: "bold",
                                px: 6,
                                py: 1.2,
                                textTransform: "none",
                                backgroundColor: "#133E87",
                                color: "#fff",
                                borderColor: "#133E87",
                                boxShadow: "0 3px 6px rgba(0, 0, 0, 0.2)",

                                "&:hover": {
                                    backgroundColor: "#0f2f6b",
                                    borderColor: "#0f2f6b",
                                    boxShadow: "0 4px 10px rgba(0, 0, 0, 0.3)",
                                },

                                "&:active": {
                                    transform: "scale(0.98)",
                                    boxShadow: "0 2px 5px rgba(0, 0, 0, 0.2)",
                                },

                                "&:focus": {
                                    outline: "none",
                                },
                            }}
                        >
                            View Log
                        </Button>


                        <Dialog open={logOpen} onClose={() => setLogOpen(false)} fullWidth maxWidth="sm">
                            <DialogTitle>Change Log</DialogTitle>
                            <DialogContent dividers>
                                {logs.length === 0 ? (
                                    <Typography color="text.secondary">ยังไม่มี log การเปลี่ยนแปลง</Typography>
                                ) : (
                                    logs.map((log, idx) => (
                                        <Box key={idx} mb={1} p={1} bgcolor="#F5F5F5" borderRadius={2}>
                                            <Typography fontSize={14}>
                                                [{log.timestamp}] → {log.message}
                                            </Typography>
                                        </Box>
                                    ))
                                )}
                            </DialogContent>
                            <DialogActions>
                                <Button onClick={() => setLogOpen(false)}>Close</Button>
                            </DialogActions>
                        </Dialog>

                    </Box>
                </Box>
            </Box>

            {/* Column ขวา */}
            <SideProfilePanel
                setIsLoggedIn={setIsLoggedIn}
                profileImage={profileImage}
                setProfileImage={setProfileImage}
            />

        </Box>
    );
}