import React, {useEffect }from "react";
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
import axios from "axios";

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
    type Teacher = { id: string; name: string };
    const [teacherList, setTeacherList] = useState<Teacher[]>([]);
    type RawTeacher = {
        teacherId: string;
        teacherName: string;
    };
    
    useEffect(() => {
        axios.get<RawTeacher[]>("http://localhost:4000/api/teachers")
            .then((res) => {
                console.log("✅ Teachers from API:", res.data); // 👈 ดูใน console
                const data = res.data.map((t) => ({
                    id: t.teacherId,
                    name: t.teacherName,
                }));
                setTeacherList(data);
            })
            .catch((err) => {
                console.error("Failed to load teachers:", err);
            });
    }, []);

    if (!slot) {
        return <Box p={3}><Typography color="error">ไม่พบข้อมูล QR Code</Typography></Box>;
    }
    
    //const [teacherId, setTeacherId] = useState(slot.teacherId);         // ค่าปัจจุบัน
    const [pendingTeacher, setPendingTeacher] = useState(slot.teacherId);
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [prevStatus, setPrevStatus] = useState(slot.connectionStatus === "active");

    const [logOpen, setLogOpen] = useState(false);
    const [status, setStatus] = useState(slot.connectionStatus === "active");
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
                            value={slot.cupboardId}
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
                                value={slot.slotId}
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
                                value={`${pendingTeacher}          | ${teacherList.find(t => t.id === pendingTeacher)?.name || ""}`}
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
                                value={slot.qrId}
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
                                setPendingTeacher(slot.teacherId);
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
                            onClick={() => {
                                // 👇 เรียกอัปเดต context จริง
                                updateSlotStatus(slot.slotId, status); // ✅ ต้องมีฟังก์ชันนี้จาก context

                                alert(`QR Code ${status ? "เปิดใช้งาน" : "ปิดใช้งาน"} แล้ว`);

                                // 👇 เพิ่ม log
                                setLogs(prev => [
                                    ...prev,
                                    {
                                        timestamp: new Date().toLocaleString(),
                                        type: "qrStatus",
                                        message: `QR Code ถูก${status ? "เปิดใช้งาน" : "ปิดใช้งาน"}`
                                    }
                                ]);

                                // 👇 อัปเดตสถานะภายใน local state
                                setPrevStatus(status); // ใช้เพื่อควบคุมปุ่ม Reset และ Apply

                                // ถ้าคุณใช้ slot.connectionStatus แบบสด (จาก context) ควร refetch ที่ parent component หรือ context ด้วย
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