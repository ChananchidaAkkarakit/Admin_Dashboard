// src/contexts/NotificationContext.ts
import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import type { Notification } from "@shared/notifications";
import { fetchNotifications } from "../../../../api/notifications";

type NotificationContextType = {
  notifications: Notification[];
  loading: boolean;
  error: string | null;
  markAsRead: (id: string) => void;   // สำหรับ UI ภายใน context เท่านั้น
  addNotification: (item: Notification) => void;
};

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchNotifications();
        setNotifications(data ?? []);
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
    // NOTE: ถ้าอยากผูกกับ notification instance จริง ต้องอัปเดตผ่าน Supabase
    setNotifications((prev) =>
      prev.map((n) => (n.messageId === id ? { ...n, status: false } : n))
    );
  };

  const addNotification = (item: Notification) => {
    setNotifications((prev) => {
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
