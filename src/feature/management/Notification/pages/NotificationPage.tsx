import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  IconButton,
  CircularProgress,
  Chip,
  Tooltip,
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
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    const getData = async () => {
      setLoading(true);
      setErr(null);
      try {
        const data = await fetchNotifications();
        setItems(data ?? []);
      } catch (e: any) {
        setErr(e?.message || "Failed to fetch notifications");
        console.error("Failed to fetch notifications:", e);
      } finally {
        setLoading(false);
      }
    };
    getData();
  }, []);

  const filteredItems = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return items;
    return items.filter(
      (item) =>
        item.messageName.toLowerCase().includes(q) ||
        item.message.toLowerCase().includes(q)
    );
  }, [items, searchQuery]);

  const adminNotifications = filteredItems.filter((item) => item.source === "admin");
  const systemNotifications = filteredItems.filter((item) => item.source === "system");

  const StatusDot: React.FC<{ on: boolean }> = ({ on }) => (
    <Box
      sx={{
        width: 10,
        height: 10,
        borderRadius: "100%",
        bgcolor: on ? "success.main" : "error.main",
        flex: "0 0 10px",
      }}
    />
  );

  const RowItem: React.FC<{ item: Notification }> = ({ item }) => {
    const isEditable = item.source === "admin";
    return (
      <Box
        key={item.messageId}
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        sx={{ py: 1, opacity: 1 }}
      >
        <Box display="flex" alignItems="center" gap={1} sx={{ minWidth: 0 }}>
          <StatusDot on={!!item.status} />
          <Typography
            fontSize={16}
            sx={{
              textDecoration: "underline",
              textUnderlineOffset: "5px",
              textDecorationColor: "#95A8C9",
              textDecorationThickness: "1px",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              maxWidth: { xs: "60%", sm: "70%", md: "75%" },
            }}
            title={item.messageName}
            color={isEditable ? "inherit" : "text.secondary"}
          >
            {item.messageName}
          </Typography>

          <Chip
            label={isEditable ? "Admin" : "System • Read-only"}
            size="small"
            variant="outlined"
            color={isEditable ? "primary" : "default"}
            sx={{ ml: 1 }}
          />
        </Box>

        <Tooltip title={isEditable ? "Edit" : "View (read-only)"}>
          <IconButton
            size="small"
            onClick={() =>
              navigate(`/app/management/notification/edit/${item.messageId}`)
            }
          >
            <ChevronRightIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
    );
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: { xs: "column", sm: "column", md: "none", lg: "row" },
        width: "100%",
      }}
    >
      <Box sx={{ flex: 1, width: "100%", pr: { xs: 0, md: 0, lg: 3 } }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}>
          <ArrowBackIcon
            onClick={() => navigate(-1)}
            style={{ width: 28, height: 28, cursor: "pointer" }}
          />
          <Typography fontSize="40px" fontWeight={900} fontStyle="italic" color="#133E87">
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

          {loading && (
            <Box display="flex" alignItems="center" justifyContent="center" py={4} gap={1}>
              <CircularProgress size={22} />
              <Typography>Loading…</Typography>
            </Box>
          )}
          {err && !loading && (
            <Typography align="center" color="error" fontStyle="italic" py={2}>
              {err}
            </Typography>
          )}

          {!loading && !err && (
            <Box display="flex" flexDirection="column" gap={3}>
              {adminNotifications.length > 0 && (
                <Box
                  sx={{
                    borderRadius: "20px",
                    border: "2px solid #D6E4EF",
                    overflow: "hidden",
                    backgroundColor: "#fff",
                  }}
                >
                  <Box
                    sx={{
                      px: 2,
                      py: 1,
                      backgroundColor: "#D6E4EF",
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                    }}
                  >
                    <Typography fontWeight={600} fontSize={16} color="#133E87">
                      Admin Added
                    </Typography>
                    <Chip label={adminNotifications.length} size="small" />
                  </Box>
                  <Box display="flex" flexDirection="column" px={2} py={1}>
                    {adminNotifications.map((item) => (
                      <RowItem key={item.messageId} item={item} />
                    ))}
                  </Box>
                </Box>
              )}

              {systemNotifications.length > 0 && (
                <Box
                  sx={{
                    borderRadius: "20px",
                    border: "2px solid #D6E4EF",
                    overflow: "hidden",
                    backgroundColor: "#fff",
                  }}
                >
                  <Box
                    sx={{
                      px: 2,
                      py: 1,
                      backgroundColor: "#D6E4EF",
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                    }}
                  >
                    <Typography fontWeight={600} fontSize={16} color="#133E87">
                      System Provided
                    </Typography>
                    <Chip label={systemNotifications.length} size="small" />
                  </Box>
                  <Box display="flex" flexDirection="column" px={2} py={1}>
                    {systemNotifications.map((item) => (
                      <RowItem key={item.messageId} item={item} />
                    ))}
                  </Box>
                </Box>
              )}

              {adminNotifications.length === 0 && systemNotifications.length === 0 && (
                <Typography align="center" color="error" fontStyle="italic">
                  {items.length === 0 && !searchQuery
                    ? "No notifications yet."
                    : `No results found for "${searchQuery}"`}
                </Typography>
              )}
            </Box>
          )}
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
