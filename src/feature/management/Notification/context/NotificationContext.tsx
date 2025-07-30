// src/contexts/NotificationContext.ts

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import type { Notification } from "../../../../../../backend/src/mock/types"; // 🟡 ปรับ path ให้ตรงกับที่ใช้จริง
import { fetchNotifications } from "../../../../api/notifications"; // ✅ mock หรือ API จริงก็ได้

type NotificationContextType = {
  notifications: Notification[];
  loading: boolean;
  error: string | null;
  markAsRead: (id: string) => void;
  addNotification: (item: Notification) => void;
};

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ดึงข้อมูลแจ้งเตือนครั้งแรก
  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchNotifications();
        setNotifications(data);
        setError(null);
      } catch (err: any) {
        setError("ไม่สามารถโหลดแจ้งเตือนได้");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((item) =>
        item.messageId === id ? { ...item, isRead: true } : item
      )
    );
  };

  const addNotification = (item: Notification) => {
    setNotifications((prev) => {
      // ป้องกัน duplicate id
      if (prev.find((n) => n.messageId === item.messageId)) return prev;
      return [item, ...prev];
    });
  };

  return (
    <NotificationContext.Provider
      value={{ notifications, loading, error, markAsRead, addNotification }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotificationContext = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) {
    throw new Error("useNotificationContext must be used within NotificationProvider");
  }
  return ctx;
};
