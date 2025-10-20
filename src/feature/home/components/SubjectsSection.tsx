import { Box, Typography, IconButton, Collapse, Stack, Button } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useState } from "react";

export default function SubjectsSection({
  subjects,
  loadingSubjects,
  form,
  handleSubjectChange,
}: {
  subjects: string[];
  loadingSubjects: boolean;
  form: { selectedSubjects: string[] };
  handleSubjectChange: (s: string) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Box>
      {/* แถวหัวข้อ + ลูกศร */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 0.5,
        }}
      >
        <Typography fontWeight={600} color="primary">
          Subjects
        </Typography>

        <IconButton
          aria-label="toggle subjects"
          size="small"
          onClick={() => setOpen((v) => !v)}
          sx={{
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.2s ease",
          }}
        >
          <ExpandMoreIcon />
        </IconButton>
      </Box>

      {/* ส่วนพับ/ขยาย */}
      <Collapse in={open} timeout="auto" unmountOnExit>
        {loadingSubjects ? (
          <Typography m={1} color={"#656565ff"} fontSize={14}>
            Loading subjects...
          </Typography>
        ) : (
          <Stack direction="row" flexWrap="wrap" gap={1} m={1}>
            {subjects.map((subject) => (
              <Button
                key={subject}
                variant={
                  form.selectedSubjects.includes(subject) ? "contained" : "outlined"
                }
                onClick={() => handleSubjectChange(subject)}
                sx={{
                  textTransform: "none",
                  borderRadius: "25px",
                  fontSize: "14px",
                  fontWeight: 400,
                  padding: "6px 10px",
                }}
              >
                {subject}
              </Button>
            ))}
          </Stack>
        )}
      </Collapse>
    </Box>
  );
}
