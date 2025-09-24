import { supabase } from "../supabaseClient";

export type NotificationSettings = {
  user_id: string;
  cupboard_id: string;
  alert_cupboard_door: boolean;
  alert_connection: boolean;
  alert_full: boolean;
  alert_sensor_error: boolean;
};

const TABLE = "notification_settings";

export async function ensureUserId(): Promise<string> {
  let uid = localStorage.getItem("uid");
  if (!uid) {
    uid = crypto.randomUUID();
    localStorage.setItem("uid", uid);
  }
  return uid;
}

export async function fetchSettings(cupboardId = "default") {
  const user_id = await ensureUserId();

  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("user_id", user_id)
    .eq("cupboard_id", cupboardId)
    .maybeSingle();

  if (error && error.code !== "PGRST116") throw error;

  if (!data) {
    // คืนค่า default (ยังไม่เขียนลง DB จนกว่าจะมีการกด toggle)
    const defaults: NotificationSettings = {
      user_id,
      cupboard_id: cupboardId,
      alert_cupboard_door: true,
      alert_connection: false,
      alert_full: true,
      alert_sensor_error: false,
    };
    return defaults;
  }

  const row = data as NotificationSettings;
  return row;
}

export async function saveSettings(values: NotificationSettings) {
  const { data, error } = await supabase
    .from(TABLE)
    .upsert(values, { onConflict: "user_id,cupboard_id" })
    .select()
    .single();

  if (error) throw error;
  return data as NotificationSettings;
}
