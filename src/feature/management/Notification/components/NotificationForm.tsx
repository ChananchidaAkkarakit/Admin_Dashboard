import React, { useState, useEffect } from "react";
import {
    Box,
    Button,
    MenuItem,
    TextField,
    Typography,
    FormControlLabel,
    Switch,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle
} from "@mui/material";
import type { Notification } from "../../../../../../backend/src/mock/types";
import { useNavigate } from "react-router-dom";

// ✅ เพิ่ม type นี้ใน NotificationForm.tsx
// NotificationForm.tsx (final props type)
type NotificationFormProps = {
    mode: "add" | "edit";
    onSubmit: (data: NotificationFormValues) => void;
    initialData?: Partial<Notification>;
};


export type NotificationFormValues = {
    messageId: string;
    messageName: string;
    message: string;
    type: "notification" | "warning" | "error" | "success" | "info";
    source: "admin" | "system";
    status: boolean;
};

const defaultValues: NotificationFormValues = {
    messageId: "",
    messageName: "",
    message: "",
    type: "info",
    source: "admin",
    status: true,
};

export default function NotificationForm({
    initialData,
    onSubmit,
    mode,
}: NotificationFormProps) {
    const [prevValues, setPrevValues] = useState<NotificationFormValues>(defaultValues);
    const [logOpen, setLogOpen] = useState(false);
    const [logs, setLogs] = useState<string[]>([]);
    const [formValues, setFormValues] = useState<NotificationFormValues>(defaultValues);
    const navigate = useNavigate(); // ⬅️ ใช้ navigate
    useEffect(() => {
        if (initialData && mode === "edit") {
            const merged = { ...defaultValues, ...initialData };
            setFormValues(merged);
            setPrevValues(merged);
        }
    }, [initialData, mode]);

    const handleChange = (field: keyof NotificationFormValues) => (
        e: React.ChangeEvent<HTMLInputElement>) => {
        const value = field === "status" ? e.target.checked : e.target.value;
        setFormValues((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = () => {
        onSubmit(formValues);
    };

    return (
        <Box display="flex" flexDirection="column" gap={2}>
            <Typography variant="h5" fontWeight={700} color={"#133E87"}
                sx={{
                    display: "flex",
                    justifyContent: "center",
                    //alignContent: "center"
                }}>
                {mode === "edit" ? "Edit notification" : "Add Notification"}
            </Typography>
            <Box sx={{
                backgroundColor: "#CBDCEB",
                p: 4,
                borderRadius: "25px"

            }}>

                <Typography fontWeight={600} color="primary">Message_ID</Typography>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                    <TextField
                        fullWidth
                        margin="dense"
                        variant="standard"
                        value={formValues.messageId}
                        onChange={handleChange("messageId")}
                        InputProps={{ readOnly: false, disableUnderline: true }}
                        sx={{
                            flex: "1 1 240px",
                            mx: 0.5,
                            width: "auto",
                            height: 48,
                            pl: 2,
                            display: "flex",
                            justifyContent: "center",
                            bgcolor: "#fff",
                            borderRadius: "25px",
                            cursor: "not-allowed",
                            "& .MuiInputBase-input": {
                                color: "#aaadb1ff",
                                cursor: "not-allowed"
                            }
                        }}

                    />
                    <Box sx={{ display: "flex", alignItems: "center", bgcolor: "#fff", borderRadius: "50px", height: 48, mt: "8px", mb: "4px", mx: 0.5 }}>
                        <FormControlLabel
                            label={<Box sx={{ maxWidth: 18, display: "flex", textAlign: "center" }}>{formValues.status ? "On" : "Off"}</Box>}
                            control={
                                <Switch
                                    checked={formValues.status}
                                    onChange={(e) => {
                                        const newStatus = e.target.checked;
                                        setFormValues((prev) => ({ ...prev, status: newStatus }));
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
                <Typography fontWeight={600} color="primary">Message_Name</Typography>
                <TextField
                    fullWidth
                    margin="dense"
                    variant="standard"
                    value={formValues.messageName}
                    onChange={handleChange("messageName")}
                    InputProps={{ readOnly: false, disableUnderline: true }}
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
                    }}
                />
                <Typography fontWeight={600} color="primary">Type</Typography>
                <TextField
                    select
                    margin="dense"
                    variant="standard"
                    value={formValues.type}
                    onChange={handleChange("type")}
                    fullWidth
                    InputProps={{ readOnly: false, disableUnderline: true }}
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
                    }}
                >
                    {[
                        "notification",
                        "warning",
                        "error",
                        "success",
                        "info",
                    ].map((type) => (
                        <MenuItem key={type} value={type}>
                            {type}
                        </MenuItem>
                    ))}
                </TextField>

                <Typography fontWeight={600} color="primary">Message</Typography>
                <TextField

                    //fullWidth
                    multiline
                    //minRows={3}
                    margin="dense"
                    variant="standard"
                    value={formValues.message}
                    onChange={handleChange("message")}
                    InputProps={{ readOnly: false, disableUnderline: true }}
                    sx={{
                        flex: "1 1 240px",
                        mx: 0.5,
                        width: "auto",
                        minHeight: "48",
                        p: 2,
                        py: 1,
                        display: "flex",
                        justifyContent: "center",
                        bgcolor: "#fff",
                        borderRadius: "30px",
                        "& .MuiInputBase-input": {
                            padding: 0
                        }
                    }}

                />
                <Typography fontWeight={600} color="primary">Source</Typography>
                <TextField
                    select
                    margin="dense"
                    variant="standard"
                    value={formValues.source}
                    onChange={handleChange("source")}
                    InputProps={{ readOnly: false, disableUnderline: true }}
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
                    }}
                >                    {["admin", "system"].map((src) => (
                    <MenuItem key={src} value={src}>
                        {src}
                    </MenuItem>
                ))}
                </TextField>
                {/* 
                <TextField
                    label="Status"
                    select
                    value={formValues.status ? "on" : "off"}
                    onChange={(e) =>
                        setFormValues((prev) => ({ ...prev, status: e.target.value === "on" }))
                    }
                    fullWidth
                >
                    <MenuItem value="on">On</MenuItem>
                    <MenuItem value="off">Off</MenuItem>
                </TextField> */}
            </Box>
{mode === "add" ? (
 <Box sx={{ display: "flex", justifyContent: "space-between",mt:3, px: 5 }}>

        <Button
      variant="outlined"
      onClick={() => setFormValues(defaultValues)}
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
      variant="outlined"
      onClick={() => navigate(-1)}
      sx={{
        borderRadius: "25px",
        fontSize: "18px",
        fontWeight: "bold",
        px: 6,
        py: 1.2,
        textTransform: "none",
        borderColor: "#D32F2F",
        color: "#D32F2F",
        "&:hover": {
          backgroundColor: "#fddede",
          borderColor: "#D32F2F",
        },
      }}
    >
      Cancel
    </Button>

    <Button
      variant="contained"
      onClick={handleSubmit}
      sx={{
        borderRadius: "25px",
        fontSize: "18px",
        fontWeight: "bold",
        px: 6,
        py: 1.2,
        textTransform: "none",
        backgroundColor: "#133E87",
        color: "#fff",
        boxShadow: "0 3px 6px rgba(0, 0, 0, 0.2)",
        "&:hover": {
          backgroundColor: "#0f2f6b",
          boxShadow: "0 4px 10px rgba(0, 0, 0, 0.3)",
        },
        "&:active": {
          transform: "scale(0.98)",
          boxShadow: "0 2px 5px rgba(0, 0, 0, 0.2)",
        },
      }}
    >
      Add
    </Button>
                </Box>
            ) : (
                <Box sx={{ display: "flex", justifyContent: "space-between", mt: 5, px: 2, flexWrap: "wrap", gap: 2 }}>
                    <Button
                        variant="outlined"
                        color="error"
                        onClick={() => setFormValues(prevValues)}
                        disabled={JSON.stringify(formValues) === JSON.stringify(prevValues)}
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
                        onClick={() => {
                            const changes: string[] = [];
                            if (formValues.messageName !== prevValues.messageName)
                                changes.push(`Title: "${prevValues.messageName}" → "${formValues.messageName}"`);
                            if (formValues.message !== prevValues.message)
                                changes.push(`Message: "${prevValues.message}" → "${formValues.message}"`);
                            if (formValues.status !== prevValues.status)
                                changes.push(`Status: ${prevValues.status ? "On" : "Off"} → ${formValues.status ? "On" : "Off"}`);
                            if (formValues.type !== prevValues.type)
                                changes.push(`Type: ${prevValues.type} → ${formValues.type}`);
                            if (formValues.source !== prevValues.source)
                                changes.push(`Source: ${prevValues.source} → ${formValues.source}`);

                            if (changes.length > 0) {
                                setLogs((prev) => [...prev, `[${new Date().toLocaleString()}] ${changes.join(" | ")}`]);
                                setPrevValues(formValues);
                                onSubmit(formValues);
                            }
                        }}
                        disabled={JSON.stringify(formValues) === JSON.stringify(prevValues)}
                        sx={{
                            borderRadius: "25px",
                            fontSize: "18px",
                            fontWeight: "bold",
                            px: 7,
                            py: 0.5,
                            textTransform: "none",
                        }}>
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

                    {/* Dialog แสดง log */}
                    <Dialog open={logOpen} onClose={() => setLogOpen(false)} fullWidth maxWidth="sm">
                        <DialogTitle>Change Log</DialogTitle>
                        <DialogContent dividers>
                            {logs.length === 0 ? (
                                <Typography color="text.secondary">ยังไม่มี log การเปลี่ยนแปลง</Typography>
                            ) : (
                                logs.map((msg, idx) => (
                                    <Box key={idx} mb={1} p={1} bgcolor="#F5F5F5" borderRadius={2}>
                                        <Typography fontSize={14}>{msg}</Typography>
                                    </Box>
                                ))
                            )}
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={() => setLogOpen(false)}>Close</Button>
                        </DialogActions>
                    </Dialog>
                </Box>
            )}

        </Box>
    );
}