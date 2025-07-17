import { Box, Divider } from "@mui/material";
import ProfilePanel from "../../profile/components/ProfilePanel"; // 👈 import จากที่แยกไว้

type SideProfilePanelProps = {
  setIsLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;
  profileImage: string | null;
  setProfileImage: React.Dispatch<React.SetStateAction<string | null>>;
};

export default function SideProfilePanel({
  setIsLoggedIn,
  profileImage,
  setProfileImage,
}: SideProfilePanelProps) {
  return (
    <Box display="flex" alignItems="stretch">
      <Divider
        orientation="vertical"
        flexItem
        sx={{ mx: 3, display: { xs: "none", lg: "inline-flex" }, borderColor: "#CBDCEB" }}
      />
      <Box sx={{ width: 280, pl: 3 }}>
        <ProfilePanel
          setIsLoggedIn={setIsLoggedIn}
          profileImage={profileImage}
          setProfileImage={setProfileImage}
        />
      </Box>
    </Box>
  );
}
