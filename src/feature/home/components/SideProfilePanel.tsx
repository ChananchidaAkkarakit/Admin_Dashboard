import { Box, Divider } from "@mui/material";
import ProfilePanel from "./ProfilePanel";

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
        <>
            <Divider
                orientation="vertical"
                flexItem
                sx={{
                    mx: 3,
                    display: { xs: "none", md: "none", lg: "inline-flex" },
                    borderColor: "#CBDCEB",
                    borderRightWidth: "1.5px",
                }}
            />

            <Box
                sx={{
                    width: { xs: "100%", md: 280 },
                    mt: { xs: 3, md: 0 },
                    pl: { xs: 0, md: 0, lg: 3 },
                }}
            >
                <ProfilePanel
                    setIsLoggedIn={setIsLoggedIn}
                    profileImage={profileImage}
                    setProfileImage={setProfileImage}
                />
            </Box>
        </>
    );
}
