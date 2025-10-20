import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Divider,
  CardContent,
  Card,
  Switch,
  FormControlLabel,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import UserIcon from "../../../assets/icons/user.svg?react";
import SideProfilePanel from "../components/SideProfilePanel";
import ArrowBackIcon from "../../../assets/icons/arrow-back.svg?react";
import DeleteIcon from "../../../assets/icons/bin.svg?react";
import { supabase } from "../../../supabaseClient";

interface UserItem {
  id: number;
  role: "teacher" | "student";
  nameThai: string;
  nameEng: string;
  tel?: string | null;
  email?: string | null;
  subjects?: string[];
  studentId?: string;
  teacherId?: string;
}

type UserInfoPageProps = {
  setIsLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;
  profileImage: string | null;
  setProfileImage: React.Dispatch<React.SetStateAction<string | null>>;
};

export default function UserInfoPage({
  setIsLoggedIn,
  profileImage,
  setProfileImage,
}: UserInfoPageProps) {
  // ใช้คอลัมน์ 'status'
  const ENABLE_FIELD: "status" = "status";
  const ENABLE_ON = "active";
  const ENABLE_OFF = "inactive";

  const { state } = useLocation() as { state: UserItem };

  // รายวิชาของอาจารย์
  const [teacherSubjects, setTeacherSubjects] = useState<string[]>([]);
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [subjectsErr, setSubjectsErr] = useState<string | null>(null);

  const navigate = useNavigate();

  // Toggle enable/disable
  const [checked, setChecked] = useState(false);

  // เลือกวิชา (ยังไม่ได้ใช้ใน UI แต่คงไว้ตามโค้ดเดิม)
  const [selectedSubjectId, setSelectedSubjectId] = useState<number | null>(null);

  // ลบ
  const [openDialog, setOpenDialog] = useState(false);

  // 👉 helper: หา table/key/id จาก role
  const roleInfo = useMemo(() => {
    if (state.role === "teacher") {
      return { table: "teachers", key: "teacher_id", id: String(state.teacherId ?? "") } as const;
    }
    return { table: "students", key: "student_id", id: String(state.studentId ?? "") } as const;
  }, [state.role, state.teacherId, state.studentId]);

  // โหลดค่า status + รายวิชา (ถ้าเป็นอาจารย์)
  useEffect(() => {
    async function loadData() {
      const { table, key, id } = roleInfo;
      if (!id) return;

      // 1) โหลดสถานะ enable/disable
      const { data: one, error: stErr } = await supabase
        .from(table)
        .select(ENABLE_FIELD)
        .eq(key, id)
        .maybeSingle();

      if (!stErr && one) {
        setChecked(one[ENABLE_FIELD] === ENABLE_ON);
      }

      // 2) ถ้าเป็นอาจารย์ → โหลดรายวิชา
      if (state.role !== "teacher" || !state.teacherId) return;

      setLoadingSubjects(true);
      setSubjectsErr(null);

      const { data: ts, error: tsErr } = await supabase
        .from("teacher_subjects")
        .select("subject_id")
        .eq("teacher_id", state.teacherId);

      if (tsErr) {
        setSubjectsErr(tsErr.message);
        setLoadingSubjects(false);
        return;
      }

      const ids = (ts ?? []).map((r) => r.subject_id);
      if (ids.length === 0) {
        setTeacherSubjects([]);
        setLoadingSubjects(false);
        return;
      }

      const { data: subs, error: subsErr } = await supabase
        .from("subjects")
        .select("subject_id, subject_name")
        .in("subject_id", ids);

      if (subsErr) {
        setSubjectsErr(subsErr.message);
        setLoadingSubjects(false);
        return;
      }

      setTeacherSubjects(subs.map((s) => s.subject_name));
      setLoadingSubjects(false);
    }

    loadData();
  }, [roleInfo, state.role, state.teacherId]);

  // 👉 Toggle: อัปเดต DB ด้วย
  const handleChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const next = event.target.checked;
    setChecked(next);

    const { table, key, id } = roleInfo;
    if (!id) return;

    const { error } = await supabase
      .from(table)
      .update({ [ENABLE_FIELD]: next ? ENABLE_ON : ENABLE_OFF })
      .eq(key, id);

    if (error) {
      // rollback ถ้าอัปเดตไม่สำเร็จ
      setChecked(!next);
      alert("อัปเดตสถานะไม่สำเร็จ: " + error.message);
    }
  };

  // 👉 ลบจริงใน DB (ถ้าเป็นอาจารย์ ลบ mapping ก่อน)
  const handleDelete = async () => {
    const { table, key, id } = roleInfo;
    if (!id) {
      alert("ไม่พบรหัสอ้างอิงเพื่อลบ");
      setOpenDialog(false);
      return;
    }

    // ลบ mapping ของอาจารย์ก่อน (ถ้ามี)
    if (state.role === "teacher") {
      await supabase.from("teacher_subjects").delete().eq("teacher_id", id);
    }

    const { error } = await supabase.from(table).delete().eq(key, id);
    setOpenDialog(false);

    if (error) {
      alert("ลบไม่สำเร็จ: " + error.message);
      return;
    }

    // กลับหน้า Home พร้อม refresh
    navigate("/app/home", { state: { refresh: true } });
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: { xs: "column", lg: "row" },
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
        {/* Title */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            mb: 4,
          }}
        >
          <ArrowBackIcon
            onClick={() => navigate("/app/home", { state: { refresh: true } })}
            style={{ width: 28, height: 28, cursor: "pointer" }}
          />
          <Typography
            fontSize="40px"
            fontWeight={900}
            fontStyle="italic"
            color="#133E87"
          >
            Registration
          </Typography>
        </Box>

        <Card
          key={state.id}
          sx={{
            mb: 2,
            bgcolor: "#D6E4EF",
            borderRadius: "28px",
            maxWidth: 600,
            width: "100%",
            minHeight: 150,
            mx: "auto",
          }}
        >
          <CardContent>
            <Box
              sx={{
                flex: 1,
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: 2.5,
                mb: 2,
                position: "relative",
                left: 10,
              }}
            >
              <Box
                sx={{
                  justifyContent: "center",
                  alignItems: "center",
                  display: "flex",
                  width: 65,
                  height: 65,
                  bgcolor: "#fff",
                  borderRadius: 20,
                }}
              >
                <UserIcon color="#133E87" style={{ width: 40, height: 40 }} />
              </Box>
              <Box
                sx={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "start",
                  justifyContent: "center",
                }}
              >
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  {/* Left: Name */}
                  <Box>
                    <Typography fontFamily="Noto Sans Thai" color="#133E87" fontSize="20px" fontWeight="500">
                      {state.nameThai}
                    </Typography>
                    <Typography fontFamily="Inter" color="#133E87" fontSize="20px" fontWeight="300">
                      {state.nameEng}
                    </Typography>
                  </Box>

                  {/* Right: Switch */}
                  <FormControlLabel
                    label={checked ? "Enable" : "Disable"}
                    control={
                      <Switch
                        checked={checked}
                        onChange={handleChange}
                        sx={{
                          ml: 20,
                          justifyContent: "flex-end",
                          width: 75,
                          height: 55,
                          "& .MuiSwitch-switchBase": {
                            padding: 2.2,
                            transform: "translateX(px)",
                            "&.Mui-checked": {
                              transform: "translateX(20px)",
                              "& .MuiSwitch-thumb": {
                                backgroundColor: checked ? "#fff" : "#fff",
                              },
                              "& + .MuiSwitch-track": {
                                backgroundColor: "#39B129",
                                opacity: 1,
                              },
                            },
                          },
                          "& .MuiSwitch-thumb": {
                            backgroundColor: "#ffff",
                            width: 20,
                            height: 20,
                          },
                          "& .MuiSwitch-track": {
                            borderRadius: 20 / 2,
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
                      display: "flex",
                      justifyContent: "flex-end",
                    }}
                  />
                </Box>
              </Box>
            </Box>

            <Divider sx={{ borderColor: "#fff", borderBottomWidth: "1px" }} />
            <Box sx={{ display: "flex", px: 2, mt: 1 }}>
              {state.role === "student" && (
                <Box
                  sx={{
                    flex: 2,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                    justifyContent: "start",
                  }}
                >
                  <Typography fontWeight="500" fontSize="20px" color="#133E87" gutterBottom>
                    Student ID :
                  </Typography>
                  <Typography fontWeight="300" fontSize="18px" color="#133E87">
                    {state.studentId}
                  </Typography>
                </Box>
              )}

              {/* Subjects เฉพาะอาจารย์ */}
              {state.role === "teacher" && (
                <Box
                  sx={{
                    flex: 2,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                    justifyContent: "start",
                  }}
                >
                  <Typography fontWeight="500" fontSize="20px" color="#133E87" gutterBottom>
                    Subjects :
                  </Typography>

                  {loadingSubjects && (
                    <Typography fontSize="16px" color="#133E87">Loading...</Typography>
                  )}

                  {!loadingSubjects && subjectsErr && (
                    <Typography fontSize="16px" color="#D41E1E">Error: {subjectsErr}</Typography>
                  )}

                  {!loadingSubjects && !subjectsErr && teacherSubjects.length === 0 && (
                    <Typography fontSize="16px" color="#133E87">No subjects</Typography>
                  )}

                  {!loadingSubjects && !subjectsErr &&
                    teacherSubjects.map((name) => (
                      <Typography key={name} fontWeight="300" fontSize="18px" color="#133E87">
                        {name}
                      </Typography>
                    ))
                  }
                </Box>
              )}

              <Divider orientation="vertical" flexItem sx={{ mx: 2, borderColor: "#fff", borderBottomWidth: "2px" }} />
              <Box
                sx={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                  justifyContent: "start",
                }}
              >
                <Typography fontWeight="500" fontSize="20px" color="#133E87" gutterBottom>
                  Contact{state.role === "student" ? "s" : ""} :
                </Typography>
                <Typography fontWeight="300" fontSize="18px" color="#133E87">
                  {state.tel ?? "-"}
                </Typography>
                <Typography fontWeight="300" fontSize="20px" color="#325288">
                  {state.email}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        <Box
          sx={{
            display: "flex",
            justifyContent: "end",
          }}
        >
          <Button
            onClick={() => setOpenDialog(true)}
            sx={{
              bgcolor: "#D41E1E",
              color: "#fff",
              fontSize: 18,
              fontWeight: 500,
              mx: 3,
              borderRadius: 10,
              "&:hover": {
                bgcolor: "#fff",
                color: "#D41E1E",
                border: "1px solid #D41E1E",
              },
            }}
          >
            <DeleteIcon />
          </Button>
        </Box>
      </Box>

      {/* Column ขวา */}
      <SideProfilePanel
        setIsLoggedIn={setIsLoggedIn}
        profileImage={profileImage}
        setProfileImage={setProfileImage}
      />

      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        PaperProps={{
          sx: {
            borderRadius: 4,
            p: 2,
            minWidth: 360,
          },
        }}
      >
        <DialogTitle
          sx={{
            fontWeight: 700,
            fontSize: "20px",
            color: "#d32f2f",
          }}
        >
          Confirm Deletion
        </DialogTitle>

        <DialogContent sx={{ pb: 1 }}>
          <Typography variant="body1" color="text.secondary">
            Are you sure you want to delete{" "}
            <strong style={{ color: "#000" }}>
              {state.nameEng || state.nameThai}
            </strong>
            ?
          </Typography>
        </DialogContent>

        <DialogActions sx={{ justifyContent: "flex-end", pr: 2 }}>
          <Button
            onClick={() => setOpenDialog(false)}
            variant="outlined"
            sx={{
              borderRadius: 2,
              textTransform: "none",
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDelete}
            variant="contained"
            color="error"
            sx={{
              borderRadius: 2,
              textTransform: "none",
              boxShadow: "none",
            }}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
