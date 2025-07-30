import { useState, useEffect } from "react";
import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "../feature/auth/page/LoginPage";
import AuthLayout from "../layouts/AuthLayout";
import MainLayout from "../layouts/MainLayout";
import HomePage from "../feature/home/page/HomePage";
import MonitoringPage from "../feature/monitoring/page/MonitoringPage";
import SettingsPage from "../feature/settings/page/SettingsPage";
import UserInfoPage from "../feature/home/page/UserInfoPage";
import ManagementList from "../feature/management/Cupboard/components/ManagementList";
import CupboardPage from "../feature/management/Cupboard/pages/CupboardPage";
import QrCodePage from "../feature/management/QrCode/pages/QrCodePage";
import NotificationPage from "../feature/management/Notification/pages/NotificationPage";
import ProfilePage from "../feature/profile/page/ProfilePage";
import CupboardInfoPage from "../feature/management/Cupboard/pages/CupboardInfoPage";
import { SlotProvider } from "../feature/management/Cupboard/contexts/SlotContext";
import { QRCodeProvider } from "../feature/management/QrCode/contexts/QRCodeContext";
import QrCodeInfoPage from "../feature/management/QrCode/pages/QrCodeInfoPage";
import NotificationAddPage from "../feature/management/Notification/pages/NotificationAddPage";
import NotificationEditPage from "../feature/management/Notification/pages/NotificationEditPage";


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
        {/* 🔒 หน้า Login */}
        <Route
          path="/"
          element={isLoggedIn ? <Navigate to="/app/home" replace /> : <AuthLayout />}
        >
          <Route index element={<LoginPage setIsLoggedIn={setIsLoggedIn} />} />
        </Route>

        {/* 🔓 หลัง Login */}
        <Route path="/app"
          element={
            isLoggedIn ? (
              <SlotProvider> {/* ✅ ใส่ครอบ MainLayout */}
                <MainLayout
                  profileImage={profileImage}
                  setProfileImage={setProfileImage}
                />
              </SlotProvider>
            ) : (
              <Navigate to="/" replace />
            )
          }
        >

          {/* ✅ Redirect จาก /app → /app/home */}
          <Route index element={<Navigate to="/app/home" replace />} />

          <Route
            path="home"
            element={
              <HomePage
                setIsLoggedIn={setIsLoggedIn}
                profileImage={profileImage}
                setProfileImage={setProfileImage}
              />
            }
          />
          <Route
            path="profile"
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

          {/* 👇 Management */}
          <Route path="management">
            <Route index element={<ManagementList />} />
            <Route
              path="cupboard"
              element={
                <CupboardPage
                  setIsLoggedIn={setIsLoggedIn}
                  profileImage={profileImage}
                  setProfileImage={setProfileImage}
                />} />
            <Route path="cupboard/:slotId" element={
              <CupboardInfoPage
                setIsLoggedIn={setIsLoggedIn}
                profileImage={profileImage}
                setProfileImage={setProfileImage}
              />} />
            <Route path="qr" element={
              <QRCodeProvider>
                <QrCodePage
                  setIsLoggedIn={setIsLoggedIn}
                  profileImage={profileImage}
                  setProfileImage={setProfileImage}
                />
              </QRCodeProvider>
            } />
            <Route path="qr/:slotId" element={
              <QRCodeProvider>
                <QrCodeInfoPage
                  setIsLoggedIn={setIsLoggedIn}
                  profileImage={profileImage}
                  setProfileImage={setProfileImage}
                />
              </QRCodeProvider>
            } />
            <Route path="notification" element={
              <NotificationPage
                setIsLoggedIn={setIsLoggedIn}
                profileImage={profileImage}
                setProfileImage={setProfileImage}
              />} />
            <Route path="notification/add" element={
              <NotificationAddPage
                setIsLoggedIn={setIsLoggedIn}
                profileImage={profileImage}
                setProfileImage={setProfileImage}
              />}
            />
            <Route path="notification/edit/:id" element={
              <NotificationEditPage
                setIsLoggedIn={setIsLoggedIn}
                profileImage={profileImage}
                setProfileImage={setProfileImage}
              />}
            />

          </Route>
        </Route>
      </Routes>
    </HashRouter>
  );
}
