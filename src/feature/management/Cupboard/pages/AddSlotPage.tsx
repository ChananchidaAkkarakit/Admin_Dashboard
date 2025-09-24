// frontend/src/feature/management/Cupboard/pages/AddSlotPage.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Typography, Box, TextField, Switch,
  FormControlLabel, Autocomplete, Button
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

export default function AddSlotPage({
  setIsLoggedIn,
  profileImage,
  setProfileImage,
}: AddSlotPageProps) {
  const navigate = useNavigate();
  const { addSlot } = useSlotContext();

  const [teacherList, setTeacherList] = useState<TeacherOption[]>([]);
  const [pendingTeacher, setPendingTeacher] = useState("");
  const [status, setStatus] = useState(false);
  const [capacity, setCapacity] = useState<number>(0);
  const [loadingTeachers, setLoadingTeachers] = useState(false);

  // 🆕 พรีวิวรหัสตู้/ช่องถัดไป (เดาโดยดูแถวล่าสุดใน slots)
  const [previewCupboardId, setPreviewCupboardId] = useState<string>("—");
  const [previewSlotId, setPreviewSlotId] = useState<string>("—");
  const [loadingPreview, setLoadingPreview] = useState(false);

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

  // 🆕 ดึงพรีวิวรหัสตู้/รหัสช่องถัดไป
  useEffect(() => {
    (async () => {
      try {
        setLoadingPreview(true);
        // โครงสร้างตาราง slots: คาดว่ามี column cupboard_id, slot_id
        // เอา row ล่าสุดโดยเรียง cupboard_id และ slot_id จากมากไปน้อย
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
          // ยังไม่มีข้อมูลเลย → เริ่มที่ 1,1
          setPreviewCupboardId("1");
          setPreviewSlotId("1");
        } else {
// ดึงค่าล่าสุดจากฐานข้อมูล
const last = data![0] as any;

// Cupboard ID แสดงตรง ๆ
const nextCup = String(last.cupboard_id);

// --- Fix: parse เลข slot ---
// สมมติ slot_id อาจเป็น "S01", "01" หรือ 1
let lastSlotNum = parseInt(String(last.slot_id).replace(/\D/g, ""), 10);
if (isNaN(lastSlotNum)) {
  lastSlotNum = 0; // ถ้า parse ไม่ได้เลย เริ่มจาก 0
}

const nextSlot = `S${lastSlotNum + 1}`; // แปะ prefix S หรือจะโชว์เป็นเลขเฉย ๆ ก็ได้
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

  const handleCreate = async () => {
    if (!pendingTeacher) {
      alert("กรุณาเลือกอาจารย์");
      return;
    }
    // if (!capacity || capacity < 0) {
    //   alert("กรุณาระบุความจุ (capacity) มากกว่า 0");
    //   return;
    // }

    try {
      const created = await addSlot(pendingTeacher, status, capacity);
      // created ควรมี { cupboardId, slotId } ตามที่คุณแจ้ง
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
                sx={{ flex: "1 1 240px", mx: .5, width: "auto", height: 48, pl: 2, display: "flex",
                      justifyContent: "center", bgcolor: "#fff", borderRadius: "50px",
                      "& .MuiInputBase-input": { color: "#aaadb1ff", cursor: "not-allowed" } }} />


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
                sx={{ flex: "1 1 240px", mx: .5, width: "auto", height: 48, pl: 2, display: "flex",
                      justifyContent: "center", bgcolor: "#fff", borderRadius: "50px",
                      "& .MuiInputBase-input": { color: "#aaadb1ff", cursor: "not-allowed" } }} />

              <Box
                sx={{
                  display: "flex", alignItems: "center", bgcolor: "#fff",
                  borderRadius: "50px", height: 48, mt: "8px", mb: "4px", mx: 0.5,
                }}
              >
                <FormControlLabel
                  label={<Box sx={{ maxWidth: 18, textAlign: "center" }}>{status ? "On" : "Off"}</Box>}
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
                            "& + .MuiSwitch-track": { backgroundColor: "#39B129", opacity: 1 },
                          },
                        },
                        "& .MuiSwitch-thumb": { backgroundColor: "#fff", width: 20, height: 20 },
                        "& .MuiSwitch-track": { borderRadius: 10, backgroundColor: "#D41E1E", opacity: 1 },
                      }}
                    />
                  }
                  sx={{ "& .MuiFormControlLabel-label": { fontSize: "15px", fontWeight: 400, fontStyle: "italic", color: "#133E87" } }}
                />
              </Box>
            </Box>

            {/* Capacity */}
            <Typography fontWeight={600} color="primary" sx={{ mt: 1 }}>Capacity</Typography>
            <TextField
              type="number"
              value={capacity}
              onChange={(e) => setCapacity(Number(e.target.value))}
              fullWidth
              margin="dense"
              variant="standard"
              InputProps={{ disableUnderline: true }}
                sx={{ flex: "1 1 240px", mx: .5, width: "auto", height: 48, pl: 2, display: "flex",
                      justifyContent: "center", bgcolor: "#fff", borderRadius: "50px",
                "& .MuiInputBase-input": { padding: 0 },
              }}
            />

            {/* Teacher */}
            <Typography fontWeight={600} color="primary" sx={{ mt: 1 }}>Teacher_id</Typography>
            <Autocomplete
              options={teacherList}
              loading={loadingTeachers}
              getOptionLabel={(o) => `${o.id}            | ${o.name}`}
              value={teacherList.find((t) => t.id === pendingTeacher) || null}
              onChange={(_, v) => v && setPendingTeacher(v.id)}
              renderInput={(params) => (
                <TextField {...params} fullWidth margin="dense" variant="standard"
                  InputProps={{ ...params.InputProps, disableUnderline: true }}
                  sx={{ flex: "1 1 240px", mx: .5, width: "auto", height: 48, p: 2, display: "flex",
                        justifyContent: "center", bgcolor: "#fff", borderRadius: "50px",
                        "& .MuiInputBase-input": { padding: 0 } }} />
              )}
              slotProps={{
                paper: { sx: {
                  mt: 2, borderRadius: "16px", boxShadow: "0px 4px 10px rgba(0,0,0,0.1)", backgroundColor: "#fff",
                  "& .MuiAutocomplete-option": { px: 2, py: 1, "&:hover": { backgroundColor: "#E1EBF4" },
                    "&[aria-selected='true']": { backgroundColor: "#CBDCEB" } }
                }}
              }}
            />
          </Box>
        </Box>

        {/* Actions */}
        <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 5, px: 5 }}>
          <Button
            variant="contained"
            onClick={handleCreate}
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
