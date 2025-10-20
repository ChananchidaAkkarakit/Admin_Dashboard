// src/feature/monitoring/page/MonitoringAllItemsPage.tsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Grid, Typography, Divider } from "@mui/material";
import ArrowBackIcon from "../../../assets/icons/arrow-back.svg?react";
import ManageItemCard from "../../management/Cupboard/components/ManageItemCard";
import { useSlotContext } from "../../management/Cupboard/contexts/SlotContext";

// ด้านบนไฟล์ เพิ่ม helper คำนวณ % จาก mm เผื่อ capacityPercent เป็น null
const MAX_MM = 205;
const mmToPercent = (mm?: number | null) =>
    mm == null || !Number.isFinite(mm) ? 0
        : Math.max(0, Math.min(100, Math.round((mm / MAX_MM) * 100)));

// 👇 ช่วยคำนวณ % จาก mm (0–250 → 0–100)
// const MAX_MM = 250;
// const mmToPercent = (mm?: number | null) =>
//   mm == null || !Number.isFinite(mm) ? 0
//   : Math.max(0, Math.min(100, Math.round((mm / MAX_MM) * 100)));

export default function MonitoringAllItemsPage() {
    const navigate = useNavigate();
    const { slots, loading, refresh } = useSlotContext();

    // โหลด/รีเฟรชข้อมูล
    useEffect(() => { refresh(); }, [refresh]);
    useEffect(() => {
        const onFocus = () => refresh();
        window.addEventListener("focus", onFocus);
        return () => window.removeEventListener("focus", onFocus);
    }, [refresh]);

    // เรียงก่อนแล้วค่อยกรุ๊ป
    const sorted = [...slots].sort((a, b) => {
        const byCup = a.cupboardId.localeCompare(b.cupboardId, undefined, { numeric: true });
        if (byCup !== 0) return byCup;
        return a.slotId.localeCompare(b.slotId, undefined, { numeric: true });
    });

    const groupedByCupboard = sorted.reduce<Record<string, typeof slots>>((acc, slot) => {
        const key = slot.cupboardId || "Unknown";
        (acc[key] ||= []).push(slot);
        return acc;
    }, {});

    return (
        <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "column", md: "none", lg: "row" }, width: "100%" }}>
            <Box sx={{ flex: 1, width: "100%", pr: { xs: 0, md: 0, lg: 3 } }}>
                {/* Header */}
                <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}>
                    <ArrowBackIcon onClick={() => navigate(-1)} style={{ width: 28, height: 28, cursor: "pointer" }} />
                    <Typography fontSize="40px" fontWeight={900} fontStyle="italic" color="#133E87">
                        Monitoring
                    </Typography>
                </Box>
                <Divider sx={{ mt: 1, mb: 3, borderBottomWidth: 2, borderColor: "#CBDCEB" }} />

                <Typography color="#133E87" variant="h5" fontWeight={700} mb={2}>
                    All Items
                </Typography>

                <Box pt={2}>
                    {loading ? (
                        <Typography color="text.secondary" fontStyle="italic">Loading...</Typography>
                    ) : null}

                    <Box
                        sx={{
                            maxHeight: "calc(100vh - 400px)",
                            overflowY: "auto",
                            pr: 0,
                            display: "flex",
                            flexWrap: "wrap",
                            gap: 1.5,
                            justifyContent: "flex-start",
                        }}
                    >
                        {Object.entries(groupedByCupboard)
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
                                    }}
                                >
                                    <Typography variant="h6" color="primary" fontSize="25px" fontStyle="italic" align="center">
                                        {cupboardId}
                                    </Typography>

                                    <Grid container spacing={2.5} mb={2}
                                        pl={group.length === 1 ? "10px" : "center"}
                                        justifyContent={group.length === 1 ? "flex-start" : "center"}>
                                        {[...group]
                                            .sort((a, b) => a.slotId.localeCompare(b.slotId, undefined, { numeric: true }))
                                            .map((slot) => {
                                                // ✅ ใช้วิธีเดียวกับ SlotDashboard:
                                                //    1) ถ้ามี capacity_percent ใช้เลย
                                                //    2) ถ้าไม่มี ให้คำนวนจาก capacity_mm
                                                //    3) ถ้ายังไม่มี (สคีมาเดิม) ใช้ capacity (raw 0–250) คำนวน

                                                return (
                                                    <Grid item key={slot.slotId}>
                                                        
                                                        <ManageItemCard
                                                            title={slot.slotId}
                                                            percentage={
                                                                slot.capacityPercent ?? mmToPercent(slot.capacityMm) ?? 0
                                                            }
                                                            status={
                                                                slot.connectionStatus === 'online'
                                                                    ? 'active'
                                                                    : 'inactive' // unknown → inactive ชั่วคราว (ถ้ามีสถานะที่ 3 ในการ์ดค่อยเปลี่ยน)
                                                            }
                                                            onClick={() =>
                                                                navigate(`/app/monitoring/slot/${slot.slotId}`, {
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
                                                );
                                            })}
                                    </Grid>
                                </Box>
                            ))}
                    </Box>
                </Box>
            </Box>
        </Box>
    );
}
