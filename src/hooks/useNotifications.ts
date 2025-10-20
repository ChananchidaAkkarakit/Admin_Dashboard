// src/hooks/useNotifications.ts
import { supabase } from "../supabaseClient";
import { useEffect, useState, useCallback } from "react";

export type NotificationItem = {
  notification_id: string;
  status: boolean;
  created_at: string;
  payload: Record<string, any> | null;
  message: {
    name: string;
    body: string;
  } | null;
};

export function useNotifications(userId: string | undefined) {
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  // ✅ รองรับ {key} และ {{key}}
  const interpolate = useCallback((template: string | undefined, payload: Record<string, any> | null): string => {
    if (!template) return "";
    if (!payload || Object.keys(payload).length === 0) return template;

    let result = template;
    result = result.replace(/\{\{(\w+)\}\}/g, (m, k) => (payload[k] ?? m));
    result = result.replace(/\{(\w+)\}/g, (m, k) => (payload[k] ?? m));
    return String(result);
  }, []);

  const fetchNotifications = useCallback(async () => {
    if (!userId) {
      setItems([]);
      setLoading(false);
      return;
    }
    setLoading(true);

    // ⛳️ ระบุ FK ด้วย !fk_notification_message เพื่อกัน PGRST201
    // src/hooks/useNotifications.ts
    const { data, error } = await supabase
      .from("notification")
      // useNotifications.ts
      .select(`
  notification_id,
  created_at,
  status,
  payload,
  message (name, body)   // ✅ ใช้ "message" ไม่ใช่ message_id
`)

      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(50);


    if (error) {
      console.error("Error fetching notifications:", error);
    } else if (data) {
      const shaped = data.map((n: any) => ({
        notification_id: n.notification_id,
        created_at: n.created_at,
        status: n.status,
        payload: n.payload,
        message: Array.isArray(n.message) ? (n.message[0] ?? null) : (n.message ?? null),
      }));
      setItems(shaped);
      console.log(`📬 Fetched ${shaped.length} notifications`);
    }
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // ✅ Realtime: ฟังทั้ง INSERT และ UPDATE (กรณี upsert ทำ UPDATE)
  useEffect(() => {
    if (!userId) return;

    console.log(`🔔 Setting up real-time subscription for user: ${userId}`);

    const channel = supabase
      .channel(`public:notification:user_id=eq.${userId}`)
      .on("postgres_changes",
        { event: "INSERT", schema: "public", table: "notification", filter: `user_id=eq.${userId}` },
        () => fetchNotifications()
      )
      .on("postgres_changes",
        { event: "UPDATE", schema: "public", table: "notification", filter: `user_id=eq.${userId}` },
        () => fetchNotifications()
      )
      .subscribe((status) => {
        console.log(`📡 Subscription status: ${status}`);
      });

    return () => {
      console.log("🔕 Cleaning up subscription");
      supabase.removeChannel(channel);
    };
  }, [userId, fetchNotifications]);

  const markAsRead = useCallback(async (notificationId: string) => {
    setItems(prev => prev.map(n => n.notification_id === notificationId ? { ...n, status: false } : n));
    const { error } = await supabase.from("notification").update({ status: false }).eq("notification_id", notificationId);
    if (error) {
      console.error("Error marking notification as read:", error);
      fetchNotifications();
    }
  }, [fetchNotifications]);

  const markAllAsRead = useCallback(async () => {
    const unreadIds = items.filter(i => i.status).map(i => i.notification_id);
    if (unreadIds.length === 0) return;

    setItems(prev => prev.map(n => ({ ...n, status: false })));
    const { error } = await supabase.from("notification").update({ status: false }).in("notification_id", unreadIds);
    if (error) {
      console.error("Error marking all as read:", error);
      fetchNotifications();
    }
  }, [items, fetchNotifications]);

  // ⬇️ ให้ component ภายนอกเรียกรีเฟรชได้
  const refetch = useCallback(() => fetchNotifications(), [fetchNotifications]);

  return { items, loading, markAsRead, markAllAsRead, interpolate, refetch };
}
