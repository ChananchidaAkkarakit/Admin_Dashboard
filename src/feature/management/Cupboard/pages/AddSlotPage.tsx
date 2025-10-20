// frontend/src/feature/management/Cupboard/pages/AddSlotPage.tsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Typography, Box, TextField, Switch,
  FormControlLabel, Autocomplete, Button, FormHelperText
} from "@mui/material";
import ArrowBackIcon from "../../../../assets/icons/arrow-back.svg?react";
import SideProfilePanel from "../../../home/components/SideProfilePanel";
import { supabase } from "../../../../supabaseClient";
import { useSlotContext } from "../contexts/SlotContext";

type AddSlotPageProps = {
  setIsLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;
  profileImage: string | null;
  setProfileImage: React.Dispatch<React.SetStateAction<string | null>>;
};

type TeacherOption = { id: string; name: string };
type SlotConnection = "active" | "inactive";

// ✅ ค่าตั้งต้น
const DEFAULT_CAPACITY_MM = 0;
const DEFAULT_STATUS: SlotConnection = "inactive"; // ให้เริ่ม inactive

export default function AddSlotPage({
  setIsLoggedIn,
  profileImage,
  setProfileImage,
}: AddSlotPageProps) {
  const navigate = useNavigate();
  const { slots, addSlot } = useSlotContext();

  // 🆕 อาจารย์ที่ถูกใช้แล้วทั้งหมด (อิงจาก context)
  const usedTeacherIds = useMemo(() => {
    const set = new Set<string>();
    for (const s of slots) if (s.teacherId) set.add(String(s.teacherId));
    return set;
  }, [slots]);

  const [teacherList, setTeacherList] = useState<TeacherOption[]>([]);
  const [pendingTeacher, setPendingTeacher] = useState("");
  const [teacherErr, setTeacherErr] = useState<string | null>(null);
  const [loadingTeachers, setLoadingTeachers] = useState(false);

  const isReady = !!pendingTeacher && !loadingTeachers; // เลือกอาจารย์แล้วถึงกดได้

  // ค่าที่บล็อกแก้ไข
  const [capacity] = useState<number>(DEFAULT_CAPACITY_MM);
  const [status] = useState<boolean>(DEFAULT_STATUS === "active");

  // 🆕 พรีวิวรหัสตู้/ช่องถัดไป (ดูจากแถวล่าสุดใน slots)
  const [previewCupboardId, setPreviewCupboardId] = useState<string>("—");
  const [previewSlotId, setPreviewSlotId] = useState<string>("—");
  const [loadingPreview, setLoadingPreview] = useState(false);

  // option ที่เลือกใน Autocomplete
  const selectedTeacher: TeacherOption | null =
    teacherList.find((t) => t.id === pendingTeacher) ?? null;

  // โหลดรายชื่ออาจารย์จาก users (role=teacher และมี teacher_id)
  useEffect(() => {
    (async () => {
      setLoadingTeachers(true);
      const { data, error } = await supabase
        .from("users")
        .select("teacher_id, name_thai, name_eng")
        .eq("role", "teacher")
        .not("teacher_id", "is", null)
        .order("teacher_id", { ascending: true });

      if (error) {
        console.error("load teachers:", error);
      } else {
        setTeacherList(
          (data ?? []).map((t: any) => ({
            id: String(t.teacher_id),
            name: `${t.name_thai ?? "-"} (${t.name_eng ?? "-"})`,
          }))
        );
      }
      setLoadingTeachers(false);
    })();
  }, []);

  // ดึงพรีวิวรหัสตู้/รหัสช่องถัดไป
  useEffect(() => {
    (async () => {
      try {
        setLoadingPreview(true);
        const { data, error } = await supabase
          .from("slots")
          .select("cupboard_id, slot_id")
          .order("cupboard_id", { ascending: false })
          .order("slot_id", { ascending: false })
          .limit(1);

        if (error) {
          console.error("preview next ids:", error);
          setPreviewCupboardId("—");
          setPreviewSlotId("—");
        } else if ((data ?? []).length === 0) {
          // ยังไม่มีข้อมูลเลย → เริ่มที่ 1, S1
          setPreviewCupboardId("1");
          setPreviewSlotId("S1");
        } else {
          const last = data![0] as any;
          const nextCup = String(last.cupboard_id);

          // รองรับ slot_id เป็น "S01", "01" หรือเลขล้วน
          let lastSlotNum = parseInt(String(last.slot_id).replace(/\D/g, ""), 10);
          if (isNaN(lastSlotNum)) lastSlotNum = 0;

          const nextSlot = `S${lastSlotNum + 1}`;
          setPreviewCupboardId(nextCup);
          setPreviewSlotId(nextSlot);
        }
      } catch (e) {
        console.error(e);
        setPreviewCupboardId("—");
        setPreviewSlotId("—");
      } finally {
        setLoadingPreview(false);
      }
    })();
  }, []);

  // กดสร้าง
  const handleCreate = async () => {
    if (!pendingTeacher) {
      setTeacherErr("กรุณาเลือกอาจารย์");
      return;
    }
    // กันซ้ำอีกชั้นก่อนยิง addSlot (ป้องกัน race condition)
    if (usedTeacherIds.has(pendingTeacher)) {
      setTeacherErr("อาจารย์คนนี้ถูกผูกกับตู้/ช่องอื่นแล้ว");
      return;
    }
    try {
      const created = await addSlot(pendingTeacher, status, capacity);
      alert(`เพิ่มช่องสำเร็จ: ช่อง ${created.slotId} ในตู้ ${created.cupboardId}`);
      navigate(-1);
    } catch (e: any) {
      console.error(e);
      alert(e?.message ?? "ไม่สามารถเพิ่มข้อมูลได้");
    }
  };

  return (
    <Box sx={{ display: "flex", flexDirection: { xs: "column", lg: "row" }, width: "100%" }}>
      <Box sx={{ flex: 1, width: "100%", pr: { xs: 0, md: 0, lg: 3 } }}>
        {/* Header */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}>
          <ArrowBackIcon onClick={() => navigate(-1)} style={{ width: 28, height: 28, cursor: "pointer" }} />
          <Typography fontSize="40px" fontWeight={900} fontStyle="italic" color="#133E87">
            Management
          </Typography>
        </Box>

        {/* Title bar */}
        <Box
          sx={{
            borderRadius: "35px",
            width: "auto",
            height: "55px",
            px: 2,
            bgcolor: "#E4EDF6",
            border: "2px solid #CBDCEB",
            boxShadow: "0 2px 8px 0 rgba(18,42,66,.04)",
            alignContent: "center",
            color: "#133E87",
            fontSize: 16,
            display: "flex",
            alignItems: "center",
          }}
        >
          Cupboard Management
        </Box>

        {/* Form */}
        <Box mt={4}>
          <Box sx={{ width: "100%", bgcolor: "#CBDCEB", px: 4, py: 2, borderRadius: "25px" }}>
            {/* Cupboard ID (Preview) */}
            <Typography fontWeight={600} color="primary">
              Cupboard ID {loadingPreview ? "(loading…)" : "(Preview)"}
            </Typography>
            <TextField
              value={previewCupboardId}
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
                "& .MuiInputBase-input": { color: "#aaadb1ff", cursor: "not-allowed" },
              }}
            />

            {/* Slot ID (Preview) + Switch */}
            <Typography fontWeight={600} color="primary" sx={{ mt: 1 }}>
              Slot ID {loadingPreview ? "(loading…)" : "(Preview)"}
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <TextField
                value={previewSlotId}
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
                  "& .MuiInputBase-input": { color: "#aaadb1ff", cursor: "not-allowed" },
                }}
              />

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
                  label={<Box sx={{ maxWidth: 18, textAlign: "center" }}>{status ? "On" : "Off"}</Box>}
                  control={
                    <Switch
                      checked={status}
                      disabled // บล็อกสวิตช์ (ค่าเริ่มต้น inactive)
                      sx={{
                        ml: 1.5,
                        width: 75,
                        height: 55,
                        "& .MuiSwitch-switchBase": {
                          padding: 2.2,
                          "&.Mui-checked": {
                            transform: "translateX(20px)",
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

            {/* Capacity (บล็อกแก้ไข) */}
            <Typography fontWeight={600} color="primary" sx={{ mt: 1 }}>
              Capacity
            </Typography>
            <TextField
              type="number"
              value={capacity}
              fullWidth
              margin="dense"
              variant="standard"
              disabled
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
                "& .MuiInputBase-input": { color: "#aaadb1ff", cursor: "not-allowed" },
              }}
            />

            {/* Teacher */}
            <Typography fontWeight={600} color="primary" sx={{ mt: 1 }}>
              Teacher_id
              <Typography component="span" color="error">
                {" "}
                *
              </Typography>
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
              // ปิดตัวเลือกอาจารย์ที่ถูกใช้แล้ว
              getOptionDisabled={(o) => usedTeacherIds.has(o.id)}
              slotProps={{
                paper: {
                  sx: {
                    mt: 1,
                    borderRadius: 3,
                    boxShadow: "0 8px 24px rgba(0,0,0,.08)",
                    overflow: "hidden",
                  },
                },
              }}
              ListboxProps={{
                sx: {
                  py: 0,
                  "& .MuiAutocomplete-option": {
                    color: "#7A7A7A",
                    py: 1,
                    px: 1.25,
                    "&:hover": { bgcolor: "#ECF6FF", fontWeight: 500 },
                    "&.Mui-focused": { bgcolor: "#ECF6FF" },
                    '&[aria-selected="true"]': { bgcolor: "#E8F2FF" },
                    '&[aria-disabled="true"]': { opacity: 0.5 }, // แสดงว่าใช้แล้ว
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
                      bgcolor: "#fff",
                      borderRadius: "50px",
                      height: 48,
                      px: 2,
                      "& .MuiInputBase-root, & .MuiAutocomplete-inputRoot": {
                        height: 48,
                        display: "flex",
                        alignItems: "center",
                        padding: "0 !important",
                      },
                      "& .MuiInputBase-input, & .MuiAutocomplete-input": {
                        padding: "0 !important",
                      },
                    }}
                  />
                  {teacherErr && (
                    <FormHelperText error sx={{ ml: 2 }}>
                      {teacherErr}
                    </FormHelperText>
                  )}
                </Box>
              )}
            />
          </Box>
        </Box>

        {/* Actions */}
        <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 5, px: 5 }}>
          <Button
            variant="contained"
            onClick={handleCreate}
            disabled={!isReady}
            sx={{
              borderRadius: "25px",
              fontSize: "18px",
              fontWeight: "bold",
              px: 7,
              py: 1,
              textTransform: "none",
              backgroundColor: "#133E87",
              "&:hover": { backgroundColor: "#0f2f6b" },
            }}
          >
            Add Slot
          </Button>
        </Box>
      </Box>

      <SideProfilePanel
        setIsLoggedIn={setIsLoggedIn}
        profileImage={profileImage}
        setProfileImage={setProfileImage}
      />
    </Box>
  );
}
