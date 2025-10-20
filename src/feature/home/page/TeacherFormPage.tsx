// src/pages/Registration/TeacherFormPage.tsx
import { useState, useEffect, useMemo } from "react";
import {
  Box,
  Button,
  Container,
  Stack,
  TextField,
  Typography,
  Alert,
  Divider,
  IconButton,
  Collapse,
  FormHelperText,
  Grid,
  Paper,
  Chip,
  InputAdornment,
  Tooltip,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../../supabaseClient";
import ArrowBackIcon from "../../../assets/icons/arrow-back.svg?react";
import AddSubjectIcon from "../../../assets/icons/add.svg?react";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import SearchIcon from "@mui/icons-material/Search";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import AddSubjectPill from "../components/AddSubjectPill";
//import { Button } from "@mui/material"; // ถ้ายังไม่ได้ import


export default function TeacherFormPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    nameThai: "",
    nameEng: "",
    tel: "",
    email: "",
    department: "",
    selectedSubjects: [] as string[],
    newSubject: ""
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [subjectsOpen, setSubjectsOpen] = useState(true);
  const [subjectError, setSubjectError] = useState<string | null>(null);
  const [subjectFilter, setSubjectFilter] = useState("");
  const [showAdd, setShowAdd] = useState(false);     // โชว์/ซ่อนช่องเพิ่มวิชา
  const [confirmOpen, setConfirmOpen] = useState(false); // เปิด/ปิด popup ยืนยัน
  const [subjectIdByName, setSubjectIdByName] = useState<Record<string, number>>({});


  useEffect(() => {
    const fetchSubjects = async () => {
      setLoadingSubjects(true);
      const { data, error } = await supabase
        .from("subjects")
        .select("subject_id, subject_name")
        .order("subject_id");

      if (error) {
        setError("Error loading subjects");
      } else {
        // สำหรับ UI chips ยังใช้ชื่อได้เหมือนเดิม
        setSubjects(data.map((s) => s.subject_name as string));
        // สำหรับบันทึกจริง แปลงเป็น name -> id
        const dict: Record<string, number> = {};
        data.forEach((s: any) => (dict[s.subject_name] = s.subject_id));
        setSubjectIdByName(dict);
      }
      setLoadingSubjects(false);
    };

    fetchSubjects();
  }, []);

  const collator = useMemo(
    () => new Intl.Collator(undefined, { numeric: true, sensitivity: "base" }),
    []
  );

  const filteredSubjects = useMemo(
    () =>
      subjects.filter((s) =>
        s.toLowerCase().includes(subjectFilter.trim().toLowerCase())
      ),
    [subjects, subjectFilter]
  );

  const sortedFilteredSubjects = useMemo(
    () => [...filteredSubjects].sort(collator.compare),
    [filteredSubjects, collator]
  );

  const onChange = (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((s) => ({ ...s, [k]: e.target.value }));

  const handleSubjectChange = (subject: string) => {
    setForm((prev) => {
      const has = prev.selectedSubjects.includes(subject);
      const sel = has
        ? prev.selectedSubjects.filter((x) => x !== subject)
        : [...prev.selectedSubjects, subject];
      if (sel.length > 0) setSubjectError(null);
      return { ...prev, selectedSubjects: sel };
    });
  };

  const handleNewSubject = async () => {
    if (!form.newSubject.trim()) return;
    try {
      const name = form.newSubject.trim();

      const { data, error } = await supabase
        .from("subjects")
        .insert({ subject_name: name })
        .select("subject_id, subject_name")  // <<— สำคัญ
        .single();

      if (error) throw error;

      // อัปเดต UI และ map
      setSubjects((prev) => [...prev, data.subject_name]);
      setSubjectIdByName((prev) => ({ ...prev, [data.subject_name]: data.subject_id }));

      setForm((prev) => ({ ...prev, newSubject: "" }));
      setSubjectsOpen(true);
      setSubjectFilter("");
    } catch (e) {
      console.error(e);
      setError("Error adding new subject");
    }
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (form.selectedSubjects.length === 0) {
      setSubjectError("Please select at least 1 subject");
      setSubjectsOpen(true);
      return;
    }
    if (!form.nameThai.trim() || !form.nameEng.trim()) {
      setError("Please complete both Thai and English names");
      return;
    }

    try {
      setSubmitting(true);
      // 1) gen teacher_id
      const { data: t, error: tErr } = await supabase
        .from("teachers")
        .insert({ department: form.department || null })
        .select("teacher_id")
        .single();
      if (tErr) throw tErr;

      const teacherId = t!.teacher_id;


      // 2) upsert users
      const { error: uErr } = await supabase
        .from("users")
        .upsert(
          {
            user_id: teacherId,
            role: "teacher",
            name_thai: form.nameThai.trim(),
            name_eng: form.nameEng.trim(),
            tel: form.tel.trim() || null,
            email: form.email.trim() || null,
            teacher_id: teacherId,
            status: "active",
            password: "1234",
          },
          { onConflict: "user_id" }   // << แก้จุดนี้
        );


      // 3) save teacher-subjects
      // form.selectedSubjects ตอนนี้ยังเป็น "ชื่อวิชา" อยู่ → map เป็น id ก่อน
      const rows = form.selectedSubjects
        .map((name) => subjectIdByName[name])
        .filter((id): id is number => Number.isInteger(id))
        .map((id) => ({ teacher_id: teacherId, subject_id: id }));

      if (rows.length === 0) {
        throw new Error("No valid subject_id to insert");
      }

      const { error: tsErr } = await supabase.from("teacher_subjects").insert(rows);
      if (tsErr) throw tsErr;


      navigate("/app/home", { state: { refresh: true } });
    } catch (e: any) {
      console.error("❌ add teacher:", e);
      setError(e?.message ?? "Failed to add teacher");
    } finally {
      setSubmitting(false);
    }
  };

  // —— Styles reused
  const fieldSx = {
    flex: "1 1 240px",
    mx: 0.5,
    width: "auto",
    height: 48,
    pl: 2,
    display: "flex",
    justifyContent: "center",
    bgcolor: "#fff",
    borderRadius: "25px",
    "& .MuiInputBase-input": { color: "#000000" },
  };

  const SectionHeader = ({ title, required = false }: { title: string; required?: boolean }) => (
    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 0.5 }}>
      <Typography fontWeight={700} color="#133E87">
        {title} {required && <Typography component="span" color="error">*</Typography>}
      </Typography>
    </Box>
  );

  return (
    <Box sx={{ display: "flex", flexDirection: { xs: "column", lg: "row" }, width: "100%" }}>
      <Box sx={{ flex: 1, width: "100%", }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}>
          <ArrowBackIcon onClick={() => navigate(-1)} style={{ width: 28, height: 28, cursor: "pointer" }} />
          <Typography fontSize="40px" fontWeight={900} fontStyle="italic" color="#133E87">Registration</Typography>
        </Box>

        <Divider sx={{ mt: 3, mb: 2, borderColor: "#CBDCEB" }} />

        <Container maxWidth="lg" sx={{ pb: 4 }}>
          <Box component="form" onSubmit={handleSubmit}>
            <Stack gap={2}>
              <Typography
                variant="h5"
                fontWeight={800}
                color="#133E87"
                sx={{ display: "flex", justifyContent: "center", letterSpacing: 0.2 }}
              >
                Add Teacher
              </Typography>

              {error && <Alert severity="error">{error}</Alert>}

              {/* Card */}
              <Paper
                elevation={0}
                sx={{
                  p: { xs: 2.5, sm: 3.5, md: 4 },
                  borderRadius: "28px",
                  background: "#CBDCEB",
                }}
              >
                <Grid container spacing={3}>
                  {/* LEFT */}
                  <Grid item xs={12} lg={6}>
                    <SectionHeader title="Teacher Name (Thai)" required />
                    <TextField
                      fullWidth
                      margin="dense"
                      variant="standard"
                      value={form.nameThai}
                      onChange={onChange("nameThai")}
                      required
                      InputProps={{ disableUnderline: true }}
                      sx={fieldSx}
                    />

                    <SectionHeader title="Teacher Name (English)" required />
                    <TextField
                      fullWidth
                      margin="dense"
                      variant="standard"
                      value={form.nameEng}
                      onChange={onChange("nameEng")}
                      required
                      InputProps={{ disableUnderline: true }}
                      sx={fieldSx}
                    />

                    {/* Subjects */}

                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <SectionHeader title="Subjects" required />

                      {/* <IconButton
                        aria-label="toggle subjects"
                        size="small"
                        onClick={() => setSubjectsOpen((v) => !v)}
                        sx={{
                          transform: subjectsOpen ? "rotate(180deg)" : "rotate(0deg)",
                          transition: "transform 0.2s ease",
                        }}
                      >
                        <ExpandMoreIcon />
                      </IconButton> */}
                    </Box>

                    <Collapse in={subjectsOpen} timeout="auto" unmountOnExit>
                      <Stack gap={1.5} >
                        {/* (Search field commented out intentionally) */}

                        {/* Chips */}
                        <Box
                          sx={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: 1,
                            p: 0.5,
                            borderRadius: "16px",
                            alignItems: "center",
                          }}
                        ><AddSubjectPill
                            existing={subjects}
                            onAdd={async (name) => {
                              // ป้องกันชื่อซ้ำ/ช่องว่างเกินจำเป็น
                              const clean = name.trim();
                              if (!clean) return;

                              const { data, error } = await supabase
                                .from("subjects")
                                .insert({ subject_name: clean })
                                .select("subject_id, subject_name")   // << ต้องมี
                                .single();

                              if (error) throw error;

                              // อัปเดตลิสต์ชิป + แผนที่ name -> id
                              setSubjects(prev => [...prev, data.subject_name]);
                              setSubjectIdByName(prev => ({ ...prev, [data.subject_name]: data.subject_id }));
                              setSubjectsOpen(true);
                            }}
                            label="Add Subject"
                            placeholder="Subject name"
                          />

                          {loadingSubjects ? (
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1, px: 1 }}>
                              <CircularProgress size={18} />
                              <Typography fontSize={14} color="#656565">Loading subjects...</Typography>
                            </Box>
                          ) : filteredSubjects.length === 0 ? (
                            <Typography fontSize={14} color="#656565" sx={{ px: 1 }}>
                              No subjects found
                            </Typography>
                          ) : (
                            sortedFilteredSubjects.map((subject) => {
                              const selected = form.selectedSubjects.includes(subject);
                              return (
                                <Chip
                                  key={subject}
                                  label={subject}
                                  onClick={() => handleSubjectChange(subject)}
                                  variant="filled"
                                  sx={{
                                    fontSize: "14px",
                                    height: "40px",
                                    borderRadius: "20px",
                                    "& .MuiChip-label": { px: 2, py: 0.35 },

                                    // always white background
                                    bgcolor: "#FFFFFF",
                                    "&:hover": { bgcolor: "#FFFFFF" },

                                    // differentiate by border/text color
                                    color: selected ? "#133E87" : "#828282ff",
                                    border: "1px solid",
                                    borderColor: selected ? "#133E87" : "#E2E8F0",

                                    // subtle emphasis when selected
                                    boxShadow: selected ? "0 2px 8px rgba(19,62,135,0.12)" : "none",
                                  }}
                                />
                              );
                            })
                          )}
                        </Box>

                        {!!subjectError && (
                          <FormHelperText error sx={{ ml: 1 }}>{subjectError}</FormHelperText>
                        )}

                        {/* Add-new (plus button in front of subjects) */}
                        {/* <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, mb: 1 }}> */}
                        {/* ปุ่ม + แบบเม็ดยาเล็ก */}
                        {/* <IconButton
                            onClick={() => {
                              setShowAdd((v) => !v);
                              if (!subjectsOpen) setSubjectsOpen(true);
                            }}
                            sx={{
                              borderRadius: "999px",
                              width: 40,
                              height: 40,
                              bgcolor: "#F4F3EF",
                              border: "1px solid #E8E6DF",
                              "&:hover": { bgcolor: "#F0EFEA" },
                            }}
                            aria-label="Add subject"
                          >
                            <AddSubjectIcon style={{ width: 18, height: 18 }} />
                          </IconButton> */}

                        {/* ช่องกรอกจะแสดงเมื่อกด + */}
                        {/* <Collapse orientation="horizontal" in={showAdd} unmountOnExit>
                            <TextField
                              value={form.newSubject}
                              onChange={onChange("newSubject")}
                              variant="standard"
                              placeholder="New subject name"
                              InputProps={{ disableUnderline: true }}
                              onKeyDown={(e) => {
                                if (e.key === "Enter" && form.newSubject.trim()) {
                                  setConfirmOpen(true); // เปิด popup ยืนยัน
                                }
                                if (e.key === "Escape") {
                                  setShowAdd(false);
                                  setForm((p) => ({ ...p, newSubject: "" }));
                                }
                              }}
                              sx={[
                                fieldSx,
                                {
                                  width: { xs: "100%", sm: 260 },
                                  maxWidth: 320,
                                  flex: "0 0 auto",
                                  alignSelf: "flex-start",
                                },
                              ]}
                            />
                          </Collapse>
                        </Box> */}


                        {/* Pill button like the screenshot */}
                        {/* <Button
                            onClick={() => (showAdd ? handleNewSubject() : setShowAdd(true))}
                            startIcon={<AddSubjectIcon style={{ width: 18, height: 18 }} />}
                            sx={{
                              borderRadius: "999px",
                              px: 2.25,
                              height: 44,
                              bgcolor: "#FFFFFF",
                              color: "#111827",
                              textTransform: "none",
                              fontWeight: 600,
                              letterSpacing: 0.1,
                              border: "1px solid",
                              borderColor: "#E5E7EB",
                              boxShadow: "0 1px 0 rgba(0,0,0,0.03)",
                              "&:hover": {
                                bgcolor: "#F9FAFB",
                                borderColor: "#D1D5DB",
                                boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                              },
                            }}
                          >
                          </Button>

                          {/* Cancel pill (only when adding) */}
                        {/* {showAdd && (
                            <IconButton
                              size="small"
                              onClick={() => {
                                setShowAdd(false);
                                setForm((p) => ({ ...p, newSubject: "" }));
                              }}
                              sx={{
                                borderRadius: "999px",
                                width: 44,
                                height: 44,
                                bgcolor: "#FFFFFF",
                                border: "1px solid #E5E7EB",
                                "&:hover": { bgcolor: "#F9FAFB" },
                              }}
                              aria-label="Cancel"
                            >
                              <CloseRoundedIcon fontSize="small" />
                            </IconButton>
                          )}
                        </Box> */}


                        {/* Selected count */}
                        <Typography fontSize={14} color="#133E87" sx={{ ml: 1 }}>
                          Selected: {form.selectedSubjects.length} subject(s)
                        </Typography>
                      </Stack>
                    </Collapse>

                  </Grid>

                  {/* RIGHT */}
                  <Grid item xs={12} lg={6}>
                    <SectionHeader title="Department" />
                    <TextField
                      fullWidth
                      margin="dense"
                      variant="standard"
                      value={form.department}
                      onChange={onChange("department")}
                      InputProps={{ disableUnderline: true }}
                      sx={fieldSx}
                    />

                    <SectionHeader title="Telephone" />
                    <TextField
                      fullWidth
                      margin="dense"
                      variant="standard"
                      value={form.tel}
                      onChange={onChange("tel")}
                      inputProps={{ inputMode: "tel", pattern: "[0-9\\-\\s+]*" }}
                      placeholder="Ex. 081-234-5678"
                      InputProps={{ disableUnderline: true }}
                      sx={fieldSx}
                    />

                    <SectionHeader title="Email" />
                    <TextField
                      fullWidth
                      margin="dense"
                      variant="standard"
                      type="email"
                      value={form.email}
                      onChange={onChange("email")}
                      placeholder="name@example.com"
                      InputProps={{ disableUnderline: true }}
                      sx={fieldSx}
                    />
                  </Grid>
                </Grid>
              </Paper>

              {/* Actions */}
              <Stack
                direction={{ xs: "column", sm: "row" }}
                justifyContent="center"
                gap={2.5}
                sx={{ mt: 2, px: { xs: 0, md: 2 } }}
              >
                <Button
                  variant="outlined"
                  onClick={() => navigate(-1)}
                  disabled={submitting}
                  sx={{
                    borderRadius: "25px",
                    fontSize: "18px",
                    fontWeight: "bold",
                    px: { xs: 4, sm: 8 },
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
                  type="submit"
                  variant="contained"
                  disabled={submitting || form.selectedSubjects.length === 0}
                  startIcon={submitting ? <CircularProgress size={18} color="inherit" /> : undefined}
                  sx={{
                    borderRadius: "25px",
                    fontSize: "18px",
                    fontWeight: "bold",
                    px: { xs: 4, sm: 8 },
                    py: 1.2,
                    textTransform: "none",
                    backgroundColor: "#133E87",
                    "&:hover": { backgroundColor: "#0f2f6b" },
                  }}
                >
                  {submitting ? "Adding..." : "Add"}
                </Button>
              </Stack>
            </Stack>
          </Box>
        </Container>
        <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
          <DialogTitle>Confirm adding subject</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Add “{form.newSubject.trim()}” to subjects?
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setConfirmOpen(false)}>Cancel</Button>
            <Button
              variant="contained"
              onClick={() => {
                setConfirmOpen(false);
                handleNewSubject();   // ใช้ฟังก์ชันเดิมในการ insert
              }}
              autoFocus
            >
              Add
            </Button>
          </DialogActions>
        </Dialog>

      </Box>
    </Box>
  );
}

