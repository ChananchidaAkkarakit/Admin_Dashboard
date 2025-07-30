// 📁 QrCode/pages/QrCodePage.tsx
import React, { useState } from "react";
import { Box, Typography, Grid } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useQRCodeContext } from "../contexts/QRCodeContext";
import QRmanagementItemCard from "../components/QRmanagementItemCard";
import SideProfilePanel from "../../../home/components/SideProfilePanel";
import ArrowBackIcon from "../../../../assets/icons/arrow-back.svg?react";
import SearchBar from "../../../../components/SearchBar";
import AddIcon from "../../../../assets/icons/add.svg?react";
//import type { EnrichedQRCodeSlot as QRCodeSlot } from "../../../../../../backend/src/mock/types";
// ที่บนสุดของ QrCodePage.tsx
type QrCodePageProps = {
  setIsLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;
  profileImage: string | null;
  setProfileImage: React.Dispatch<React.SetStateAction<string | null>>;
};

export default function QrCodePage({
  setIsLoggedIn,
  profileImage,
  setProfileImage,
}: QrCodePageProps) {
  const navigate = useNavigate();
  const { slots } = useQRCodeContext();

  const allCupboards = [...new Set(slots.map((slot) => slot.cupboardId))];

  const [searchQuery, setSearchQuery] = useState("");

  const lowerQuery = searchQuery.toLowerCase();

  const filteredQrCodes = slots.filter((item) => {
    const query = searchQuery.toLowerCase();
    return (
      item.slotId.toLowerCase().includes(query) ||
      item.cupboardId?.toLowerCase().includes(query) ||
      item.teacherName?.toLowerCase().includes(query)
    );
  });

  const matchedCupboardIds = Array.from(
    new Set(
      slots
        .filter((item) => item.cupboardId.toLowerCase().includes(lowerQuery))
        .map((item) => item.cupboardId)
    )
  );

  const isSearchingCupboardOnly =
    filteredQrCodes.length === 0 && matchedCupboardIds.length > 0;

  const slotsToDisplay = isSearchingCupboardOnly
    ? slots.filter((item) => matchedCupboardIds.includes(item.cupboardId))
    : filteredQrCodes;

  const groupedByCupboard = allCupboards.reduce((acc, cupboardId) => {
    acc[cupboardId] = slots.filter((qr) => qr.cupboardId === cupboardId);
    return acc;
  }, {} as Record<string, typeof slots[number][]>);

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
            px: 2,
            bgcolor: "#E4EDF6",
            border: "2px solid #CBDCEB",
            boxShadow: "0 2px 8px 0 rgba(18, 42, 66, 0.04)",
            alignContent: "center",
            color: "#133E87",
            fontSize: 16,
          }}
        >
          QRCode Management
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
                    ? `Showing ${matchedCupboardIds.length} result${
                        matchedCupboardIds.length > 1 ? "s" : ""
                      } for "${searchQuery}"`
                    : `Showing ${slotsToDisplay.length} result${
                        slotsToDisplay.length > 1 ? "s" : ""
                      } for "${searchQuery}"`}
                </Typography>
              ) : (
                <Typography align="center" fontStyle="italic" color="error">
                  No results found for "{searchQuery}"
                </Typography>
              )}
            </Box>
          )}
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              gap: 2,
              justifyContent: "flex-start",
            }}
          >
            {Object.entries(groupedByCupboard).map(([cupboardId, items]) => (
              <Box
                key={cupboardId}
                sx={{
                  width: 305,
                  mt: 3,
                  borderRadius: "20px",
                  border: "2px solid #CBDCEB",
                  justifyContent: "flex-start",
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

                {items.length === 0 ? (
                  <Typography align="center" color="text.secondary" p={2}>
                    ไม่มี QR code ในตู้
                  </Typography>
                ) : (
                  <Grid container spacing={2.5} mb={2} justifyContent="center">
                    {items.map((slot) => {
                      const shortName =
                        slot.teacherName.length > 5
                          ? slot.teacherName.slice(0, 5) + "..."
                          : slot.teacherName;

                      return (
                        <Grid item key={slot.slotId}>
                          <QRmanagementItemCard
                            title={`${slot.slotId} | ${shortName}`}
                            percentage={slot.capacity}
                            status={slot.connectionStatus}
                            qrID={slot.qrId}
                            teacherName={slot.teacherName}
                            onClick={() =>
                              navigate(`/app/management/qr/${slot.slotId}`, {
                                state: { ...slot },
                              })
                            }
                          />
                        </Grid>
                      );
                    })}
                  </Grid>
                )}
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