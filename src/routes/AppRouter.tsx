import { useState, useEffect } from "react";
import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "../feature/auth/page/LoginPage";
import AuthLayout from "../layouts/AuthLayout";
import MainLayout from "../layouts/MainLayout";
import HomePage from "../feature/home/page/HomePage";
import MonitoringPage from "../feature/monitoring/page/MonitoringPage";
import SettingsPage from "../feature/settings/page/SettingsPage";
import UserInfoPage from "../feature/home/page/UserInfoPage";
import ManagementList from "../feature/management/components/ManagementList";
import CupboardPage from "../feature/management/pages/CupboardPage";
import QRPage from "../feature/management/pages/QRCodePage";
import NotificationPage from "../feature/management/pages/NotificationPage";
import ProfilePage from "../feature/profile/page/ProfilePage";


export default function AppRouter() {
  const [isLoggedIn, setIsLoggedIn] = useState(localStorage.getItem("isLoggedIn") === "true");

  useEffect(() => {
    const handleUnload = () => {
      localStorage.removeItem("isLoggedIn");
    };
    window.addEventListener("beforeunload", handleUnload);
    return () => {
      window.removeEventListener("beforeunload", handleUnload);
    };
  }, []);

  const [profileImage, setProfileImage] = useState<string | null>(
    localStorage.getItem("profileImage")
  );

  useEffect(() => {
    if (profileImage) {
      localStorage.setItem("profileImage", profileImage);
    } else {
      localStorage.removeItem("profileImage");
    }
  }, [profileImage]);

  return (
    <HashRouter>
<Routes>
  {/* หน้า Login */}
  <Route
    path="/"
    element={
      isLoggedIn ? <Navigate to="/app" replace /> : <AuthLayout />
    }
  >
    <Route
      index
      element={<LoginPage setIsLoggedIn={setIsLoggedIn} />}
    />
  </Route>

  {/* หลัง Login */}
  <Route
    path="/app"
    element={
      isLoggedIn ? (
        <MainLayout
          profileImage={profileImage}
          setProfileImage={setProfileImage}
        />
      ) : (
        <Navigate to="/" replace />
      )
    }
  >
    <Route
      index
      element={
        <HomePage
          setIsLoggedIn={setIsLoggedIn}
          profileImage={profileImage}
          setProfileImage={setProfileImage}
        />
      }
    />
    <Route
  path="app/profile"
  element={
    <ProfilePage
      setIsLoggedIn={setIsLoggedIn}
      profileImage={profileImage}
      setProfileImage={setProfileImage}
    />
  }
/>
    <Route path="monitoring" element={<MonitoringPage />} />
    <Route path="settings" element={<SettingsPage />} />
    <Route
      path="userinfo/:id"
      element={
        <UserInfoPage
          setIsLoggedIn={setIsLoggedIn}
          profileImage={profileImage}
          setProfileImage={setProfileImage}
        />
      }
    />
    {/* Management */}
    <Route path="management">
      <Route index element={<ManagementList />} />
      <Route 
      path="cupboard" 
      element={<CupboardPage
          setIsLoggedIn={setIsLoggedIn}
          profileImage={profileImage}
          setProfileImage={setProfileImage} 
          />
        } 
      />
      <Route path="qr" element={<QRPage />} />
      <Route path="notification" element={<NotificationPage />} />
    </Route>
  </Route>
</Routes>

    </HashRouter>
  );
}
