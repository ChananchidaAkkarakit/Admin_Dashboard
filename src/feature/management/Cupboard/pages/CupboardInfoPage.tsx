import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  Typography, Box, TextField, Switch, FormControlLabel,
  Autocomplete, Button, Dialog, DialogActions, DialogContent, DialogTitle, FormHelperText
} from "@mui/material";
import ArrowBackIcon from "../../../../assets/icons/arrow-back.svg?react";
import SideProfilePanel from "../../../home/components/SideProfilePanel";
import { useSlotContext, type Slot } from "../contexts/SlotContext";
import { supabase } from "../../../../supabaseClient";

type CupboardInfoPageProps = {
  setIsLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;
  profileImage: string | null;
  setProfileImage: React.Dispatch<React.SetStateAction<string | null>>;
};

type TeacherOption = { id: string; name: string };

export default function CupboardInfoPage({
  setIsLoggedIn,
  profileImage,
  setProfileImage,
}: CupboardInfoPageProps) {
  const navigate = useNavigate();
  const { slotId } = useParams();
  const location = useLocation();
  const { slots, updateSlotStatus, updateTeacher } = useSlotContext();

  const slotFromState = location.state as Slot | undefined;
  const slot = useMemo(
    () => slotFromState ?? slots.find((s) => s.slotId === slotId),
    [slotFromState, slots, slotId]
  );

  // อาจารย์ที่ถูกใช้แล้วใน "ช่องอื่น" (อนุญาตให้เลือกอาจารย์เดิมของช่องนี้ได้)
  const usedTeacherIds = useMemo(() => {
    const set = new Set<string>();
    for (const s of slots) {
      if (s.teacherId && s.slotId !== slot?.slotId) set.add(String(s.teacherId));
    }
    return set;
  }, [slots, slot?.slotId]);

  const [status, setStatus] = useState(slot?.connectionStatus === "online");
  const [prevStatus, setPrevStatus] = useState(slot?.connectionStatus === "online");

  const [teacherList, setTeacherList] = useState<TeacherOption[]>([]);
  const [pendingTeacher, setPendingTeacher] = useState(slot?.teacherId ?? "");
  const [prevTeacherId, setPrevTeacherId] = useState(slot?.teacherId ?? "");
  const [teacherErr, setTeacherErr] = useState<string | null>(null);

  const selectedTeacher: TeacherOption | null = useMemo(
    () => teacherList.find((t) => t.id === pendingTeacher) ?? null,
    [teacherList, pendingTeacher]
  );

  const [teacherLogs, setTeacherLogs] = useState<
    { timestamp: string; teacherId: string; teacherName: string; message: string }[]
  >([]);
  const [logOpen, setLogOpen] = useState(false);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("users")
        .select("teacher_id, name_thai, name_eng")
        .eq("role", "teacher")
        .not("teacher_id", "is", null)
        .order("teacher_id");
      if (!error) {
        setTeacherList(
          (data ?? []).map((t: any) => ({
            id: String(t.teacher_id),
            name: `${t.name_thai} (${t.name_eng})`,
          }))
        );
      } else {
        console.error("Failed to load teachers:", error);
      }
    })();
  }, []);

  useEffect(() => {
    if (slot) {
      setPendingTeacher(slot.teacherId ?? "");
      setPrevTeacherId(slot.teacherId ?? "");
      setStatus(slot.connectionStatus === "online");
      setPrevStatus(slot.connectionStatus === "online");
    }
  }, [slot]);

  if (!slot) {
    return (
      <Box p={3}>
        <Typography color="error">ไม่พบข้อมูล slot (slotId: {slotId})</Typography>
      </Box>
    );
  }

  // กด Apply ได้เมื่อ: เปลี่ยนสถานะ หรือ เปลี่ยนอาจารย์เป็นคนใหม่ที่ "ไม่ถูกใช้ในช่องอื่น"
  const teacherChanged = pendingTeacher !== prevTeacherId;
  const teacherSelectable = !!selectedTeacher && !usedTeacherIds.has(pendingTeacher);
  const canApply = status !== prevStatus || (teacherChanged && teacherSelectable);

  return (
    <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "column", md: "none", lg: "row" }, width: "100%" }}>
      <Box sx={{ flex: 1, width: "100%", pr: { xs: 0, md: 0, lg: 3 } }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}>
          <ArrowBackIcon onClick={() => navigate(-1)} style={{ width: 28, height: 28, cursor: "pointer" }} />
          <Typography fontSize="40px" fontWeight={900} fontStyle="italic" color="#133E87">Management</Typography>
        </Box>

        <Box sx={{ borderRadius: "35px", width: "auto", height: "55px", px: 2, bgcolor: "#E4EDF6", border: "2px solid #CBDCEB", boxShadow: "0 2px 8px 0 rgba(18,42,66,.04)", alignContent: "center", color: "#133E87", fontSize: 16 }}>
          Cupboard Management
        </Box>

        <Box mt={4}>
          <Box sx={{ width: "100%", bgcolor: "#CBDCEB", px: 4, py: 2, borderRadius: "25px" }}>
            <Typography fontWeight={600} color="primary">Cupboard_id</Typography>
            <TextField value={slot.cupboardId} fullWidth margin="dense" variant="standard"
              InputProps={{ readOnly: true, disableUnderline: true }}
              sx={{ flex: "1 1 240px", mx: .5, width: "auto", height: 48, pl: 2, display: "flex", justifyContent: "center", bgcolor: "#fff", borderRadius: "50px", "& .MuiInputBase-input": { color: "#aaadb1ff", cursor: "not-allowed" } }} />

            <Typography fontWeight={600} color="primary">Slot_id</Typography>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <TextField value={slot.slotId} fullWidth margin="dense" variant="standard"
                InputProps={{ readOnly: true, disableUnderline: true }}
                sx={{ flex: "1 1 240px", mx: .5, width: "auto", height: 48, pl: 2, display: "flex", justifyContent: "center", bgcolor: "#fff", borderRadius: "50px", "& .MuiInputBase-input": { color: "#aaadb1ff", cursor: "not-allowed" } }} />

              <Box sx={{ display: "flex", alignItems: "center", bgcolor: "#fff", borderRadius: "50px", height: 48, mt: "8px", mb: "4px", mx: .5 }}>
                <FormControlLabel
                  label={<Box sx={{ maxWidth: 18, display: "flex", textAlign: "center" }}>{status ? "On" : "Off"}</Box>}
                  control={
                    <Switch
                      checked={status}
                      onChange={(e) => setStatus(e.target.checked)}
                      sx={{
                        ml: 1.5, width: 75, height: 55,
                        "& .MuiSwitch-switchBase": {
                          padding: 2.2,
                          "&.Mui-checked": {
                            transform: "translateX(20px)",
                            "& + .MuiSwitch-track": { backgroundColor: "#39B129", opacity: 1 }
                          }
                        },
                        "& .MuiSwitch-thumb": { backgroundColor: "#fff", width: 20, height: 20 },
                        "& .MuiSwitch-track": { borderRadius: 10, backgroundColor: "#D41E1E", opacity: 1 }
                      }}
                    />
                  }
                  sx={{ "& .MuiFormControlLabel-label": { fontSize: "15px", fontWeight: 400, fontStyle: "italic", color: "#133E87" } }}
                />
              </Box>
            </Box>

            <Typography fontWeight={600} color="primary" sx={{ mt: 1 }}>
              Teacher_id
              <Typography component="span" color="error"> *</Typography>
            </Typography>

            <Autocomplete<TeacherOption>
              options={teacherList}
              value={selectedTeacher}
              onChange={(_, v) => {
                const id = v?.id ?? "";
                setPendingTeacher(id);
                setTeacherErr(id ? null : "กรุณาเลือกอาจารย์");
              }}
              isOptionEqualToValue={(o, v) => o.id === (v?.id ?? "")}
              getOptionLabel={(o) => `${o.id}            | ${o.name}`}
              // ปิดตัวเลือกอาจารย์ที่ถูกใช้ใน "ช่องอื่น"
              getOptionDisabled={(o) => usedTeacherIds.has(o.id)}
              slotProps={{
                paper: { sx: { mt: 1, borderRadius: 3, boxShadow: "0 8px 24px rgba(0,0,0,.08)", overflow: "hidden" } },
              }}
              ListboxProps={{
                sx: {
                  py: 0,
                  "& .MuiAutocomplete-option": {
                    color: "#7A7A7A",
                    py: 1, px: 1.25,
                    "&:hover": { bgcolor: "#ECF6FF", fontWeight: 500 },
                    "&.Mui-focused": { bgcolor: "#ECF6FF" },
                    '&[aria-selected="true"]': { bgcolor: "#E8F2FF" },
                    '&[aria-disabled="true"]': { opacity: 0.5 },
                  },
                },
              }}
              renderInput={(params) => (
                <Box>
                  <TextField
                    {...params}
                    variant="standard"
                    placeholder="เลือกอาจารย์…"
                    InputProps={{ ...params.InputProps, disableUnderline: true }}
                    sx={{
                      bgcolor: "#fff", borderRadius: "50px", height: 48, px: 2,
                      "& .MuiInputBase-root, & .MuiAutocomplete-inputRoot": {
                        height: 48, display: "flex", alignItems: "center", padding: "0 !important",
                      },
                      "& .MuiInputBase-input, & .MuiAutocomplete-input": { padding: "0 !important" },
                    }}
                  />
                  {teacherErr && <FormHelperText error sx={{ ml: 2 }}>{teacherErr}</FormHelperText>}
                </Box>
              )}
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
              setTeacherErr(null);
            }}
            disabled={status === prevStatus && pendingTeacher === prevTeacherId}
            sx={{
              borderRadius: "25px", fontSize: "18px", fontWeight: "bold", px: 6, py: 1.2, textTransform: "none",
              borderColor: "#D32F2F", color: "#D32F2F", ml: 2,
              "&:hover": { backgroundColor: "#fddede", borderColor: "#D32F2F" }
            }}
          >
            Reset
          </Button>

          <Button
            variant="contained"
            disabled={!canApply}
            onClick={async () => {
              const logs: string[] = [];

              // ป้องกันซ้ำอีกรอบก่อนยิงอัปเดต (กัน race condition)
              if (teacherChanged) {
                if (!pendingTeacher) {
                  setTeacherErr("กรุณาเลือกอาจารย์");
                  return;
                }
                if (usedTeacherIds.has(pendingTeacher)) {
                  setTeacherErr("อาจารย์คนนี้ถูกผูกกับตู้/ช่องอื่นแล้ว");
                  return;
                }
                const selected = teacherList.find((t) => t.id === pendingTeacher);
                const previous = teacherList.find((t) => t.id === prevTeacherId);
                logs.push(
                  `Teacher: ${previous ? `${previous.id} (${previous.name})` : "-"} → ${selected ? `${selected.id} (${selected.name})` : "-"}`
                );
                await updateTeacher(slot.slotId, pendingTeacher);
                setPrevTeacherId(pendingTeacher);
              }

              if (status !== prevStatus) {
                logs.push(`Slot Status: ${prevStatus ? "On" : "Off"} → ${status ? "On" : "Off"}`);
                await updateSlotStatus(slot.slotId, status);
                setPrevStatus(status);
              }

              if (logs.length > 0) {
                const teacherName = teacherList.find((t) => t.id === pendingTeacher)?.name || "";
                setTeacherLogs((prev) => [
                  ...prev,
                  {
                    timestamp: new Date().toLocaleString(),
                    teacherId: pendingTeacher,
                    teacherName,
                    message: logs.join(" | "),
                  },
                ]);
                alert("Apply สำเร็จ");
              }
            }}
            sx={{
              borderRadius: "25px", fontSize: "18px", fontWeight: "bold", px: 7, py: .5, textTransform: "none",
              backgroundColor: "#133E87", "&:hover": { backgroundColor: "#0f2f6b" }
            }}
          >
            Apply
          </Button>

          <Button
            variant="outlined"
            color="secondary"
            onClick={() => setLogOpen(true)}
            sx={{
              borderRadius: "25px", fontSize: "18px", fontWeight: "bold", px: 6, py: 1.2, textTransform: "none",
              backgroundColor: "#133E87", color: "#fff", borderColor: "#133E87",
              boxShadow: "0 3px 6px rgba(0,0,0,.2)", "&:hover": { backgroundColor: "#0f2f6b", borderColor: "#0f2f6b" }
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
                teacherLogs.map((log, i) => (
                  <Box key={i} mb={1} p={1} bgcolor="#F5F5F5" borderRadius={2}>
                    <Typography fontSize={14}>[{log.timestamp}] → {log.message}</Typography>
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
