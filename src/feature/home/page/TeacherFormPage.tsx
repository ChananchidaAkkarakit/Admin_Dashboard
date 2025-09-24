// src/pages/Registration/TeacherFormPage.tsx
import { useState } from "react";
import { Box, Button, Container, Stack, TextField, Typography, Alert, Divider } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../../supabaseClient";
import ArrowBackIcon from "../../../assets/icons/arrow-back.svg?react";

export default function TeacherFormPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    nameThai: "",
    nameEng: "",
    tel: "",
    email: "",
    department: ""
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onChange = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((s) => ({ ...s, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!form.nameThai.trim() || !form.nameEng.trim()) {
      setError("กรอกชื่อไทยและชื่ออังกฤษให้ครบ");
      return;
    }

    try {
      setSubmitting(true);

      // 1) ให้ DB gen teacher_id
      const { data: t, error: tErr } = await supabase
        .from("teachers")
        .insert({ department: form.department || null })
        .select("teacher_id")
        .single();
      if (tErr) throw tErr;

      const teacherId = t!.teacher_id.toUpperCase();

      // 2) upsert users (role=teacher)
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
          { onConflict: "role,teacher_id" }
        );
      if (uErr) throw uErr;

      navigate("/app/registration", { state: { refresh: true } });
    } catch (e: any) {
      console.error("❌ add teacher:", e);
      setError(e?.message ?? "เพิ่มอาจารย์ไม่สำเร็จ");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "column", md: "none", lg: "row" }, width: "100%" }}>
      <Box sx={{ flex: 1, width: "100%", pr: { xs: 0, md: 0, lg: 3 } }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}>
          <ArrowBackIcon onClick={() => navigate(-1)} style={{ width: 28, height: 28, cursor: "pointer" }} />
          <Typography fontSize="40px" fontWeight={900} fontStyle="italic" color="#133E87">Registration</Typography>
        </Box>
        <Divider sx={{ mt: 3, mb: 2, borderColor: "#CBDCEB" }} />
        <Container maxWidth="sm">
          <Box component="form" onSubmit={handleSubmit}>
          <Box display="flex" flexDirection="column" gap={2}>
            <Typography
              variant="h5"
              fontWeight={700}
              color="#133E87"
              sx={{ display: "flex", justifyContent: "center" }}
            >
              Add Teacher
            </Typography>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            <Box sx={{ backgroundColor: "#CBDCEB", p: 4, borderRadius: "25px" }}>
              {/* Message_ID (read-only) */}
              <Typography fontWeight={600} color="primary">
                Teacher_Name (Thai)
                <Typography component="span" color="error"> *</Typography>
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <TextField
                  fullWidth
                  margin="dense"
                  variant="standard"
                  value={form.nameThai}
                  onChange={onChange("nameThai")}
                  required
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
                    "& .MuiInputBase-input": {
                      color: "#000000",
                    },
                  }}
                />
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                <Typography fontWeight={600} color="primary">
                  Teacher_Name (English)
                  <Typography component="span" color="error"> *</Typography>
                </Typography>
              </Box>
              <TextField
                fullWidth
                margin="dense"
                variant="standard"
                value={form.nameEng}
                onChange={onChange("nameEng")}
                required
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
                  "& .MuiInputBase-input": {
                    color: "#000000",
                  },
                }}
              />
              <Typography fontWeight={600} color="primary">
                Department
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <TextField
                  fullWidth
                  margin="dense"
                  variant="standard"
                  value={form.department}
                  onChange={onChange("department")}
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
                    "& .MuiInputBase-input": {
                      color: "#000000",
                    },
                  }}
                />
              </Box>
              <Typography fontWeight={600} color="primary">
                Telephone
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <TextField
                  fullWidth
                  margin="dense"
                  variant="standard"
                  value={form.tel}
                  onChange={onChange("tel")}
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
                    "& .MuiInputBase-input": {
                      color: "#000000",
                    },
                  }}
                />
              </Box>
              <Typography fontWeight={600} color="primary">
                Email
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <TextField
                  fullWidth
                  margin="dense"
                  variant="standard"
                  type="email"
                  value={form.email}
                  onChange={onChange("email")}
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
                    "& .MuiInputBase-input": {
                      color: "#000000",
                    },
                  }}
                />
              </Box>
            </Box>
            {/* <Stack spacing={5} >
              <TextField label="ชื่ออาจารย์ (ไทย)" value={form.nameThai} onChange={onChange("nameThai")} required />
              <TextField label="ชื่ออาจารย์ (อังกฤษ)" value={form.nameEng} onChange={onChange("nameEng")} required />
              <TextField label="ภาควิชา" value={form.department} onChange={onChange("department")} />
              <TextField label="เบอร์โทร" value={form.tel} onChange={onChange("tel")} />
              <TextField label="อีเมล" type="email" value={form.email} onChange={onChange("email")} />
              <Stack direction="row" spacing={2} justifyContent="flex-end" mt={1}> */}
            {/* <Button variant="outlined" onClick={() => navigate(-1)} disabled={submitting}>ยกเลิก</Button> */}
            <Box sx={{ display: "flex", justifyContent: "space-between", mt: 3, px: 5, gap: 5}}>
              <Button
                variant="outlined"
                onClick={() => navigate(-1)}
                disabled={submitting}
                sx={{
                  borderRadius: "25px",
                  fontSize: "18px",
                  fontWeight: "bold",
                  px: 10,
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
                disabled={submitting}
                sx={{
                  borderRadius: "25px",
                  fontSize: "18px",
                  fontWeight: "bold",
                  px: 10,
                  py: 1.2,
                  textTransform: "none",
                  backgroundColor: "#133E87",
                  "&:hover": { backgroundColor: "#0f2f6b" },
                }}
              >
                {submitting ? "Adding..." : "Add"}
              </Button>
            </Box>

            {/* <Button type="submit" variant="contained" disabled={submitting}>
              {submitting ? "กำลังบันทึก..." : "บันทึก"}
            </Button> */}
            {/* </Stack>
            </Stack> */}
          </Box>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}
