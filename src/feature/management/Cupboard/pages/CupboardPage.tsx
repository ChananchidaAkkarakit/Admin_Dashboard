import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Grid, Typography } from "@mui/material";
import SideProfilePanel from "../../../home/components/SideProfilePanel";
import ArrowBackIcon from "../../../../assets/icons/arrow-back.svg?react";
import ManageItemCard from "../../Cupboard/components/ManageItemCard";
import SearchBar from "../../../../components/SearchBar";
import AddIcon from "../../../../assets/icons/add.svg?react";
import { useSlotContext } from "../contexts/SlotContext"; // หรือ path ที่ถูกต้อง



// 🔁 ช่องเก็บของแต่ละช่อง (Compartment) ภายใต้ตู้ (Cabinet)


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

  const { slots } = useSlotContext();

  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const lowerQuery = searchQuery.toLowerCase();

  const filteredSlots = slots.filter((slot) =>
    slot.slotId.toLowerCase().includes(lowerQuery)
  );


  // const handleCardClick = (slotId: string) => {
  //   navigate(`cupboard/${slotId}`); // หรือ path ที่คุณกำหนด เช่น `/cupboard-info/${slotId}`
  // };
  const matchedCupboardIds = Array.from(
    new Set(
      slots
        .filter((slot) => slot.cupboardId.toLowerCase().includes(lowerQuery))
        .map((slot) => slot.cupboardId)
    )
  );

  const isSearchingCupboardOnly = filteredSlots.length === 0 && matchedCupboardIds.length > 0;

  const slotsToDisplay = isSearchingCupboardOnly
    ? slots.filter((slot) => matchedCupboardIds.includes(slot.cupboardId))
    : filteredSlots;

  // const currentCupboardId = isSearchingCupboardOnly
  //   ? matchedCupboardIds[0]
  //   : slotsToDisplay[0]?.cupboardId || "N/A";

  // 🔁 Group slots by cupboardId
  const groupedByCupboard = slotsToDisplay.reduce((acc, slot) => {
    const key = slot.cupboardId || "Unknown";
    if (!acc[key]) acc[key] = [];
    acc[key].push(slot);
    return acc;
  }, {} as Record<string, typeof slots>);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: { xs: "column", sm: "column", md: "none", lg: "row" },
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
        {/* Header */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}>
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
            width: "auto",
            height: "55px",
            //maxWidth: "668px",
            px: 2,
            bgcolor: "#E4EDF6",
            border: "2px solid #CBDCEB",
            boxShadow: "0 2px 8px 0 rgba(18, 42, 66, 0.04)",
            alignContent: "center",
            color: "#133E87",
            fontSize: 16,
          }}
        >
          Cupboard Management
        </Box>

        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          onAddClick={() => navigate("/app/add-item")}
          addIcon={<AddIcon style={{ width: 50, height: 50 }} />}
        />

        <Box pt={2}>
          {!searchQuery ? (
            <Typography color="#133E87" variant="h5" fontWeight={700} mb={1}>
              All Items
            </Typography>
          ) : (
            <Box mt={1} mb={2}>
              {slotsToDisplay.length > 0 ? (
                <Typography align="center" fontStyle="italic" color="text.secondary">
                  {isSearchingCupboardOnly
                    ? `Showing ${matchedCupboardIds.length} result${matchedCupboardIds.length > 1 ? "s" : ""} for "${searchQuery}"`
                    : `Showing ${slotsToDisplay.length} result${slotsToDisplay.length > 1 ? "s" : ""} for "${searchQuery}"`}
                </Typography>
              ) : (
                <Typography align="center" fontStyle="italic" color="error">
                  No results found for "{searchQuery}"
                </Typography>
              )}
            </Box>
          )}
          {/* ✅ เฉพาะตอนมีผลลัพธ์เท่านั้นจึงแสดงกล่อง C01 และการ์ด */}
          <Box
            sx={{
              maxHeight: "calc(100vh - 400px)", // ✅ ปรับตามความสูง header + searchBar
              overflowY: "auto",
              pr: 0,
              display: "flex",
              flexWrap: "wrap",
              gap: 1.5,
              justifyContent: "flex-start",
            }}
          >
            {Object.entries(groupedByCupboard).map(([cupboardId, group]) => (
              <Box
                key={cupboardId}
                sx={{
                  mt: 2,
                  width: 305,
                  minHeight: 396, // ✅ ปรับค่านี้ให้เท่ากับตู้ที่มี 4 ช่อง
                  borderRadius: "20px",
                  border: "2px solid #CBDCEB",
                  flex: "0 0 auto",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-start", // 👈 ให้จัด layout ภายในดูดี
                }}
              >

                <Typography
                  variant="h6"
                  color="primary"
                  fontSize="25px"
                  fontStyle="italic"
                  align="center"
                >
                  {cupboardId}
                </Typography>

                <Grid
                  container
                  spacing={2.5}
                  mb={2}
                  pl={group.length === 1 ? "10px" : "center"}
                  justifyContent={group.length === 1 ? "flex-start" : "center"}
                >
                  {group.map((slot) => (
                    <Grid item key={slot.slotId}>
                      <ManageItemCard
                        title={slot.slotId}
                        percentage={slot.capacity}
                        status={slot.connectionStatus}
                        onClick={() =>
                          navigate(`/app/management/cupboard/${slot.slotId}`, {
                            state: {
                              slotId: slot.slotId,
                              cupboardId: slot.cupboardId,
                              teacherId: slot.teacherId,
                              connectionStatus: slot.connectionStatus,
                            },
                          })
                        }
                      />
                    </Grid>
                  ))}
                </Grid>
              </Box>
            ))}

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
