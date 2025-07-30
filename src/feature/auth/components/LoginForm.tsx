import { useState } from "react";
import { Button, Box, IconButton, InputAdornment } from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import StyledTextField from "../../../components/StyledTextField";
type LoginFormProps = {
  setIsLoggedIn: (v: boolean) => void;
};

export default function LoginForm({ setIsLoggedIn }: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false); // <== เพิ่มบรรทัดนี้
  const navigate = useNavigate();

  const handleLogin = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    localStorage.setItem("isLoggedIn", "true");
    setIsLoggedIn(true);
    navigate("/app/home", { replace: true });
  };


  return (
    <Box component="form" onSubmit={handleLogin}>
      <StyledTextField
        fullWidth
        placeholder="Username"
        sx={{ mb: 3 }}
      />
      <StyledTextField
        fullWidth
        placeholder="Password"
        type={showPassword ? "text" : "password"}
        sx={{ mb: 6 }}
        InputProps={{
          endAdornment: (
            <InputAdornment position="start">
              <IconButton
                onClick={() => setShowPassword((prev) => !prev)}
                edge="start"
              >
                {showPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          ),
        }}
      />
      <Button
        type="submit"
        fullWidth
        variant="contained"
        sx={{
          backgroundColor: "#0B2F7E",
          borderRadius: "999px",
          fontWeight: "700",
          textTransform: "none",
          fontSize: "clamp(24px, 4.5vw, 28px)",
          fontStyle: "italic",
          height: 60,
          lineHeight: 1.2,
          "&:hover": {
            backgroundColor: "#0A2A6E",
          },
        }}
      >
        Sign in
      </Button>
    </Box>
  );
}
