import React, { useEffect, useState } from "react";
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
  DialogTitle,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

export type NotificationFormValues = {
  targetRole: null;
  messageId: string;
  messageName: string;
  message: string;
  type: "notification" | "warning" | "error" | "success" | "info";
  source: "admin" | "system";
  status: boolean;
};

type NotificationFormProps = {
  mode: "add" | "edit";
  onSubmit: (data: NotificationFormValues) => void;
  previewId?: string;
  initialData?: Partial<NotificationFormValues>;
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
  previewId,
}: NotificationFormProps) {
  const navigate = useNavigate();

  const [prevValues, setPrevValues] = useState<NotificationFormValues>(defaultValues);
  const [formValues, setFormValues] = useState<NotificationFormValues>(defaultValues);

  const [logOpen, setLogOpen] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  // flags
  const isAdd = mode === "add";
  const isReadOnly = mode === "edit" && formValues.source === "system";
  const isSourceLocked = mode === "edit" && prevValues.source === "admin";
// ด้านบนสุด (ใน component)
const errors = {
  messageName: formValues.messageName.trim() === "",
  message: formValues.message.trim() === "",
};
const isValid = !errors.messageName && !errors.message;

  // ใส่ preview id ตอน add
  useEffect(() => {
    if (isAdd && previewId) {
      setFormValues((prev) => ({ ...prev, messageId: previewId }));
    }
  }, [previewId, isAdd]);

  // Merge initialData ตอน edit (กันรีเซ็ตรัวๆ ด้วยการเทียบ messageId)
  useEffect(() => {
    if (initialData && mode === "edit") {
      setFormValues((cur) => {
        if (cur.messageId && cur.messageId === initialData.messageId) return cur;
        const merged = { ...defaultValues, ...initialData } as NotificationFormValues;
        setPrevValues(merged);
        return merged;
      });
    }
  }, [initialData?.messageId, mode]);

  // handlers — ใช้ตัวเดียวรองรับทั้ง input / textarea / select
  const handleInput =
    (field: keyof NotificationFormValues) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setFormValues((prev) => ({ ...prev, [field]: e.target.value as any }));
    };

  const norm = (v: NotificationFormValues) => ({
    ...v,
    message: (v.message ?? "").trim(),
    messageName: (v.messageName ?? "").trim(),
  });
  const changed = JSON.stringify(norm(formValues)) !== JSON.stringify(norm(prevValues));

  // บังคับ source = admin ตอน Add (กันแก้ payload)
const handleSubmit = () => {
  if (!isValid) {
    alert("กรุณากรอกข้อมูลให้ครบก่อน");
    return;
  }
  const payload: NotificationFormValues = {
    ...formValues,
    ...(isAdd ? { source: "admin" as const } : {}),
  };
  onSubmit(payload);
};


  return (
    <Box display="flex" flexDirection="column" gap={2}>
      <Typography
        variant="h5"
        fontWeight={700}
        color="#133E87"
        sx={{ display: "flex", justifyContent: "center" }}
      >
        {mode === "edit" ? "Edit Notification" : "Add Notification"}
      </Typography>

      <Box sx={{ backgroundColor: "#CBDCEB", p: 4, borderRadius: "25px" }}>
        {/* Message_ID (read-only) */}
        <Typography fontWeight={600} color="primary">
          Message_ID
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <TextField
            fullWidth
            margin="dense"
            variant="standard"
            value={formValues.messageId}
            disabled
            InputProps={{ disableUnderline: true }}
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
                cursor: "not-allowed",
              },
            }}
          />

          {/* Status Switch */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              bgcolor: "#fff",
              borderRadius: "50px",
              height: 48,
              mt: "8px",
              mb: "4px",
              mx: 0.5,
            }}
          >
            <FormControlLabel
              label={
                <Box sx={{ maxWidth: 18, display: "flex", textAlign: "center" }}>
                  {formValues.status ? "On" : "Off"}
                </Box>
              }
              control={
                <Switch
                  checked={formValues.status}
                  disabled={isReadOnly}
                  onChange={(e) =>
                    setFormValues((prev) => ({ ...prev, status: e.target.checked }))
                  }
                  sx={{
                    ml: 1.5,
                    width: 75,
                    height: 55,
                    "& .MuiSwitch-switchBase": {
                      padding: 2.2,
                      "&.Mui-checked": {
                        transform: "translateX(20px)",
                        "& .MuiSwitch-thumb": { backgroundColor: "#fff" },
                        "& + .MuiSwitch-track": { backgroundColor: "#39B129", opacity: 1 },
                      },
                    },
                    "& .MuiSwitch-thumb": { backgroundColor: "#fff", width: 20, height: 20 },
                    "& .MuiSwitch-track": { borderRadius: 10, backgroundColor: "#D41E1E", opacity: 1 },
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

        {/* Message_Name */}
        <Typography fontWeight={600} color="primary">
          Message_Name
        </Typography>
        <TextField
          fullWidth
          margin="dense"
          variant="standard"
          value={formValues.messageName}
          onChange={handleInput("messageName")}
          disabled={isReadOnly}
          InputProps={{ disableUnderline: true }}
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
            "& .MuiInputBase-input": { padding: 0 },
          }}
        />

        {/* Type (select) */}
        <Typography fontWeight={600} color="primary">
          Type
        </Typography>
        <TextField
          select
          margin="dense"
          variant="standard"
          value={formValues.type}
          onChange={handleInput("type")}
          disabled={isReadOnly}
          fullWidth
          InputProps={{ disableUnderline: true }}
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
            "& .MuiInputBase-input": { padding: 0 },
          }}
        >
          {["notification", "warning", "error", "success", "info"].map((type) => (
            <MenuItem key={type} value={type}>
              {type}
            </MenuItem>
          ))}
        </TextField>

        {/* Message (multiline) */}
        <Typography fontWeight={600} color="primary">
          Message
        </Typography>
        <TextField
          multiline
          margin="dense"
          variant="standard"
          value={formValues.message}
          onChange={handleInput("message")}
          disabled={isReadOnly}
          InputProps={{ disableUnderline: true }}
          sx={{
            flex: "1 1 240px",
            mx: 0.5,
            width: "auto",
            minHeight: 48,
            p: 2,
            py: 1,
            display: "flex",
            justifyContent: "center",
            bgcolor: "#fff",
            borderRadius: "30px",
            "& .MuiInputBase-input": { padding: 0 },
          }}
        />

        {/* Source */}
        <Typography fontWeight={600} color="primary">
          Source
        </Typography>

        {isAdd ? (
          // Add mode: แสดงค่า admin แบบอ่านอย่างเดียว (ไม่ให้เลือก)
          <TextField
            margin="dense"
            variant="standard"
            value="admin"
            disabled
            InputProps={{ disableUnderline: true }}
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
              "& .MuiInputBase-input": { padding: 0 },
            }}
          />
        ) : isSourceLocked ? (
          // Edit mode & เดิมเป็น admin: ล็อกไว้ (อ่านอย่างเดียว)
          <TextField
            margin="dense"
            variant="standard"
            value="admin"
            disabled
            InputProps={{ disableUnderline: true }}
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
              "& .MuiInputBase-input": { padding: 0 },
            }}
          />
        ) : (
          // Edit mode ปกติ: เลือกได้ (ถ้าไม่ถูก read-only โดย system)
          <TextField
            select
            margin="dense"
            variant="standard"
            value={formValues.source}
            onChange={handleInput("source")}
            disabled={isReadOnly}
            InputProps={{ disableUnderline: true }}
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
              "& .MuiInputBase-input": { padding: 0 },
            }}
          >
            {["admin", "system"].map((src) => (
              <MenuItem key={src} value={src}>
                {src}
              </MenuItem>
            ))}
          </TextField>
        )}
      </Box>

      {/* Action buttons */}
      {isAdd ? (
        <Box sx={{ display: "flex", justifyContent: "space-between", mt: 3, px: 5 }}>
          <Button
            variant="outlined"
            onClick={() => setFormValues(defaultValues)}
            disabled={!changed}
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
              "&:hover": { backgroundColor: "#fddede", borderColor: "#D32F2F" },
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
              "&:hover": { backgroundColor: "#fddede", borderColor: "#D32F2F" },
            }}
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={!changed || !isValid}
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
              "&:hover": { backgroundColor: "#0f2f6b", boxShadow: "0 4px 10px rgba(0,0,0,0.3)" },
              "&:active": { transform: "scale(0.98)", boxShadow: "0 2px 5px rgba(0,0,0,0.2)" },
            }}
          >
            Add
          </Button>
        </Box>
      ) : (
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            mt: 5,
            px: 2,
            flexWrap: "wrap",
            gap: 2,
          }}
        >
          <Button
            variant="outlined"
            color="error"
            onClick={() => setFormValues(prevValues)}
            disabled={!changed || isReadOnly}
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
              "&:hover": { backgroundColor: "#fddede", borderColor: "#D32F2F" },
            }}
          >
            Reset
          </Button>

          <Button
            variant="contained"
            onClick={() => {
              if (!changed || isReadOnly) return;
              const changes: string[] = [];
              if (formValues.messageName !== prevValues.messageName)
                changes.push(`Title: "${prevValues.messageName}" → "${formValues.messageName}"`);
              if (formValues.message !== prevValues.message)
                changes.push(`Message: "${prevValues.message}" → "${formValues.message}"`);
              if (formValues.status !== prevValues.status)
                changes.push(
                  `Status: ${prevValues.status ? "On" : "Off"} → ${formValues.status ? "On" : "Off"}`
                );
              if (formValues.type !== prevValues.type)
                changes.push(`Type: ${prevValues.type} → ${formValues.type}`);
              if (formValues.source !== prevValues.source)
                changes.push(`Source: ${prevValues.source} → ${formValues.source}`);

              if (changes.length > 0) {
                setLogs((prev) => [
                  ...prev,
                  `[${new Date().toLocaleString()}] ${changes.join(" | ")}`,
                ]);
                setPrevValues(formValues);
                onSubmit(formValues);
              }
            }}
            disabled={!changed || isReadOnly}
            sx={{
              borderRadius: "25px",
              fontSize: "18px",
              fontWeight: "bold",
              px: 7,
              py: 0.5,
              textTransform: "none",
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
                boxShadow: "0 4px 10px rgba(0,0,0,0.3)",
              },
              "&:active": { transform: "scale(0.98)", boxShadow: "0 2px 5px rgba(0,0,0,0.2)" },
              "&:focus": { outline: "none" },
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
