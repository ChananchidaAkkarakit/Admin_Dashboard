import React, { useState } from "react";
import { Box, Divider } from "@mui/material";
import WelcomeHeader from "../components/WelcomeHeader";
import RegistrationCard from "../components/RegistrationCard";
import ManagementCard from "../components/ManagementCard";
//import ProfilePanel from "../components/ProfilePanel";
import SideProfilePanel from "../components/SideProfilePanel";
import RegistrationSearch from "../components/RegistrationSearch";
import ManagementList from "../../management/components/ManagementList";

type HomePageProps = {
  setIsLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;
  profileImage: string | null;
  setProfileImage: React.Dispatch<React.SetStateAction<string | null>>;
};

export default function HomePage({
  setIsLoggedIn,
  profileImage,
  setProfileImage,
}: HomePageProps) {
  const [activeTab, setActiveTab] = useState<"registration" | "management">("registration");

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: { xs: "column", sm: "column", md: "none", lg: "row" },
        gap: { xs: 3, md: 0 },
      }}
    >
      {/* Column ซ้าย */}
      <Box
        sx={{
          flex: 1,
          width: "100%",
          pr: { xs: 0, md: 0, lg: 3 },
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            width: "100%",
          }}
        >
          <WelcomeHeader />

          <Box display="flex" p={0} gap={{
            xs: 1.5,   // จอเล็ก: gap น้อย
            sm: 2,   // จอกลาง: gap ปานกลาง
            md: 3,   // จอใหญ่: gap มาก
          }} justifyContent="center" flexWrap="wrap">
            <Box
              sx={{ cursor: "pointer" }}
              onClick={() => setActiveTab("registration")}
            >
              <RegistrationCard active={activeTab === "registration"} />
            </Box>
            <Box
              sx={{ cursor: "pointer" }}
              onClick={() => setActiveTab("management")}
            >
              <ManagementCard active={activeTab === "management"} />
            </Box>
          </Box>
 <Divider sx={{ pb: 0, my: 2, borderColor: "#CBDCEB", borderBottomWidth: 2 }} />
          {activeTab === "registration" && (
            <Box>
              <RegistrationSearch />
            </Box>
          )}
          {activeTab === "management" && (
            <Box>
              <ManagementList />
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
