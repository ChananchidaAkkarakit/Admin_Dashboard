// src/feature/monitoring/page/MonitoringAllItemsPage.tsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Grid, Typography, Divider } from "@mui/material";
import ArrowBackIcon from "../../../assets/icons/arrow-back.svg?react";
import ManageItemCard from "../../management/Cupboard/components/ManageItemCard";
import { useSlotContext } from "../../management/Cupboard/contexts/SlotContext";

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
        <Box
            sx={{
                display: "flex",
                flexDirection: { xs: "column", sm: "column", md: "none", lg: "row" },
                width: "100%",
            }}
        >
            {/* คอลัมน์ซ้าย (คอนเทนต์หลัก) */}
            <Box sx={{ flex: 1, width: "100%", pr: { xs: 0, md: 0, lg: 3 } }}>
                {/* Header */}
                <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}>
                    <ArrowBackIcon
                        onClick={() => navigate(-1)}
                        style={{ width: 28, height: 28, cursor: "pointer" }}
                    />
                    <Typography fontSize="40px" fontWeight={900} fontStyle="italic" color="#133E87">
                        Monitoring
                    </Typography>
                </Box>
                <Divider
                    sx={{
                        mt: 1,
                        mb: 3,
                        
                        // กำหนดความยาวเส้น
                        borderBottomWidth: 2,  // ความหนาเส้น
                        borderColor: "#CBDCEB" // สีเส้น
                    }}
                />

                <Typography color="#133E87" variant="h5" fontWeight={700} mb={2}>
                    All Items
                </Typography>

                {/* ไม่มี Search / ไม่มีปุ่ม Add ตามที่ขอ */}
                <Box pt={2}>
                    {loading ? (
                        <Typography color="text.secondary" fontStyle="italic">
                            Loading...
                        </Typography>
                    ) : (
                        <></>
                    )}

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
                                        {[...group]
                                            .sort((a, b) =>
                                                a.slotId.localeCompare(b.slotId, undefined, { numeric: true })
                                            )
                                            .map((slot) => (
                                                <Grid item key={slot.slotId}>
                                                    <ManageItemCard
                                                        title={slot.slotId}
                                                        percentage={slot.capacity ?? 0}
                                                        status={slot.connectionStatus}
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
                                            ))}
                                    </Grid>
                                </Box>
                            ))}
                    </Box>
                </Box>
            </Box>
        </Box>
    );
}
