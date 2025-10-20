// src/pages/Registration/StudentFormPage.tsx
import { useState } from "react";
import { Box, Button, Container, Stack, TextField, Typography, Alert, Divider } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../../supabaseClient";
import ArrowBackIcon from "../../../assets/icons/arrow-back.svg?react";
import { normalizeStudentId /*, formatStudentIdWithDashes*/ } from "../../../utils/normalizeStudentId";

export default function StudentFormPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    nameThai: "",
    nameEng: "",
    studentId: "",
    tel: "",
    email: "",
    enrollmentYear: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onChange = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((s) => ({ ...s, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const sid = normalizeStudentId(form.studentId);
if (!sid) {
  setError("รหัสนักศึกษาต้องเป็นตัวเลข 13 หลัก (เช่น 1165104005905)");
  return;
}

    const nameThai = form.nameThai.trim();
    const nameEng = form.nameEng.trim();
    const tel = form.tel.trim() || null;
    const email = form.email.trim() || null;
    const enrollYear = form.enrollmentYear ? parseInt(form.enrollmentYear, 10) : null;

    if (!sid || !nameThai || !nameEng) {
      setError("กรอกชื่อไทย/อังกฤษ และรหัสนักศึกษาให้ครบ");
      return;
    }

    try {
      setSubmitting(true);

      const { error } = await supabase.rpc("add_student_with_user", {
  p_student_id: sid, // ✅ digits only
  p_name_thai: nameThai,
  p_name_eng: nameEng,
  p_enroll_year: enrollYear,
  p_tel: tel,
  p_email: email,
});


      if (error) throw error;

      navigate("/app/home", { state: { refresh: true } });
    } catch (e: any) {
      // โชว์ข้อความชัดเจนขึ้น
      const msg = e?.message || "";
      if (e?.code === "23503") {
        setError("ไม่พบรหัสนี้ในตาราง students ทำให้ FK พัง (ลองใหม่หรือตรวจสิทธิ์/RLS)");
      } else {
        setError(`เพิ่มนักศึกษาไม่สำเร็จ: ${msg}`);
      }
      console.error("❌ add_student_with_user:", e);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    // <Container maxWidth="sm">
    //   <Box component="form" onSubmit={handleSubmit} sx={{ py: 4 }}>
    //     <Typography variant="h5" fontWeight={700} mb={2}>เพิ่มข้อมูลนักศึกษา</Typography>
    //     {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
    //     <Stack spacing={2}>
    //       <TextField label="ชื่อนักศึกษา (ไทย)" value={form.nameThai} onChange={onChange("nameThai")} required />
    //       <TextField label="ชื่อนักศึกษา (อังกฤษ)" value={form.nameEng} onChange={onChange("nameEng")} required />
    //       <TextField label="รหัสนักศึกษา" value={form.studentId} onChange={onChange("studentId")} required />
    //       <TextField label="ปีที่เข้าศึกษา (ค.ศ.)" value={form.enrollmentYear} onChange={onChange("enrollmentYear")} />
    //       <TextField label="เบอร์โทร" value={form.tel} onChange={onChange("tel")} />
    //       <TextField label="อีเมล" type="email" value={form.email} onChange={onChange("email")} />
    //       <Stack direction="row" spacing={2} justifyContent="flex-end" mt={1}>
    //         <Button variant="outlined" onClick={() => navigate(-1)} disabled={submitting}>ยกเลิก</Button>
    //         <Button type="submit" variant="contained" disabled={submitting}>
    //           {submitting ? "กำลังบันทึก..." : "บันทึก"}
    //         </Button>
    //       </Stack>
    //     </Stack>
    //   </Box>
    // </Container>
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
              Add Student
            </Typography>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            <Box sx={{ backgroundColor: "#CBDCEB", p: 4, borderRadius: "25px" }}>
              {/* Message_ID (read-only) */}
              <Typography fontWeight={600} color="primary">
                Student Name (Thai)
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
                  Student Name (English)
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
                Student ID (No need to Specify a dash (-))
                <Typography component="span" color="error"> *</Typography>
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <TextField
                  fullWidth
                  margin="dense"
                  variant="standard"
                  value={form.studentId}
                  onChange={onChange("studentId")}
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
              <Typography fontWeight={600} color="primary">
                Year of study (A.D.)
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <TextField
                  fullWidth
                  margin="dense"
                  variant="standard"
                  value={form.enrollmentYear}
                  onChange={onChange("enrollmentYear")}
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
            <Box sx={{ display: "flex", justifyContent: "space-between", mt: 3, px: 5, gap: 5 }}>
              <Button
                variant="outlined"
                onClick={() => navigate(-1)}
                disabled={submitting}
                sx={{
                  borderRadius: "25px",
                  fontSize: "18px",
                  fontWeight: "bold",
                  px: 8,
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
                  px: 8,
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
