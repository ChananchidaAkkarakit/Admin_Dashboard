// src/api/notifications.ts
import { supabase } from "../supabaseClient";
import type { Notification } from "@shared/notifications";
import type { NotificationFormValues } from "../feature/management/Notification/components/NotificationForm";

/** ───────────────── Map type ระหว่าง DB กับ UI ───────────────── */
type UiType = "notification" | "warning" | "error";
type DbType = "info" | "success" | "warning" | "error";

const dbToUiType = (t: DbType | string | null | undefined): UiType => {
  if (t === "warning" || t === "error") return t;
  return "notification"; // info/success => notification สำหรับ UI
};
const uiToDbType = (t: UiType | string | null | undefined): DbType => {
  if (t === "warning" || t === "error") return t as DbType;
  return "info"; // UI ใช้ 'notification' -> DB เก็บ 'info'
};

/** ───────────────── Shapes ที่หน้า UI คาดหวัง ───────────────── */
export type NotificationListItem = {
  messageId: string;       // = message.message_id (uuid)
  messageName: string;     // = message.name
  message: string;         // = message.body
  type: UiType;            // mapped จาก message.type
  source: "system" | "admin";
  status: boolean;         // notification.status
};

type DbMessage = {
  message_id: string;
  name: string;
  body: string;
  type: DbType;
  created_at?: string;
};

type DbNotification = {
  notification_id: string;
  message_id: string;
  source: "system" | "admin";
  status: boolean;
  created_at?: string;
  target_role?: "teacher" | "student" | "all" | "admin" | null;
  payload?: Record<string, any> | null;
};

/** ───────────────── Helper: แปลง UTC ISO -> Asia/Bangkok (+07:00) ─────────────────
 * เก็บใน DB เป็น UTC ตามปกติ แต่ส่งออกให้ฝั่งเว็บเป็นเวลาไทย
 */
function toBkkISO(iso?: string | null): string | undefined {
  if (!iso) return undefined;
  const ms = Date.parse(iso);
  if (Number.isNaN(ms)) return iso as string;
  const bkkMs = ms + 7 * 60 * 60 * 1000; // shift +7h
  const dt = new Date(bkkMs);
  const pad = (n: number) => String(n).padStart(2, "0");
  const y = dt.getUTCFullYear();
  const mo = pad(dt.getUTCMonth() + 1);
  const d = pad(dt.getUTCDate());
  const h = pad(dt.getUTCHours());
  const mi = pad(dt.getUTCMinutes());
  const s = pad(dt.getUTCSeconds());
  return `${y}-${mo}-${d}T${h}:${mi}:${s}+07:00`;
}
/** เวลาโชว์แบบไทย H.mm (ตัวอย่าง 5:17 => "5.17") */
function toBkkHM(iso?: string | null): string | undefined {
  if (!iso) return undefined;
  const ms = Date.parse(iso);
  if (Number.isNaN(ms)) return undefined;
  const dt = new Date(ms + 7 * 60 * 60 * 1000); // UTC+7
  const h = dt.getUTCHours(); // ไม่เติมศูนย์นำหน้า
  const m = String(dt.getUTCMinutes()).padStart(2, "0");
  return `${h}.${m}`;
}
/** ───────────────── 1) List: notification join message → คืน Notification[] ─────────────────
 * หน้า List/Context ของคุณจะ dedupe ด้วย messageId เองแล้ว
 */
export async function fetchNotifications(): Promise<Notification[]> {
  const { data, error } = await supabase
    .from("notification")
    .select(`
      notification_id,
      message_id,
      source,
      status,
      created_at,
      target_role,
      message:message_id (
        message_id,
        name,
        body,
        type
      )
    `)
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) throw error;

  type JoinedRow = DbNotification & { message: DbMessage | DbMessage[] | null };
  const rows = (data ?? []) as JoinedRow[];

  const out: Notification[] = rows.map((r) => {
    const m = Array.isArray(r.message) ? (r.message?.[0] ?? null) : (r.message ?? null);
    const obj: any = {
      messageId: m?.message_id ?? r.message_id,
      messageName: m?.name ?? "(no title)",
      message: m?.body ?? "",
      // ใช้ DB type ('info'|'success'|'warning'|'error') ให้ตรงกับ @shared/notifications
      type: (m?.type ?? "info"),
      source: r.source === "admin" ? "admin" : "system",
      status: !!r.status,
    };
    if (r.notification_id) obj.notificationId = r.notification_id;
    if (r.created_at) obj.createdAt = toBkkHM(r.created_at); // ✅ เวลาไทย
    if (r.target_role !== undefined) obj.targetRole = r.target_role;
    return obj as Notification;
  });

  return out;
}

/** ───────────────── 2) Read template สำหรับหน้าแก้ไข (คืน Notification) ───────────────── */
export async function fetchNotificationsById(id: string): Promise<Notification> {
  const { data, error } = await supabase
    .from("message")
    .select("message_id, name, body, type")
    .eq("message_id", id)
    .single();

  if (error) throw error;
  const msg = data as DbMessage;

  return {
    messageId: msg.message_id,
    messageName: msg.name,
    message: msg.body,
    // คืน DB type ให้ตรงสเปกของ Notification
    type: (msg.type ?? "info") as Notification["type"],
    source: "admin",
    status: true,
  } as Notification;
}

/** ───────────────── 3) Create template (message) + seed instance ─────────
 * เพิ่ม message แล้วสร้าง notification instance แบบ status=false
 * เพื่อให้หน้า List มองเห็นรายการใหม่ทันที
 */
export async function addNotification(input: NotificationFormValues): Promise<{ messageId: string }>;
export async function addNotification(input: { messageName: string; message: string; type: UiType }): Promise<{ messageId: string }>;
export async function addNotification(input: any): Promise<{ messageId: string }> {
  const name: string = input.messageName;
  const body: string = input.message;
  // รองรับ 'info' | 'success' ด้วย แล้ว map เป็น DB type ภายใน
  const dbType: DbType = uiToDbType(input.type);

  // 3.1 insert message
  const { data: insertedMsg, error: insErr } = await supabase
    .from("message")
    .insert({
      name,
      body,
      type: dbType,
    })
    .select("message_id")
    .single();

  if (insErr) throw insErr;
  const messageId = (insertedMsg as { message_id: string }).message_id;

  // 3.2 seed instance (ยังไม่ส่งจริง) ให้ List โชว์
  const { error: insNotifErr } = await supabase.from("notification").insert({
    message_id: messageId,
    source: "admin",
    status: false,      // ยังไม่ส่งจริง
    target_role: null,  // ยังไม่เจาะกลุ่ม
    payload: null,
  });

  if (insNotifErr) throw insNotifErr;
  return { messageId };
}

/** ───────────────── 4) Update template (message) ───────────────── */
export async function updateNotification(
  id: string,
  values: {
    messageName?: string;
    message?: string;
    type?: UiType; // UI type
  }
) {
  const patch: Partial<DbMessage> = {};
  if (values.messageName !== undefined) patch["name"] = values.messageName;
  if (values.message !== undefined) patch["body"] = values.message;
  if (values.type !== undefined) patch["type"] = uiToDbType(values.type);

  const { error } = await supabase
    .from("message")
    .update(patch)
    .eq("message_id", id);

  if (error) throw error;
}

/** ───────────────── 5) Quick Send: ใส่ instance ส่งจริงตาม role ─────────
 * role ตามสคีมา: 'teacher' | 'student'
 * ถ้าต้องการระบุคน: เติม target_teacher_id/target_student_id เองได้
 */
export async function sendNotificationToRole(
  messageId: string,
  role: "teacher" | "student",
  payload?: Record<string, any> | null
): Promise<void> {
  // ตรวจว่ามี template จริง
  const { data: msg, error: getErr } = await supabase
    .from("message")
    .select("message_id")
    .eq("message_id", messageId)
    .single();
  if (getErr || !msg) throw getErr ?? new Error("Template not found");

  const { error } = await supabase
    .from("notification")
    .insert({
      message_id: messageId,
      source: "admin",
      status: true,    // ส่งจริง (เปิด)
      target_role: role,
      payload: payload ?? null,
    })
    .select("notification_id")  // เผื่อ debug ภายหลัง
    .single();

  if (error) throw error;
}

/** ส่งถึงทั้งอาจารย์และนักศึกษา */
export async function sendNotificationToAll(
  messageId: string,
  payload?: Record<string, any> | null
) {
  await Promise.all([
    sendNotificationToRole(messageId, "teacher", payload),
    sendNotificationToRole(messageId, "student", payload),
  ]);
}
