// AddSubjectPill.tsx
import { useEffect, useMemo, useRef, useState } from "react";
import {
    Button, Popover, Box, TextField, Stack, Typography,
    Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions,
    CircularProgress, FormHelperText, InputAdornment, IconButton
} from "@mui/material";
import { AddRounded, MenuBookRounded, CloseRounded, KeyboardReturnRounded } from "@mui/icons-material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";

type Props = {
    onAdd: (name: string) => Promise<void> | void;     // เรียกตอนยืนยันเพิ่ม
    existing?: string[];                                // ไว้เช็คซ้ำ (ออปชัน)
    label?: string;                                     // ข้อความบนปุ่ม (default: "Add Subject")
    placeholder?: string;                               // placeholder ช่องกรอก
    disabled?: boolean;
};

export default function AddSubjectPill({
    onAdd,
    existing = [],
    label = "Add Subject",
    placeholder = "Subject name",
    disabled = false,
}: Props) {
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
    const [value, setValue] = useState("");
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [err, setErr] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const open = Boolean(anchorEl);

    const isDup = useMemo(() => {
        const v = value.trim().toLowerCase();
        return !!v && existing.some(s => s.toLowerCase() === v);
    }, [value, existing]);

    // โฟกัสช่องกรอกเมื่อ popover เปิด
    useEffect(() => {
        if (open) {
            setTimeout(() => inputRef.current?.focus(), 0);
        } else {
            setValue("");
            setErr(null);
        }
    }, [open]);

    const handleEnter = () => {
        if (!value.trim() || isDup) return;
        setConfirmOpen(true);
    };

    const handleAdd = async () => {
        try {
            setSubmitting(true);
            setErr(null);
            await onAdd(value.trim());
            setSubmitting(false);
            setConfirmOpen(false);
            setAnchorEl(null);
            setValue("");
        } catch (e: any) {
            setSubmitting(false);
            setErr(e?.message || "Failed to add subject.");
        }
    };

    return (
        <>
            <Button
                onClick={(e) => setAnchorEl(e.currentTarget)}
                disabled={disabled}
                startIcon={<AddRoundedIcon style={{ width: 17, height: 17 }} />}
                sx={{
                    borderRadius: "999px",
                    px: 2,
                    height: 40,
                    bgcolor: "#ffffffff",
                    color: "#828282ff",
                    textTransform: "none",
                    fontSize: "14px",
                    fontWeight: 400,
                    border: "1px solid #E8E6DF",
                    boxShadow: "0 0 0 rgba(0,0,0,0)",
                    "&:hover": {
                        bgcolor: "#F0EFEA",
                        borderColor: "#E1DFD6",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                    },
                }}
            >
                {label}
            </Button>

            <Popover
                open={open}
                anchorEl={anchorEl}
                onClose={() => setAnchorEl(null)}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                transformOrigin={{ vertical: "top", horizontal: "center" }}
                PaperProps={{
                    sx: {
                        width: 300,
                        mt:1,
                        ml:2,
                        p: 2,
                        borderRadius: 4,
                        border: "1px solid #CBDCEB",
                        boxShadow: "0 12px 32px rgba(19,62,135,0.18)",
                        backdropFilter: "blur(8px)",
                        background:
                            "linear-gradient(180deg, rgba(245,250,255,0.95) 20%, rgba(255,255,255,0.98) 70%)",
                        position: "relative",
                        overflow: "hidden",
                        "&:before": {
                            content: '""',
                            position: "absolute",
                            top: 0,
                            left: 0,
                            right: 0,
                            height: 7,
                            background: " #133E87",
                        },
                    },
                }}
            >
                <Stack gap={1.25} minWidth={100}>
                    {/* Header น่ารัก ๆ */}
                    <Box display="flex" alignItems="center" gap={1}>
                        <Box
                            sx={{
                                width: 30,
                                height: 30,
                                borderRadius: "50%",
                                backgroundColor: "#EAF2FF",
                                border: "1px solid #CBDCEB",
                                display: "grid",
                                placeItems: "center",
                            }}
                        >
                            <AddRounded fontSize="small" sx={{ color: "#133E87" }} />
                        </Box>
                        <Typography fontWeight={700} color="#133E87">
                            Add subject
                        </Typography>
                    </Box>

                    {/* ช่องกรอก */}
                    <TextField
                        inputRef={inputRef}
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        placeholder={placeholder || "Type a new subject"}
                        variant="outlined"
                        size="small"
                        onKeyDown={(e) => {
                            if (e.key === "Enter") handleEnter();
                            if (e.key === "Escape") setAnchorEl(null);
                        }}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <MenuBookRounded sx={{ opacity: 0.7 }} />
                                </InputAdornment>
                            ),
                            endAdornment: value ? (
                                <InputAdornment position="end">
                                    <IconButton
                                        size="small"
                                        onClick={() => setValue("")}
                                        aria-label="clear"
                                        edge="end"
                                    >
                                        <CloseRounded />
                                    </IconButton>
                                </InputAdornment>
                            ) : null,
                        }}
                        sx={{
                            "& .MuiOutlinedInput-root": {
                                borderRadius: 3,
                                bgcolor: "#FFFFFF",
                                transition: "box-shadow .2s, border-color .2s",
                                "& fieldset": { borderColor: "#CBDCEB" },
                                "&:hover fieldset": { borderColor: "#5D88CC" },
                                "&.Mui-focused": {
                                    boxShadow: "0 0 0 4px rgba(19,62,135,0.10)",
                                    "& fieldset": { borderColor: "#133E87" },
                                },
                            },
                            "& .MuiInputBase-input::placeholder": { color: "#8AA6C1", opacity: 1 },
                        }}
                    />

                    {/* ข้อความแจ้งเตือนความผิดพลาด/ซ้ำ */}
                    {isDup && (
                        <Stack direction="row" alignItems="center" gap={0.75}>
                            <FormHelperText error sx={{ m: 0 }}>
                                This subject already exists.
                            </FormHelperText>
                        </Stack>
                    )}
                    {err && !isDup && (
                        <FormHelperText error sx={{ m: 0 }}>{err}</FormHelperText>
                    )}

                    {/* แถวลัดคีย์บอร์ดเล็ก ๆ */}
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Stack direction="row" gap={0.75} alignItems="center" sx={{ opacity: 0.85 }}>
                            <Box
                                sx={{
                                    px: 1,
                                    py: 0.25,
                                    borderRadius: 2,
                                    border: "1px solid #CBDCEB",
                                    bgcolor: "#F5FAFF",
                                    fontSize: 12,
                                    fontWeight: 600,
                                    color: "#133E87",
                                }}
                            >
                                Enter
                            </Box>
                            <Typography variant="caption" color="#436789">
                                to add •
                            </Typography>
                            <Box
                                sx={{
                                    px: 1,
                                    py: 0.25,
                                    borderRadius: 2,
                                    border: "1px solid #CBDCEB",
                                    bgcolor: "#F5FAFF",
                                    fontSize: 12,
                                    fontWeight: 600,
                                    color: "#133E87",
                                }}
                            >
                                Esc
                            </Box>
                            <Typography variant="caption" color="#436789">
                                to close
                            </Typography>
                        </Stack>
                    </Stack>

                    {/* ปุ่มคำสั่ง */}
                    <Box display="flex" gap={1} justifyContent="flex-end" mt={0.5}>
                        <Button
                            onClick={() => setAnchorEl(null)}
                            sx={{
                                textTransform: "none",
                                borderRadius: 999,
                                px: 1.5,
                                color: "#436789",
                                "&:hover": { bgcolor: "#EAF2FF" },
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="contained"
                            onClick={() => setConfirmOpen(true)}
                            disabled={!value.trim() || isDup}
                            startIcon={<KeyboardReturnRounded />}
                            sx={{
                                
                                textTransform: "none",
                                borderRadius: 999,
                                px: 2,
                                boxShadow: "0 6px 16px rgba(19,62,135,0.25)",
                                background:
                                    "linear-gradient(135deg, #133E87 0%, #2F5AA8 60%)",
                                "&:hover": {
                                    background:
                                        "linear-gradient(135deg, #0f2f6b 0%, #2A4D8E 60%)",
                                },
                            }}
                        >
                            Add
                        </Button>
                    </Box>
                </Stack>
            </Popover>


            <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
                <DialogTitle>Confirm adding subject</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Add “{value.trim()}” to the subjects list?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setConfirmOpen(false)}>Back</Button>
                    <Button
                        variant="contained"
                        onClick={handleAdd}
                        disabled={submitting}
                        startIcon={submitting ? <CircularProgress size={16} color="inherit" /> : undefined}
                        autoFocus
                    >
                        Add
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}
