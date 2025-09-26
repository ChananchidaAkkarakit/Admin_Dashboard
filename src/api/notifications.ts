// src/services/notifications.ts
import type { Notification } from "../types/notifications";
import type { NotificationFormValues } from "../feature/management/Notification/components/NotificationForm";
import { supabase } from "../supabaseClient";

export async function fetchNotifications(): Promise<Notification[]> {
  const { data, error } = await supabase
    .from("v_notifications")
    .select("*")
    .order("createdAt", { ascending: false }); // uses view's camelCase
  if (error) {
    console.error("[fetchNotifications] error:", error);
    return [];
  }
  return (data ?? []) as Notification[];
}

export async function fetchNotificationsById(id: string): Promise<Notification> {
  const { data, error } = await supabase
    .from("v_notifications")
    .select("*")
    .eq("notificationId", id) // ✅ correct column
    .single();
  if (error) throw error;
  return data as Notification;
}

export async function addNotification(input: NotificationFormValues) {
  // map "notification" → "info"
  const msgType = (input.type as any) === "notification" ? "info" : input.type;

  // 1) create message
  const { data: msg, error: e1 } = await supabase
    .from("message")
    .insert({ name: input.messageName, body: input.message, type: msgType })
    .select("message_id")
    .single();
  if (e1) throw e1;

  // 2) create notification
  const { data: noti, error: e2 } = await supabase
    .from("notification")
    .insert({
      message_id: msg!.message_id,
      source: input.source,
      status: input.status ?? true,
      target_role: input.targetRole ?? null,
      target_teacher_id: (input as any).targetTeacherId ?? null,
      target_student_id: (input as any).targetStudentId ?? null,
      payload: (input as any).payload ?? null,
    })
    .select("notification_id")
    .single();
  if (e2) throw e2;

  // 3) read back from view
  const { data, error } = await supabase
    .from("v_notifications")
    .select("*")
    .eq("notificationId", noti!.notification_id) // ✅ correct column
    .single();
  if (error) throw error;
  return data as Notification;
}

export async function updateNotification(id: string, patch: Partial<Notification>) {
  // find message_id from notification
  const { data: n0, error: e0 } = await supabase
    .from("notification")
    .select("message_id")
    .eq("notification_id", id)
    .single();
  if (e0) throw e0;

  // update notification fields
  const notifUpd: any = {};
  if (typeof patch.status === "boolean") notifUpd.status = patch.status;
  if (patch.source) notifUpd.source = patch.source as any;
  if (patch.targetRole) notifUpd.target_role = patch.targetRole;
  if (patch.targetTeacherId !== undefined) notifUpd.target_teacher_id = patch.targetTeacherId;
  if (patch.targetStudentId !== undefined) notifUpd.target_student_id = patch.targetStudentId;
  if (patch.payload !== undefined) notifUpd.payload = patch.payload;

  if (Object.keys(notifUpd).length) {
    const { error } = await supabase
      .from("notification")
      .update(notifUpd)
      .eq("notification_id", id);
    if (error) throw error;
  }
  

  // update message fields
  const msgUpd: any = {};
  if (patch.messageName) msgUpd.name = patch.messageName;
  if (patch.message) msgUpd.body = patch.message;
  if (patch.type) msgUpd.type = (patch.type as any) === "notification" ? "info" : patch.type;
  if (Object.keys(msgUpd).length) {
    const { error } = await supabase
      .from("message")
      .update(msgUpd)
      .eq("message_id", n0!.message_id);
    if (error) throw error;
  }

  // read back from view
  const { data, error } = await supabase
    .from("v_notifications")
    .select("*")
    .eq("notificationId", id) // ✅ correct column
    .single();
  if (error) throw error;
  return data as Notification;
}

export async function deleteNotification(id: string) {
  const { error } = await supabase
    .from("notification")
    .delete()
    .eq("notification_id", id);
  if (error) throw error;
}
