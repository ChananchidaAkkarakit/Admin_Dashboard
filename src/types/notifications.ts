// src/types/notifications.ts
export type NotificationType = "info" | "warning" | "error" | "success";
export type NotificationSource = "system" | "sensor" | "submission";

export interface Notification {
  // from notification table (camelCase via view)
  notificationId: string;
  userId: string | null;
  source: NotificationSource;
  status: boolean;
  createdAt: string; // ISO date string
  targetRole: "teacher" | "student" | "admin" | null;
  targetTeacherId: string | null;
  targetStudentId: string | null;
  payload: Record<string, any> | null;

  // from message table
  messageId: string;
  messageName: string;
  message: string;
  type: NotificationType;
}
