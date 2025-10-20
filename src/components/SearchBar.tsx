import { useState, useEffect, useRef } from "react";
import {
  TextField,
  IconButton,
  Menu,
  MenuItem,
  Box,
  InputAdornment,
  Tooltip,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import UserAddIcon from "../assets/icons/user-add.svg?react";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onAddTeacher?: () => void;
  onAddStudent?: () => void;
  onAddClick?: () => void;
  addIcon?: React.ReactNode;
  placeholder?: string;
}

export default function SearchBar({
  value,
  onChange,
  onAddTeacher,
  onAddStudent,
  onAddClick,
  addIcon,
  placeholder = "Search by name…",
}: SearchBarProps) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleCloseMenu = () => setAnchorEl(null);

  const showMenu = !!onAddTeacher && !!onAddStudent;
  const showSimpleAdd = !showMenu && !!onAddClick;

  // Ctrl/⌘ + K โฟกัสช่องค้นหา
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const isMac = /Mac|iPod|iPhone|iPad/.test(navigator.platform);
      if ((isMac ? e.metaKey : e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        mt: 2,
        flexWrap: "wrap",
        gap: 1.5,
      }}
    >
      <TextField
        fullWidth
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        inputRef={inputRef}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon sx={{ fontSize: 20, color: "#64748B" }} />
            </InputAdornment>
          ),
          endAdornment: (
            <InputAdornment position="end">
              {value && (
                <Tooltip title="Clear">
                  <IconButton
                    size="small"
                    onClick={() => onChange("")}
                    edge="end"
                    aria-label="clear"
                    sx={{ mr: showMenu || showSimpleAdd ? 0.5 : 0 }}
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
            </InputAdornment>
          ),
        }}
        sx={{
          flex: "1 1 280px",
          minWidth: 0,
          "& .MuiOutlinedInput-root": {
            borderRadius: "999px",
            height: 48,
            fontSize: "14px",
            bgcolor: "#FFFFFF",
            boxShadow: "0 0 0 0 rgba(19,62,135,0)", // base
            transition: "box-shadow .2s ease, border-color .2s ease",
            "& input": { padding: "10px 14px" },
            "& fieldset": { borderColor: "#CBDCEB" },
            "&:hover fieldset": { borderColor: "#B9CCDF" },
            "&.Mui-focused fieldset": { borderColor: "#133E87" },
            "&.Mui-focused": {
              boxShadow: "0 0 0 3px rgba(19,62,135,0.12)",
            },
          },
          "& .MuiInputAdornment-root": {
            mx: 1,
          },
        }}
      />

      {/* ปุ่มเพิ่ม */}
      {showMenu && (
        <>
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

          <Menu
            MenuListProps={{
              disablePadding: true, // ✅ ปิด padding 8px
            }}
            anchorEl={anchorEl}
            open={Boolean(anchorEl)} onClose={handleCloseMenu}
            anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
            transformOrigin={{ vertical: "top", horizontal: "center" }}
            PaperProps={{
              sx: {
                minWidth: 100, boxShadow: "0 2px 8px rgba(0,0,0,0.20)", borderRadius: 3, overflow: "hidden",
              }
            }}
          >
            <MenuItem sx={{
              py: 1,
              color: "#7A7A7A", // สีฟ้าเzข้ม
              "&:hover": {
                bgcolor: "#ECF6FF",
                fontWeight: "500",
              },
            }}
              onClick={() => { onAddTeacher(); handleCloseMenu(); }}>Add Teacher</MenuItem>
            <MenuItem sx={{
              py: 1,
              color: "#7A7A7A", // สีฟ้าเzข้ม
              "&:hover": {
                bgcolor: "#ECF6FF",
                fontWeight: "500",
              },
            }}
              onClick={() => { onAddStudent(); handleCloseMenu(); }}>Add Student</MenuItem>
          </Menu>
        </>
      )}

      {showSimpleAdd && (
        <IconButton
          sx={{
            bgcolor: "#133E87",
            "&:hover": { bgcolor: "#1852b1" },
            color: "#fff",
            borderRadius: "50%",
            width: 48,
            height: 48,
            flex: "0 0 auto",
            display: "flex"
          }}
          onClick={onAddClick}>
          {addIcon || <UserAddIcon style={{ width: 28, height: 28 }} />}
        </IconButton>
      )}
    </Box>
  );
}
