// src/feature/profile/page/ProfilePage.tsx

import { Box } from "@mui/material";
import ProfilePanel from "../components/ProfilePanel";

type Props = {
  setIsLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;
  profileImage: string | null;
  setProfileImage: React.Dispatch<React.SetStateAction<string | null>>;
};

export default function ProfilePage({ setIsLoggedIn, profileImage, setProfileImage }: Props) {
  return (
    <Box
      sx={{
        width: "100%",
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        bgcolor: "#F1F6FC",
        px: 2,
        py: 4,
      }}
    >
      <ProfilePanel
        setIsLoggedIn={setIsLoggedIn}
        profileImage={profileImage}
        setProfileImage={setProfileImage}
      />
    </Box>
  );
}
