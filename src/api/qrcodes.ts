import { supabase } from '../supabaseClient';
import type { QRCodeSlot } from '../feature/management/QrCode/types/qrcode';


export async function fetchQRCodes(): Promise<QRCodeSlot[]> {
  const { data, error } = await supabase
    .from('enriched_qrcode_slots')   // <-- view ที่เราสร้างใน Supabase
    .select('*')
    .order('cupboard_id', { ascending: true })
    .order('slot_id', { ascending: true });

  if (error) throw error;

  // map ชื่อ field จาก view -> field ที่ UI ใช้
  return (data ?? []).map((d: any) => ({
    slotId: d.slot_id,
    cupboardId: d.cupboard_id,
    capacity: d.capacity,
    connectionStatus: d.connection_status,
    qrId: d.qr_id,
    teacherId: d.teacher_id,
    teacherName: d.teacher_name,
  }));
}
