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
  const [searchQuery, setSearchQuery] = useState("");
  const lowerQuery = searchQuery.toLowerCase();

  // 1) filter หลัก
  const filteredQrCodes = slots.filter((item) => {
    const q = lowerQuery;
    return (
      item.slotId.toLowerCase().includes(q) ||
      item.cupboardId?.toLowerCase().includes(q) ||
      (item.teacherName ?? "").toLowerCase().includes(q)
    );
  });

  // 2) กรณีค้นหาเฉพาะ cupboard id
  const matchedCupboardIds = Array.from(
    new Set(
      slots
        .filter((item) => item.cupboardId?.toLowerCase().includes(lowerQuery))
        .map((item) => item.cupboardId)
    )
  );
  const isSearchingCupboardOnly =
    filteredQrCodes.length === 0 && matchedCupboardIds.length > 0;

  // 3) ชุดข้อมูลที่ “จะนำไปแสดงจริง”
  const slotsToDisplay = isSearchingCupboardOnly
    ? slots.filter((item) => matchedCupboardIds.includes(item.cupboardId))
    : filteredQrCodes.length > 0 || searchQuery
      ? filteredQrCodes
      : slots;

  // 4) group จาก “slotsToDisplay” (เดิม group จาก slots ทำให้ผลค้นหาไม่ถูกใช้)
  const groupedByCupboard = slotsToDisplay.reduce((acc, qr) => {
    const cid = qr.cupboardId || "UNKNOWN";
    if (!acc[cid]) acc[cid] = [];
    acc[cid].push(qr);
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
          // แก้ path ให้ตรงกับ Router ของคุณ เช่น /app/management/qr/add
          onAddClick={() => navigate("/app/management/qr/add")}
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

          <Box sx={{
            maxHeight: "calc(100vh - 400px)",
            overflowY: "auto",
            pr: 0,
            display: "flex",
            flexWrap: "wrap",
            gap: 1.5,
            justifyContent: "flex-start"
          }}>
            {Object.entries(groupedByCupboard).map(([cupboardId, items]) => (
              <Box key={cupboardId} sx={{ width: 305, mt: 3, borderRadius: "20px", border: "2px solid #CBDCEB", justifyContent: "flex-start" }}>
                <Typography variant="h6" color="primary" fontSize="25px" fontStyle="italic" align="center">
                  {cupboardId}
                </Typography>

                {items.length === 0 ? (
                  <Typography align="center" color="text.secondary" p={2}>
                    ไม่มี QR code ในตู้
                  </Typography>
                ) : (
                  <Grid container spacing={2.5} mb={2} justifyContent="center">
                    {items.map((slot) => {
                      const teacher = slot.teacherName ?? "-";
                      const shortName = teacher.length > 5 ? teacher.slice(0, 5) + "..." : teacher;

                      return (
                        <Grid item key={slot.slotId}>
                          <QRmanagementItemCard
                            title={`${slot.slotId} | ${shortName}`}
                            status={slot.connectionStatus === 'active' ? 'active' : 'inactive'}
                            qrID={slot.qrId ?? ''}
                            teacherName={teacher}
                            onClick={() =>
                              navigate(`/app/management/qr/${slot.slotId}`, { state: { ...slot } })
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

      {/* ขวา */}
      <SideProfilePanel
        setIsLoggedIn={setIsLoggedIn}
        profileImage={profileImage}
        setProfileImage={setProfileImage}
      />
    </Box>
  );
}