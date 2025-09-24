import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Grid, Typography } from "@mui/material";
import SideProfilePanel from "../../../home/components/SideProfilePanel";
import ArrowBackIcon from "../../../../assets/icons/arrow-back.svg?react";
import ManageItemCard from "../../Cupboard/components/ManageItemCard";
import SearchBar from "../../../../components/SearchBar";
import AddIcon from "../../../../assets/icons/add.svg?react";
import { useSlotContext } from "../contexts/SlotContext";

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
  const { slots, loading, refresh } = useSlotContext();

  useEffect(() => { refresh(); }, [refresh]);
  useEffect(() => {
    const onFocus = () => { refresh(); };
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [refresh]);

  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const lowerQuery = searchQuery.toLowerCase();

  // filter ตามคำค้น
  const filteredSlots = slots.filter(s =>
    s.slotId.toLowerCase().includes(lowerQuery)
  );
  const matchedCupboardIds = Array.from(
    new Set(
      slots
        .filter(s => s.cupboardId.toLowerCase().includes(lowerQuery))
        .map(s => s.cupboardId)
    )
  );
  const isSearchingCupboardOnly =
    filteredSlots.length === 0 && matchedCupboardIds.length > 0;

  const slotsToDisplay = isSearchingCupboardOnly
    ? slots.filter(s => matchedCupboardIds.includes(s.cupboardId))
    : filteredSlots;

  // ✅ เรียงแบบตัวเลข: ก่อน group
  const sorted = [...slotsToDisplay].sort((a, b) => {
    const byCup = a.cupboardId.localeCompare(b.cupboardId, undefined, { numeric: true });
    if (byCup !== 0) return byCup;
    return a.slotId.localeCompare(b.slotId, undefined, { numeric: true });
  });

  // group หลังจากเรียงแล้ว
  const groupedByCupboard = sorted.reduce<Record<string, typeof slots>>((acc, slot) => {
    const key = slot.cupboardId || "Unknown";
    (acc[key] ||= []).push(slot);
    return acc;
  }, {});

  return (
    <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "column", md: "none", lg: "row" }, width: "100%" }}>
      <Box sx={{ flex: 1, width: "100%", pr: { xs: 0, md: 0, lg: 3 } }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}>
          <ArrowBackIcon onClick={() => navigate(-1)} style={{ width: 28, height: 28, cursor: "pointer" }} />
          <Typography fontSize="40px" fontWeight={900} fontStyle="italic" color="#133E87">Management</Typography>
        </Box>

        <Box sx={{
          borderRadius: "35px",
          width: "auto",
          height: "55px",
          px: 2,
          bgcolor: "#E4EDF6",
          border: "2px solid #CBDCEB",
          boxShadow: "0 2px 8px 0 rgba(18,42,66,.04)",
          alignContent: "center",
          color: "#133E87",
          fontSize: 16
        }}>
          Cupboard Management
        </Box>

        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          onAddClick={() => navigate("/app/management/cupboard/add")}
          addIcon={<AddIcon style={{ width: 50, height: 50 }} />}
        />

        <Box pt={2}>
          {loading ? (
            <Typography color="text.secondary" fontStyle="italic">Loading...</Typography>
          ) : !searchQuery ? (
            <Typography color="#133E87" variant="h5" fontWeight={700} mb={1}>All Items</Typography>
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

          <Box sx={{
            maxHeight: "calc(100vh - 400px)",
            overflowY: "auto",
            pr: 0,
            display: "flex",
            flexWrap: "wrap",
            gap: 1.5,
            justifyContent: "flex-start"
          }}>
            {Object.entries(groupedByCupboard)
              // ✅ เรียงตู้
              .sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true }))
              .map(([cupboardId, group]) => (
              <Box
                key={cupboardId}
                sx={{
                  mt: 2,
                  width: 305,
                  minHeight: 396,
                  borderRadius: "20px",
                  border: "2px solid #CBDCEB",
                  flex: "0 0 auto",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-start",
                }}
              >
                <Typography variant="h6" color="primary" fontSize="25px" fontStyle="italic" align="center">
                  {cupboardId}
                </Typography>

                <Grid
                  container
                  spacing={2.5}
                  mb={2}
                  pl={group.length === 1 ? "10px" : "center"}
                  justifyContent={group.length === 1 ? "flex-start" : "center"}
                >
                  {[...group]
                    // ✅ เรียงช่องในแต่ละตู้
                    .sort((a, b) => a.slotId.localeCompare(b.slotId, undefined, { numeric: true }))
                    .map(slot => (
                      <Grid item key={slot.slotId}>
                        <ManageItemCard
                          title={slot.slotId}
                          percentage={slot.capacity ?? 0}
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

      <SideProfilePanel
        setIsLoggedIn={setIsLoggedIn}
        profileImage={profileImage}
        setProfileImage={setProfileImage}
      />
    </Box>
  );
}
