import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import {
    Typography,
    Box,
    TextField,
    Switch,
    FormControlLabel,
    Autocomplete,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle
} from "@mui/material";
import ArrowBackIcon from "../../../../assets/icons/arrow-back.svg?react";
import SideProfilePanel from "../../../home/components/SideProfilePanel";
import { useSlotContext } from "../contexts/SlotContext";



type CupboardInfoPageProps = {
    setIsLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;
    profileImage: string | null;
    setProfileImage: React.Dispatch<React.SetStateAction<string | null>>;
};

export default function CupboardInfoPage({
    setIsLoggedIn,
    profileImage,
    setProfileImage,
}: CupboardInfoPageProps) {
    const navigate = useNavigate();
    const { slotId } = useParams();
    const location = useLocation();
    const { updateSlotStatus, updateTeacher } = useSlotContext();

    const slot = location.state;
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

    const [teacherId, setTeacherId] = useState(slot.teacherId);
    const [status, setStatus] = useState(slot.connectionStatus === "active");
    const [pendingTeacher, setPendingTeacher] = useState(slot.teacherId);
    const [teacherLogs, setTeacherLogs] = useState<
        { timestamp: string; teacherId: string; teacherName: string; message: string }[]
    >([]);
    const [prevStatus, setPrevStatus] = useState(slot.connectionStatus === "active");
    const [prevTeacherId, setPrevTeacherId] = useState(slot.teacherId);

    const [logOpen, setLogOpen] = useState(false);

    if (!slot) {
        return (
            <Box p={3}>
                <Typography color="error">ไม่พบข้อมูล slot (slotId: {slotId})</Typography>
            </Box>
        );
    }

    return (
        <Box
            sx={{
                display: "flex",
                flexDirection: { xs: "column", sm: "column", md: "none", lg: "row" },
                width: "100%",
            }}
        >
            <Box sx={{ flex: 1, width: "100%", pr: { xs: 0, md: 0, lg: 3 } }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}>
                    <ArrowBackIcon onClick={() => navigate(-1)} style={{ width: 28, height: 28, cursor: "pointer" }} />
                    <Typography fontSize="40px" fontWeight={900} fontStyle="italic" color="#133E87">
                        Management
                    </Typography>
                </Box>

                <Box sx={{
                    borderRadius: "35px",
                    width: "auto",
                    height: "55px",
                    px: 2,
                    bgcolor: "#E4EDF6",
                    border: "2px solid #CBDCEB",
                    boxShadow: "0 2px 8px 0 rgba(18, 42, 66, 0.04)",
                    alignContent: "center",
                    color: "#133E87",
                    fontSize: 16,
                    display: "flex",
                    alignItems: "center"
                }}>
                    Cupboard Management
                </Box>

                <Box mt={4}>
                    <Box sx={{ width: "100%", bgcolor: "#CBDCEB", px: 4, py: 2, borderRadius: "25px" }}>
                        <Typography fontWeight={600} color="primary">Cupboard_id</Typography>
                        <TextField
                            value={slot.cupboardId}
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
                                "& .MuiInputBase-input": {
                                    color: "#aaadb1ff",
                                    cursor: "not-allowed"
                                }
                            }}
                        />

                        <Typography fontWeight={600} color="primary">Slot_id</Typography>
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                            <TextField
                                value={slot.slotId}
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
                                    "& .MuiInputBase-input": {
                                        color: "#aaadb1ff",
                                        cursor: "not-allowed"
                                    }
                                }}
                            />
                            <Box sx={{ display: "flex", alignItems: "center", bgcolor: "#fff", borderRadius: "50px", height: 48, mt: "8px", mb: "4px", mx: 0.5 }}>
                                <FormControlLabel
                                    label={<Box sx={{ maxWidth: 18, display: "flex", textAlign: "center" }}>{status ? "On" : "Off"}</Box>}
                                    control={
                                        <Switch
                                            checked={status}
                                            onChange={(e) => {
                                                const newStatus = e.target.checked;
                                                setStatus(newStatus); // ✅ อัปเดตสถานะชั่วคราวใน UI
                                                // ❌ อย่าเรียก updateSlotStatus ที่นี่
                                            }}

                                            sx={{
                                                ml: 1.5,
                                                width: 75,
                                                height: 55,
                                                "& .MuiSwitch-switchBase": {
                                                    padding: 2.2,
                                                    "&.Mui-checked": {
                                                        transform:
                                                            "translateX(20px)",
                                                        "& .MuiSwitch-thumb": {
                                                            backgroundColor: "#fff"
                                                        },
                                                        "& + .MuiSwitch-track": {
                                                            backgroundColor: "#39B129",
                                                            opacity: 1
                                                        }
                                                    }
                                                }, "& .MuiSwitch-thumb": {
                                                    backgroundColor: "#fff",
                                                    width: 20,
                                                    height: 20
                                                },
                                                "& .MuiSwitch-track": {
                                                    borderRadius: 10,
                                                    backgroundColor: "#D41E1E",
                                                    opacity: 1
                                                }
                                            }
                                            }
                                        />
                                    }
                                    sx={{
                                        "& .MuiFormControlLabel-label": {
                                            fontSize: "15px",
                                            fontWeight: 400,
                                            fontStyle: "italic",
                                            color: "#133E87"
                                        }
                                    }}
                                />
                            </Box>
                        </Box>

                        <Typography fontWeight={600} color="primary">Teacher_id</Typography>
                        <Autocomplete
                            options={teacherList} getOptionLabel={(option) => `${option.id}            | ${option.name}`}
                            value={teacherList.find((t) => t.id === pendingTeacher) || null}
                            onChange={(_, newValue) => { if (newValue) { setPendingTeacher(newValue.id); } }}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    fullWidth
                                    margin="dense"
                                    variant="standard"
                                    InputProps={{
                                        ...params.InputProps,
                                        disableUnderline: true

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
                                            padding: 0
                                        }
                                    }
                                    }
                                />
                            )
                            }
                            slotProps={{
                                paper: {
                                    sx: {
                                        mt: 2,
                                        borderRadius: "16px",
                                        boxShadow: "0px 4px 10px rgba(0,0,0,0.1)",
                                        backgroundColor: "#fff",
                                        "& .MuiAutocomplete-listbox": {
                                            padding: 0,
                                        },
                                        "& .MuiAutocomplete-option": {
                                            px: 2,
                                            py: 1,
                                            "&:hover": {
                                                backgroundColor: "#E1EBF4",

                                            },
                                            "&[aria-selected='true']": {
                                                backgroundColor: "#CBDCEB",
                                            },
                                        },
                                    },
                                },
                            }}
                        />

                    </Box>
                </Box>

                <Box sx={{ display: "flex", justifyContent: "space-between", mt: 5, px: 5 }}>

                    <Button
                        variant="outlined"
                        color="error"
                        onClick={() => {
                            setStatus(prevStatus);
                            setPendingTeacher(prevTeacherId);
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
                        disabled={pendingTeacher === prevTeacherId && status === prevStatus}
                        onClick={() => {
                            const selected = teacherList.find(t => t.id === pendingTeacher);
                            const previous = teacherList.find(t => t.id === prevTeacherId);
                            const logs: string[] = [];

                            if (pendingTeacher !== prevTeacherId && selected && previous) {
                                logs.push(
                                    `Teacher: ${previous.id} (${previous.name}) → ${selected.id} (${selected.name})`
                                );
                                setTeacherId(pendingTeacher);
                                updateTeacher(slot.slotId, selected.id, selected.name);
                            }

                            if (status !== prevStatus) {
                                const oldStatusText = prevStatus ? "On" : "Off";
                                const newStatusText = status ? "On" : "Off";
                                logs.push(`Slot Status: ${oldStatusText} → ${newStatusText}`);
                                updateSlotStatus(slot.slotId, status);
                            }

                            if (logs.length > 0) {
                                setTeacherLogs(prev => [
                                    ...prev,
                                    {
                                        timestamp: new Date().toLocaleString(),
                                        teacherId: pendingTeacher,
                                        teacherName: selected?.name || "",
                                        message: logs.join(" | ")
                                    }
                                ]);

                                // อัปเดตค่า prev เพื่อให้เทียบกับครั้งต่อไปได้ถูกต้อง
                                setPrevStatus(status);
                                setPrevTeacherId(pendingTeacher);

                                alert("Apply สำเร็จ");
                            }
                        }}

                        sx={{
                            borderRadius: "25px",
                            fontSize: "18px",
                            fontWeight: "bold",
                            px: 7,
                            py: 0.5,
                            textTransform: "none",
                            backgroundColor:
                                pendingTeacher === teacherId && status === (slot.connectionStatus === "active")
                                    ? "#ccc"
                                    : "#133E87",
                            "&:hover": {
                                backgroundColor:
                                    pendingTeacher === teacherId && status === (slot.connectionStatus === "active")
                                        ? "#ccc"
                                        : "#0f2f6b"
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
                            {teacherLogs.length === 0 ? (
                                <Typography color="text.secondary">ยังไม่มี log การเปลี่ยนแปลง</Typography>
                            ) : (
                                teacherLogs.map((log, idx) => (
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

            <SideProfilePanel setIsLoggedIn={setIsLoggedIn} profileImage={profileImage} setProfileImage={setProfileImage} />
        </Box>
    );
}
