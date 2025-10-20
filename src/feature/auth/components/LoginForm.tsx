// LoginForm.tsx
import { useState } from "react";
import { Button, Box, IconButton, InputAdornment } from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import StyledTextField from "../../../components/StyledTextField";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../../supabaseClient";

type LoginFormProps = { setIsLoggedIn: (v: boolean) => void };

export default function LoginForm({ setIsLoggedIn }: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");        // ✅ เพิ่ม
  const [password, setPassword] = useState("");  // ✅ เพิ่ม
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErr(null);
    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);

    if (error) {
      setErr(error.message);
      return;
    }
    // สำเร็จ: มี session + user.id แล้ว ⇒ RLS ใช้ได้
    localStorage.setItem("isLoggedIn", "true"); // ถ้าหน่วยอื่นยังพึ่งค่านี้อยู่
    setIsLoggedIn(true);
    navigate("/app/home", { replace: true });
  };

  return (
    <Box component="form" onSubmit={handleLogin}>
      <StyledTextField
        fullWidth placeholder="Email"
        value={email} onChange={(e) => setEmail(e.target.value)}
        sx={{ mb: 3 }}
      />
      <StyledTextField
        fullWidth placeholder="Password"
        type={showPassword ? "text" : "password"}
        value={password} onChange={(e) => setPassword(e.target.value)}
        sx={{ mb: 1.5 }}
        InputProps={{
          endAdornment: (
            <InputAdornment position="start">
              <IconButton onClick={() => setShowPassword(p => !p)} edge="start">
                
              </IconButton>
            </InputAdornment>
          ),
        }}
      />
      {err && <div style={{ color: "#d32f2f", marginBottom: 12 }}>{err}</div>}
      <Button
        type="submit" fullWidth disabled={loading}
        variant="contained"
        sx={{
          backgroundColor: "#0B2F7E", borderRadius: "999px",
          fontWeight: 700, textTransform: "none",
          fontSize: "clamp(24px,4.5vw,28px)", fontStyle: "italic",
          height: 60, "&:hover": { backgroundColor: "#0A2A6E" },
        }}
      >
        {loading ? "Signing in..." : "Sign in"}
      </Button>
    </Box>
  );
}
