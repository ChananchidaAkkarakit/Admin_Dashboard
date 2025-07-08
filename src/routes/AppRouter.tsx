import { useState, useEffect } from "react";
import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "../feature/auth/page/LoginPage";
import AuthLayout from "../layouts/AuthLayout";
import MainLayout from "../layouts/MainLayout";
import HomePage from "../feature/home/page/HomePage";
import MonitoringPage from "../feature/monitoring/page/MonitoringPage";
import SettingsPage from "../feature/settings/page/SettingsPage";
import UserInfoPage from "../feature/home/page/UserInfoPage";


export default function AppRouter() {
  const [isLoggedIn, setIsLoggedIn] = useState(localStorage.getItem("isLoggedIn") === "true");

  // เพิ่ม useEffect ตรงนี้!
  useEffect(() => {
    const handleUnload = () => {
      localStorage.removeItem("isLoggedIn");
      // ถ้ามี token หรือข้อมูลอื่นๆ เพิ่มเติม
      // localStorage.removeItem("token");
    };
    window.addEventListener("beforeunload", handleUnload);

    return () => {
      window.removeEventListener("beforeunload", handleUnload);
    };
  }, []);
  // จบ useEffect

  return (
    <HashRouter basename="/Admin_Dashboard">
      <Routes>
        {/* หน้า Login */}
        <Route
          path="/"
          element={
            isLoggedIn ? <Navigate to="/app" replace /> : <AuthLayout />
          }
        >
          {/* ส่ง setIsLoggedIn ไปที่ LoginPage */}
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
              <MainLayout />
            ) : (
              <Navigate to="/" replace />
            )
          }
        >
          <Route index element={<HomePage setIsLoggedIn={setIsLoggedIn} />} />
          <Route path="monitoring" element={<MonitoringPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="userinfo/:id" element={<UserInfoPage />} />

        </Route>
      </Routes>
    </HashRouter>
    
  );
}
