import { TextField, type TextFieldProps } from "@mui/material";
import { styled } from "@mui/material/styles";

const BaseTextField = styled(TextField)(() => ({
  backgroundColor: "#e3eaf5",
  borderRadius: 50,
  height: 60,
  border: "none", // ✅ ปิด border
  "& fieldset": {
    border: "none", // ✅ ปิด border ของ outline variant
  },
  "& .MuiInputBase-root": {
    height: "100%",
    padding: 0,
    borderRadius: 50,
    backgroundColor: "#e3eaf5",
  },
  "& .MuiInputBase-input": {
    padding: "0 20px",
    fontSize: 18,
  },
  "& .MuiInput-underline:before, & .MuiInput-underline:after": {
    display: "none", // ✅ ปิดเส้นใต้
  },
}));

export default function StyledTextField(props: TextFieldProps) {
  return (
    <BaseTextField
      {...props}
      variant="standard"
      InputProps={{
        ...props.InputProps,
        disableUnderline: true,
      }}
    />
  );
}
