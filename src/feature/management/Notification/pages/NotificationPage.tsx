import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  IconButton,
  Divider,
} from "@mui/material";
import SideProfilePanel from "../../../home/components/SideProfilePanel";
import ArrowBackIcon from "../../../../assets/icons/arrow-back.svg?react";
import SearchBar from "../../../../components/SearchBar";
import AddIcon from "../../../../assets/icons/add.svg?react";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import type { Notification } from "@shared/notifications";
import { fetchNotifications } from "../../../../api/notifications";

type NotificationPageProps = {
  setIsLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;
  profileImage: string | null;
  setProfileImage: React.Dispatch<React.SetStateAction<string | null>>;
};

export default function NotificationPage({
  setIsLoggedIn,
  profileImage,
  setProfileImage,
}: NotificationPageProps) {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [items, setItems] = useState<Notification[]>([]);

  useEffect(() => {
    const getData = async () => {
      try {
        const data = await fetchNotifications();
        setItems(data);
        console.log("Fetched items:", data);
        data.forEach((item) => {
          console.log("🔍 Each item:", item, "source =", item.source);
        });

      } catch (err) {
        console.error("Failed to fetch notifications:", err);
      }
    };
    getData();
  }, []);
  //console.log("Fetched items:", items);  // 🐛 ดู structure ที่ fetch มา
const [initialData, setInitialData] = useState<Notification | null>(null);

  const filteredItems = items.filter((item) =>
    item.messageName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.message.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const adminNotifications = filteredItems.filter((item) => item.source === "admin");
  const systemNotifications = filteredItems.filter((item) => item.source === "system");
  const uncategorized = filteredItems.filter(
    (item) => item.source !== "admin" && item.source !== "system"
  );

  const renderNotificationCard = (item: Notification) => (
    <Box
      key={item.messageId}
      sx={{
        border: "2px solid #E3ECF5",
        borderRadius: "15px",
        overflow: "hidden",
        width: "100%",
        maxWidth: 500,
        mb: 1.5,
      }}
    >
      <Box sx={{ bgcolor: "#E3ECF5", px: 2, py: 1 }}>
        <Typography fontWeight="bold" fontSize={14} color="primary">
          {item.messageName}
        </Typography>
      </Box>

      <Divider sx={{ my: 0 }} />

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          px: 2,
          py: 1.5,
          justifyContent: "space-between",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Box
            sx={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              bgcolor:
                item.type === "error"
                  ? "error.main"
                  : item.type === "warning"
                    ? "warning.main"
                    : item.type === "success"
                      ? "success.main"
                      : "info.main",
            }}
          />
          <Typography fontSize={14} color="text.primary">
            {item.message}
          </Typography>
        </Box>
        <IconButton size="small">
          <ChevronRightIcon fontSize="small" />
        </IconButton>
      </Box>
    </Box>
  );

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
          Notification Management
        </Box>

        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          onAddClick={() => navigate("/app/management/notification/add")}
          addIcon={<AddIcon style={{ width: 50, height: 50 }} />}
        />

        <Box pt={2}>
          <Typography color="#133E87" variant="h5" fontWeight={700} mb={2}>
            All Notifications
          </Typography>

          <Box display="flex" flexDirection="column" gap={3}>
            {/* Admin Added */}
            {adminNotifications.length > 0 && (
              <Box
                sx={{
                  borderRadius: "20px",
                  border: "2px solid #D6E4EF",
                  overflow: "hidden",
                  backgroundColor: "#fff",
                }}
              >
                <Box sx={{ px: 2, py: 1, backgroundColor: "#D6E4EF" }}>
                  <Typography fontWeight={600} fontSize={16} color="#133E87">
                    Admin Added
                  </Typography>
                </Box>
                <Box display="flex" flexDirection="column" px={2} py={1}>
                  {adminNotifications.map((item) => (
                    <Box
                      key={item.messageId}
                      display="flex"
                      alignItems="center"
                      justifyContent="space-between"
                      sx={{ py: 1 }}
                    >
                      <Box display="flex" alignItems="center" gap={1}>
                        <Box
                          sx={{
                            width: 10,
                            height: 10,
                            borderRadius: "100%",
                            bgcolor: item.status ? "success.main" : "error.main",

                          }}
                        />
                        <Typography fontSize={16}
                          sx={{
                            textDecoration: "underline",
                            textUnderlineOffset: "5px",
                            textDecorationColor: "#95A8C9",
                            textDecorationThickness: "1px"
                          }}
                        >
                          {item.messageName}
                        </Typography>
                      </Box>
                      <IconButton size="small" onClick={() => navigate(`/app/management/notification/edit/${item.messageId}`)}>
                        <ChevronRightIcon fontSize="small" />
                      </IconButton>

                    </Box>
                  ))}
                </Box>
              </Box>
            )}

            {/* System Provided */}
            {systemNotifications.length > 0 && (
              <Box
                sx={{
                  borderRadius: "20px",
                  border: "2px solid #D6E4EF",
                  overflow: "hidden",
                  backgroundColor: "#fff",
                }}
              >
                <Box sx={{ px: 2, py: 1, backgroundColor: "#D6E4EF" }}>
                  <Typography fontWeight={600} fontSize={16} color="#133E87">
                    System Provided
                  </Typography>
                </Box>
                <Box display="flex" flexDirection="column" px={2} py={1}>
                  {systemNotifications.map((item) => (
                    <Box
                      key={item.messageId}
                      display="flex"
                      alignItems="center"
                      justifyContent="space-between"
                      sx={{ py: 1 }}

                    >
                      <Box display="flex" alignItems="center" gap={1}>
                        <Box
                          sx={{
                            width: 10,
                            height: 10,
                            borderRadius: "100%",
                            bgcolor: item.status ? "success.main" : "error.main",

                          }}
                        />
                        <Typography fontSize={16}
                          sx={{
                            textDecoration: "underline",
                            textUnderlineOffset: "5px",
                            textDecorationColor: "#95A8C9",
                            textDecorationThickness: "1px"
                          }}
                        >
                          {item.messageName}
                        </Typography>
                      </Box>
                      <ChevronRightIcon fontSize="small" />
                    </Box>
                  ))}
                </Box>
              </Box>
            )}

            {/* No result */}
            {adminNotifications.length === 0 && systemNotifications.length === 0 && (
              <Typography align="center" color="error" fontStyle="italic">
                No results found for "{searchQuery}"
              </Typography>
            )}
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
