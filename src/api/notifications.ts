// src/api/notifications.ts
import type { Notification } from "@shared/notifications";
 // ปรับ path ถ้าเก็บ type ที่อื่น

export async function fetchNotifications(): Promise<Notification[]> {
  try {
    const response = await fetch(`${import.meta.env.VITE_BACKEND}/api/notifications`);
    if (!response.ok) throw new Error("Failed to fetch notifications");
    return await response.json();
  } catch (err) {
    console.error("Error fetching notifications:", err);
    return []; // หรือโยน error ออกไปก็ได้
  }
}
export async function addNotification(newNotification: Omit<Notification, "id">) {
  try {
    const response = await fetch(`${import.meta.env.VITE_BACKEND}/api/notifications`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newNotification),
    });
    if (!response.ok) throw new Error("Failed to add notification");
    return await response.json();
  } catch (err) {
    console.error("Error adding notification:", err);
    throw err;
  }
}
export async function updateNotification(id: string, updatedData: Partial<Notification>) {
  try {
    const response = await fetch(`${import.meta.env.VITE_BACKEND}/api/notifications/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedData),
    });
    if (!response.ok) throw new Error("Failed to update notification");
    return await response.json();
  } catch (err) {
    console.error("Error updating notification:", err);
    throw err;
  }
}
export async function deleteNotification(id: string) {
  try {
    const response = await fetch(`${import.meta.env.VITE_BACKEND}/api/notifications/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error("Failed to delete notification");
  } catch (err) {
    console.error("Error deleting notification:", err);
    throw err;
  }
}
// src/api/notifications.ts
export async function fetchNotificationsById(id: string): Promise<Notification> {
  try {
    const res = await fetch(`${import.meta.env.VITE_BACKEND}/api/notifications/${id}`);
    if (!res.ok) throw new Error("Failed to fetch notification by id");
    return await res.json();
  } catch (error) {
    console.error("Error fetching by id:", error);
    throw error;
  }
}
