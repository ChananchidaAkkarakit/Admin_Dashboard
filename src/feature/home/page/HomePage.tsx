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
      <Grid item xs={12} md={8}>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            width: "100%", // ปรับให้ responsive
          }}
        >
          <WelcomeHeader />

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
      <Grid item xs={12} md={4}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Divider
              orientation="horizontal"
              flexItem
              sx={{
                display: { xs: "block", md: "none" },
                my: 2,
                borderColor: "#CBDCEB",
              }}
            />
          </Grid>
          <Grid item xs={12}>
            <ProfilePanel setIsLoggedIn={setIsLoggedIn} />
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
}
