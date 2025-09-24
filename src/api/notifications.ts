import type { Notification } from "@shared/notifications";
import type { NotificationFormValues } from "../feature/management/Notification/components/NotificationForm";
import { supabase } from "../supabaseClient";

export async function fetchNotifications(): Promise<Notification[]> {
  const { data, error } = await supabase
    .from("v_notifications")
    .select("*")
    .order("createdAt", { ascending: false });
  if (error) { console.error(error); return []; }
  return (data ?? []) as Notification[];
}

export async function fetchNotificationsById(id: string): Promise<Notification> {
  const { data, error } = await supabase
    .from("v_notifications").select("*").eq("messageId", id).single();
  if (error) throw error;
  return data as Notification;
}

export async function addNotification(input: NotificationFormValues) {
  const type = (input.type as any) === "notification" ? "info" : input.type;
  const { data: msg, error: e1 } = await supabase
    .from("message").insert({ name: input.messageName, body: input.message, type })
    .select("message_id").single();
  if (e1) throw e1;

  const { data: noti, error: e2 } = await supabase
    .from("notification").insert({ message_id: msg!.message_id, source: input.source, status: input.status ?? true })
    .select("notification_id").single();
  if (e2) throw e2;

  const { data, error } = await supabase
    .from("v_notifications").select("*").eq("messageId", noti!.notification_id).single();
  if (error) throw error;
  return data as Notification;
}

export async function updateNotification(id: string, patch: Partial<Notification>) {
  const { data: n0, error: e0 } = await supabase
    .from("notification").select("message_id").eq("notification_id", id).single();
  if (e0) throw e0;

  const notifUpd: any = {};
  if (typeof patch.status === "boolean") notifUpd.status = patch.status;
  if (patch.source) notifUpd.source = patch.source;
  if (Object.keys(notifUpd).length) {
    const { error } = await supabase.from("notification").update(notifUpd).eq("notification_id", id);
    if (error) throw error;
  }

  const msgUpd: any = {};
  if (patch.messageName) msgUpd.name = patch.messageName;
  if (patch.message) msgUpd.body = patch.message;
  if (patch.type) msgUpd.type = (patch.type as any) === "notification" ? "info" : patch.type;
  if (Object.keys(msgUpd).length) {
    const { error } = await supabase.from("message").update(msgUpd).eq("message_id", n0!.message_id);
    if (error) throw error;
  }

  const { data, error } = await supabase
    .from("v_notifications").select("*").eq("messageId", id).single();
  if (error) throw error;
  return data as Notification;
}

export async function deleteNotification(id: string) {
  const { error } = await supabase.from("notification").delete().eq("notification_id", id);
  if (error) throw error;
}
