import React, { useState, useMemo } from "react";
import {
  Typography, Card, CardContent, Box, Divider, IconButton, TextField, Menu, MenuItem
} from "@mui/material";
import UserAddIcon from "../../../assets/icons/user-add.svg?react";
import UserIcon from "../../../assets/icons/user.svg?react";
import { debounce } from "lodash";
import ArrowIcon from "../../../assets/icons/arrow-outlined.svg?react";
import { useNavigate } from "react-router-dom";
//import "../page/ReviewPage"

interface UserItem {
  id: number;
  role: "teacher" | "student";
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
  const navigate = useNavigate();


  // เพิ่มทั้งอาจารย์และนักศึกษาใน array เดียว
  const [mockData, setMockData] = useState<UserItem[]>([
    {
      id: 1,
      role: "teacher",
      nameThai: "ผู้ช่วยศาสตราจารย์ สมรรถชัย จันทรัตน์",
      nameEng: "Asst.Prof.Samatachai Jantarat",
      subjects: ["Computer Programming Computer Programmin Computer Programmi"],
      tel: "0-2549-3467",
      email: "samatchai.j@en.rmutt.ac.th",
    },
    {
      id: 2,
      role: "student",
      nameThai: "น.ส. ชนัญชิดา อักขระกิจ",
      nameEng: "Chananchida Akkarakit",
      studentId: "1165104005905",
      tel: "091-234-5678",
      email: "chananchida.st@rmutt.ac.th",
    }
  ]);

  // --- Search Logic ---
  const debouncedSearch = useMemo(
    () =>
      debounce((value: string) => {
        if (value) {
          const filtered = mockData.filter((item) =>
            item.nameThai?.includes(value) ||
            item.nameEng?.toLowerCase().includes(value.toLowerCase())
          );
          setResults(filtered);
        } else {
          setResults([]);
        }
        setIsSearching(false);
      }, 300),
    [mockData]
  );

  React.useEffect(() => {
    if (searchQuery) {
      setIsSearching(true);
      debouncedSearch(searchQuery);
    } else {
      setResults([]);
      setIsSearching(false);
    }
  }, [searchQuery, debouncedSearch]);

  React.useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  // ----------------- เพิ่มเมนูเลือกประเภทการเพิ่ม -----------------
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget as HTMLElement);
  };


  const handleCloseMenu = () => setAnchorEl(null);

  // เพิ่มอาจารย์
  const handleAddTeacher = () => {
    const nameThai = prompt("ชื่ออาจารย์ (ไทย):", "");
    const nameEng = prompt("ชื่ออาจารย์ (อังกฤษ):", "");
    const subject = prompt("ชื่อวิชา (คั่นด้วย ,):", "");
    const tel = prompt("เบอร์โทร:", "");
    const email = prompt("อีเมล:", "");
    if (!nameThai || !nameEng) return;
    const newId = mockData.length > 0 ? Math.max(...mockData.map((d) => d.id)) + 1 : 1;
    setMockData([
      ...mockData,
      {
        id: newId,
        role: "teacher",
        nameThai,
        nameEng,
        subjects: subject ? subject.split(",").map((s) => s.trim()) : [],
        tel,
        email,
      }
    ]);
    handleCloseMenu();
  };

  // เพิ่มนักศึกษา
  const handleAddStudent = () => {
    const nameThai = prompt("ชื่อนักศึกษา (ไทย):", "");
    const nameEng = prompt("ชื่อนักศึกษา (อังกฤษ):", "");
    const studentId = prompt("รหัสนักศึกษา:", "");
    const tel = prompt("เบอร์โทร:", "");
    const email = prompt("อีเมล:", "");
    if (!nameThai || !nameEng || !studentId) return;
    const newId = mockData.length > 0 ? Math.max(...mockData.map((d) => d.id)) + 1 : 1;
    setMockData([
      ...mockData,
      {
        id: newId,
        role: "student",
        nameThai,
        nameEng,
        studentId,
        tel,
        email,
      }
    ]);
    handleCloseMenu();
  };

  return (
    <Box
      sx={{
        borderRadius: 2,
        width: "100%",
        maxWidth: "700px",
        mx: "auto", // Center
        px: 2,      // Padding ขอบซ้าย-ขวา
      }}
    >

     
      {/* --- Search Bar + Add Button --- */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          mt: 2,
          flexWrap: "wrap",       // ถ้าจอแคบ ให้ขึ้นบรรทัดใหม่
          gap: 1.5,               // ระยะห่างระหว่าง Item
        }}
      >
        <TextField
          fullWidth
          label="Search by name"
          value={searchQuery}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
            setSearchQuery(event.target.value);
          }}
          sx={{
            flex: "1 1 240px",     // ยืดได้ บีบได้ แต่ไม่ต่ำกว่า 240px
            minWidth: 0,
            "& .MuiOutlinedInput-root": {
              borderRadius: "50px",
              height: 48,
              fontSize: "14px",
              "& input": { padding: "10px 14px" },
              "& fieldset": { borderColor: "#CBDCEB" },
              "&:hover fieldset": { borderColor: "#CBDCEB" },
              "&.Mui-focused fieldset": { borderColor: "#133E87" },
            },
            "& .MuiInputLabel-root": { fontSize: "13px" },
          }}
        />
        <IconButton
          sx={{
            bgcolor: "#133E87",
            "&:hover": { bgcolor: "#1852b1" },
            color: "#fff",
            borderRadius: "50%",
            width: 48,
            height: 48,
            flex: "0 0 auto",
          }}
          onClick={handleOpenMenu}
        >
          <UserAddIcon style={{ width: 28, height: 28 }} />
        </IconButton>
        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleCloseMenu}>
          <MenuItem onClick={handleAddTeacher}>เพิ่มอาจารย์</MenuItem>
          <MenuItem onClick={handleAddStudent}>เพิ่มนักศึกษา</MenuItem>
        </Menu>
      </Box>

      {/* --- Results --- */}
      <Box
        mt={2}
        px={0}
        sx={{
          maxHeight: "calc(100vh - 600px)",        // กำหนดความสูงสูงสุด (ปรับค่าตามต้องการ)
          overflowY: "auto",     // ให้มี scroll bar แนวตั้งถ้าเกิน
          pr: 1,                 // เพิ่ม padding ขวานิดหน่อย กัน scrollbar ทับเนื้อหา
        }}
      >
        {isSearching && searchQuery && (
          <Typography color="text.secondary" fontStyle="italic" fontFamily="Inter" fontWeight="300">
            Searching...
          </Typography>
        )}
        {!isSearching && searchQuery && results.length > 0 && (
          results.map((item) => (
            <Card key={item.id}
              sx={{
                mb: 2,
                bgcolor: "#D6E4EF",
                borderRadius: "28px",
                maxWidth: 600, //600
                minHeight: 150
              }}>
              <CardContent>
                <Box sx={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 2.5,
                  mb: 2,
                  position: "relative",
                  left: 10,
                }}>
                  <Box sx={{
                    justifyContent: "center",
                    alignItems: "center",
                    display: "flex",
                    width: 65,
                    height: 65,
                    bgcolor: "#fff",
                    borderRadius: 20,
                  }}>
                    <UserIcon color="#133E87" style={{ width: 40, height: 40 }} />
                  </Box>
                  <Box sx={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "start",
                    justifyContent: "center",
                  }}>
                    <Typography fontFamily="Noto Sans Thai" color="#133E87" fontSize="20px" fontWeight="500">
                      {item.nameThai}
                    </Typography>
                    <Typography color="#133E87" fontSize="20px" fontWeight="300">
                      {item.nameEng}
                    </Typography>

                    <Box sx={{
                      position: "absolute",
                      right: 20,
                      top: "50%",
                      transform: "translateY(-50%)",
                    }}>
                      <IconButton
                        sx={{
                          bgcolor: "#fff",
                          width: 35,
                          height: 35,
                          "&:hover": {
                            bgcolor: "#1852b1",
                            boxShadow: 3,
                            "& svg": { color: "#fff" },
                          },
                          "& svg": { color: "#1852b1" },
                          transition: "0.2s",
                        }}

                        onClick={() => {
                          navigate(`/app/userinfo/${item.id}`, { state: item });

                        }}
                      >
                        <ArrowIcon style={{ width: 25, height: 25 }} />
                      </IconButton>
                    </Box>
                  </Box>
                </Box>
                <Divider sx={{ borderColor: "#fff", borderBottomWidth: "1px" }} />
                <Box sx={{ display: "flex", px: 2, mt: 1 }}>
                  {item.role === "student" && (
                    <Box sx={{
                      flex: 2,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "flex-start",
                      justifyContent: "start",
                    }}>
                      <Typography fontWeight="500" fontSize="20px" color="#133E87" gutterBottom>
                        Student ID :
                      </Typography>
                      <Typography fontWeight="300" fontSize="18px" color="#133E87">
                        {item.studentId}
                      </Typography>
                    </Box>
                  )}
                  {/* Subjects เฉพาะอาจารย์ */}
                  {item.role === "teacher" && (
                    <Box sx={{
                      flex: 2,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "flex-start",
                      justifyContent: "start",
                    }}>
                      <Typography fontWeight="500" fontSize="20px" color="#133E87" gutterBottom>
                        Subjects :
                      </Typography>

                      {item.subjects?.map((subject, idx) => (
                        <Typography fontWeight="300" fontSize="18px" color="#133E87"
                        key={idx}>{subject}</Typography>
                      ))}

                    </Box>

                  )}
                  <Divider orientation="vertical" flexItem sx={{ mx: 2, borderColor: "#fff", borderBottomWidth: "2px" }} />
                  <Box sx={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                    justifyContent: "start",
                  }}>
                    <Typography fontWeight="500" fontSize="20px" color="#133E87" gutterBottom>
                      Contact{item.role === "student" ? "s" : ""} :
                    </Typography>
                    <Typography fontWeight="300" fontSize="18px" color="#133E87">
                      {item.tel ?? "-"}
                    </Typography>
                    <Typography fontWeight="300" fontSize="20px" color="#325288">
                      {item.email}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          ))
        )}
        {!isSearching && searchQuery && results.length === 0 && (
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
