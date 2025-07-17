import { useState } from "react";
import {
  TextField,
  IconButton,
  Menu,
  MenuItem,
  Box,
} from "@mui/material";
import UserAddIcon from "../assets/icons/user-add.svg?react";
//import AddIcon from "../assets/icons/add.svg?react";
interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onAddTeacher?: () => void;
  onAddStudent?: () => void;
  onAddClick?: () => void;
  addIcon?: React.ReactNode; // เพิ่มตรงนี้
}


export default function SearchBar({
  value,
  onChange,
  onAddTeacher,
  onAddStudent,
  onAddClick,
  addIcon, // 👈 เพิ่มตรงนี้
}: SearchBarProps) {

  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => setAnchorEl(null);

  const showMenu = onAddTeacher && onAddStudent;
  const showSimpleAdd = !showMenu && onAddClick;

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
        label="Search by name"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        sx={{
          flex: "1 1 240px",
          minWidth: 0,
          "& .MuiOutlinedInput-root": {
            borderRadius: "50px",
            height: 48,
            fontSize: "14px",
            "& input": { padding: "10px 14px" },
            "& fieldset": { borderColor: "#CBDCEB" },
            "&:hover fieldset": { borderColor: "#CBDCEB" },
            "&.Mui-focused fieldset": { borderColor: "#133E87" },
          },
          "& .MuiInputLabel-root": { fontSize: "13px" },
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

          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleCloseMenu}>
            <MenuItem onClick={() => { onAddTeacher(); handleCloseMenu(); }}>Add Teacher</MenuItem>
            <MenuItem onClick={() => { onAddStudent(); handleCloseMenu(); }}>Add Student</MenuItem>
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
