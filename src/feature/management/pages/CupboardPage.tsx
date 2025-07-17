import React, { useState } from "react";
import { useNavigate, } from "react-router-dom";
import { Box, Grid, Typography, } from "@mui/material";
//import UserIcon from "../../../assets/icons/user.svg?react";
import SideProfilePanel from "../../home/components/SideProfilePanel";
//import RegistrationSearch from "../components/RegistrationSearch";
import ArrowBackIcon from "../../../assets/icons/arrow-back.svg?react";
import ManageItemCard from "../components/ManageItemCard";
import SearchBar from "../../../components/SearchBar";
import AddIcon from "../../../assets/icons/add.svg?react"
const items: {
  title: string;
  percentage?: number;
  status: "active" | "inactive";
}[] = [
    { title: "S01", percentage: 60, status: "active" },
    { title: "S02", percentage: 50, status: "active" },
    { title: "S03", percentage: 85, status: "active" },
    { title: "S04", percentage: undefined, status: "inactive" },
  ];

type CupboardPageProps = {
  setIsLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;
  profileImage: string | null;
  setProfileImage: React.Dispatch<React.SetStateAction<string | null>>;
};

export default function CupboardPage({
  setIsLoggedIn,
  profileImage,
  setProfileImage,
}: CupboardPageProps) {
  const navigate = useNavigate();

  // ✅ ย้ายมาที่นี่
  const [searchQuery, setSearchQuery] = useState("");

  const filteredItems = items.filter(item =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: { xs: "column", sm: "column", md: "none", lg: "row" },
        //gap: { xs: 3, md: 0 },
        // px: 2,
        // mt: 4,
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
            mb: 1,
          }}
        >
          <ArrowBackIcon
            onClick={() => navigate(-1)}
            style={{ width: 28, height: 28, cursor: "pointer" }}
          />
          <Typography
            fontSize="40px"
            fontWeight={900}
            fontStyle="italic"
            color="#133E87"
          >
            Management
          </Typography>
        </Box>

        <Box
          sx={{
            borderRadius: "35px",
            width: "100%",
            height: "55px",
            maxWidth: "668px",
            px: 2,
            bgcolor: "#E4EDF6",
            border: "2px solid #CBDCEB",
            //mb: 1,
            boxShadow: "0 2px 8px 0 rgba(18, 42, 66, 0.04)",
            alignContent: "center",
            color: "#133E87",
            fontSize: 16
          }}
        >
          Cupboard Management
        </Box>
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          onAddClick={() => {
            // เปิด modal หรือไปหน้าเพิ่ม item
            navigate("/app/add-item");
            
          }}
          addIcon={<AddIcon style={{ width: 50, height: 50 }} />}
        />
        <Box p={2}>
          <Typography color="#133E87" variant="h5" fontWeight={700} mb={2}>
            All Items
          </Typography>
          <Box sx={{
            maxWidth: 380,
            m: 2,
            borderRadius: "20px",
            border: "2px solid #CBDCEB",
          }}>
            <Typography variant="h6" color="primary" fontSize="25px" fontStyle="italic" align="center">
              C01
            </Typography>

            <Grid container spacing={2} mb={2} justifyContent="center">
              {filteredItems.map((item) => (
                <Grid item key={item.title}>
                  <ManageItemCard {...item} />
                </Grid>
              ))}
            </Grid>

          </Box>
        </Box>
      </Box>
      {/* Column ขวา */}
      <SideProfilePanel
        setIsLoggedIn={setIsLoggedIn}
        profileImage={profileImage}
        setProfileImage={setProfileImage}
      />
    </Box>
  );
}
