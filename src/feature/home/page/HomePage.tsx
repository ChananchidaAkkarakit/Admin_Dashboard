import React, { useState } from "react";
import { Grid, Box, Divider } from "@mui/material";
import WelcomeHeader from "../components/WelcomeHeader";
import RegistrationCard from "../components/RegistrationCard";
import ManagementCard from "../components/ManagementCard";
import ProfilePanel from "../components/ProfilePanel";
import RegistrationSearch from "../components/RegistrationSearch";
import ManagementList from "../../management/components/ManagementList";

type HomePageProps = {
  setIsLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function HomePage({ setIsLoggedIn }: HomePageProps) {
  const [activeTab, setActiveTab] = useState<"registration" | "management">("registration");

  return (
    <Grid container spacing={3}>
      {/* Column ซ้าย */}
      <Grid item xs={12} md={8} >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            width: "658px", ///////////////////note
            //gap: 2,
          }}
        >
          {/* Welcome Header */}
          <WelcomeHeader />

          {/* การ์ด 2 ใบ */}
          <Box display="flex" p={2} gap={3} justifyContent="center" flexWrap="wrap">
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


          {/* เนื้อหา Search หรือ Management */}
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
      </Grid>

      {/* Column ขวา */}
      <Grid container>
        <Grid item xs={12} md={10}>
          {/* Content */}
        </Grid>

        <Divider
          orientation="vertical"
          flexItem
          sx={{
            display: { xs: "none", md: "block" },
            mx: 0, // หรือ mx: 2 ถ้าอยากให้ห่าง
            my: 1, // ระยะขอบบน-ล่าง
            borderColor: "#CBDCEB",
          }}
        />

        <Grid item xs={12} md={2}>
          <ProfilePanel setIsLoggedIn={setIsLoggedIn} />
        </Grid>
      </Grid>

    </Grid>

  );
}