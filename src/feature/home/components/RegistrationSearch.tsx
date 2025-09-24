import React, { useState, useMemo, useEffect } from "react";
import { Typography, Card, CardContent, Box, Divider, IconButton } from "@mui/material";
import { debounce } from "lodash";
import { useNavigate, useLocation } from "react-router-dom"; // ⬅️ เพิ่ม useLocation
import UserIcon from "../../../assets/icons/user.svg?react";
import ArrowIcon from "../../../assets/icons/arrow-outlined.svg?react";
import SearchBar from "../../../components/SearchBar";
import { supabase } from "../../../supabaseClient";

type Role = "teacher" | "student";

interface UserItem {
  id: string;
  role: Role;
  nameThai: string;
  nameEng: string;
  tel?: string | null;
  email?: string | null;
  subjects?: string[];
  studentId?: string;
}

export default function RegistrationSearch() {
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<UserItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [loading, setLoading] = useState(true);
  const [people, setPeople] = useState<UserItem[]>([]);
  const navigate = useNavigate();
  const location = useLocation(); // ⬅️

  const fetchAll = async () => {
    setLoading(true);

    const { data: uData, error } = await supabase
      .from("users")
      .select(`
        user_id, role, name_thai, name_eng, tel, email, student_id, teacher_id,
        teachers!users_teacher_fk(
          teacher_id,
          teacher_subjects!teacher_subjects_teacher_fk(
            subjects!teacher_subjects_subject_fk(subject_name)
          )
        )
      `);

    if (error) {
      console.error("❌ fetch users:", error);
      setLoading(false);
      return;
    }

    const formatted: UserItem[] = (uData ?? []).map((u: any) => {
      const subjects =
        u.teachers?.teacher_subjects
          ?.map((ts: any) => ts.subjects?.subject_name)
          ?.filter(Boolean) ?? [];
      return {
        id: u.user_id,
        role: u.role,
        nameThai: u.name_thai,
        nameEng: u.name_eng,
        tel: u.tel,
        email: u.email,
        studentId: u.student_id ?? undefined,
        subjects,
      };
    });

    setPeople(formatted);
    setResults(formatted);
    setLoading(false);
  };

  useEffect(() => {
    fetchAll();
  }, []);

  // รีเฟรชเมื่อกลับมาจากหน้าแบบฟอร์มด้วย state: { refresh: true }
  useEffect(() => {
    if ((location.state as any)?.refresh) {
      fetchAll();
      // เคลียร์ state refresh ออกเพื่อกันรีเฟรชซ้ำเมื่อกด Back/Forward
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, navigate, location.pathname]);

  const debouncedSearch = useMemo(
    () =>
      debounce((value: string, haystack: UserItem[]) => {
        if (!value.trim()) {
          setResults(haystack);
          setIsSearching(false);
          return;
        }
        const v = value.toLowerCase();
        const filtered = haystack.filter((p) =>
          (p.nameThai && p.nameThai.includes(value)) ||
          (p.nameEng && p.nameEng.toLowerCase().includes(v)) ||
          (p.studentId && p.studentId.includes(value))
        );
        setResults(filtered);
        setIsSearching(false);
      }, 300),
    []
  );

  useEffect(() => {
    setIsSearching(true);
    debouncedSearch(searchQuery, people);
  }, [searchQuery, people, debouncedSearch]);

  useEffect(() => () => debouncedSearch.cancel(), [debouncedSearch]);

  // ✅ เปลี่ยนเป็นพาไปหน้าแบบฟอร์ม
  const handleAddTeacher = () => {
    navigate("/app/registration/new/teacher");
  };
  const handleAddStudent = () => {
    navigate("/app/registration/new/student");
  };

  const displayList = results;

  return (
    <Box sx={{ borderRadius: 2, width: "100%", mx: "auto", px: 2 }}>
      <SearchBar
        value={searchQuery}
        onChange={setSearchQuery}
        onAddTeacher={handleAddTeacher}   // ⬅️ ใช้ตัวใหม่
        onAddStudent={handleAddStudent}   // ⬅️ ใช้ตัวใหม่
      />

      <Box mt={2} px={0} sx={{ maxHeight: "calc(100vh - 580px)", overflowY: "auto", pr: 1 }}>
        {loading ? (
          <Typography color="text.secondary" fontStyle="italic">Loading...</Typography>
        ) : displayList.length > 0 ? (
          displayList.map((item) => (
            <Card key={`${item.role}-${item.id}`} sx={{ mb: 2, bgcolor: "#D6E4EF", borderRadius: "28px", maxWidth: 600, minHeight: 150 }}>
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2.5, mb: 2, position: "relative", left: 10 }}>
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", width: 65, height: 65, bgcolor: "#fff", borderRadius: 20 }}>
                    <UserIcon color="#133E87" style={{ width: 40, height: 40 }} />
                  </Box>

                  <Box sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
                    <Typography fontFamily="Noto Sans Thai" color="#133E87" fontSize="20px" fontWeight="500">
                      {item.nameThai}
                    </Typography>
                    <Typography color="#133E87" fontSize="20px" fontWeight="300">
                      {item.nameEng}
                    </Typography>

                    <Box sx={{ position: "absolute", right: 20, top: "50%", transform: "translateY(-50%)" }}>
                      <IconButton
                        sx={{
                          bgcolor: "#fff", width: 35, height: 35,
                          "&:hover": { bgcolor: "#1852b1", boxShadow: 3, "& svg": { color: "#fff" } },
                          "& svg": { color: "#1852b1" }, transition: "0.2s",
                        }}
                        onClick={() => navigate(`/app/userinfo/${item.id}`, { state: item })}
                      >
                        <ArrowIcon style={{ width: 25, height: 25 }} />
                      </IconButton>
                    </Box>
                  </Box>
                </Box>

                <Divider sx={{ borderColor: "#fff", borderBottomWidth: "1px" }} />

                <Box sx={{ display: "flex", px: 2, mt: 1 }}>
                  {item.role === "student" && (
                    <Box sx={{ flex: 2, display: "flex", flexDirection: "column" }}>
                      <Typography fontWeight="500" fontSize="20px" color="#133E87" gutterBottom>
                        Student ID :
                      </Typography>
                      <Typography fontWeight="300" fontSize="18px" color="#133E87">
                        {item.studentId}
                      </Typography>
                    </Box>
                  )}

                  {item.role === "teacher" && (
                    <Box sx={{ flex: 2, display: "flex", flexDirection: "column" }}>
                      <Typography fontWeight="500" fontSize="20px" color="#133E87" gutterBottom>
                        Subjects :
                      </Typography>
                      {(item.subjects ?? []).length
                        ? item.subjects!.map((s, i) => (
                          <Typography key={`${item.id}-s-${i}`} fontWeight="300" fontSize="18px" color="#133E87">
                            {s}
                          </Typography>
                        ))
                        : <Typography fontWeight="300" fontSize="18px" color="#133E87">-</Typography>}
                    </Box>
                  )}

                  <Divider orientation="vertical" flexItem sx={{ mx: 2, borderColor: "#fff", borderBottomWidth: "2px" }} />

                  <Box sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
                    <Typography fontWeight="500" fontSize="20px" color="#133E87" gutterBottom>
                      Contact{item.role === "student" ? "s" : ""} :
                    </Typography>
                    <Typography fontWeight="300" fontSize="18px" color="#133E87">
                      {item.tel ?? "-"}
                    </Typography>
                    <Typography fontWeight="300" fontSize="20px" color="#325288">
                      {item.email ?? "-"}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          ))
        ) : (
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", p: 10 }}>
            <Typography color="error" fontStyle="italic" fontFamily="Inter" fontWeight="400">
              Information not found.
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
}
