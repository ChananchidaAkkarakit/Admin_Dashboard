export function normalizeStudentId(raw: string): string | null {
  const digits = raw.trim().toLowerCase().replace(/[^0-9]/g, "");
  return digits.length === 13 ? digits : null;
}

// (ทางเลือก) สำหรับแสดงในช่องกรอกให้ดูอ่านง่าย แต่ส่งค่าเป็น 13 หลักล้วน
export function formatStudentIdWithDashes(raw: string): string {
  const d = raw.replace(/[^0-9]/g, "").slice(0, 13);
  if (d.length <= 4)  return d;
  if (d.length <= 7)  return `${d.slice(0,4)}-${d.slice(4)}`;
  if (d.length <= 10) return `${d.slice(0,4)}-${d.slice(4,7)}-${d.slice(7)}`;
  return `${d.slice(0,4)}-${d.slice(4,7)}-${d.slice(7,10)}-${d.slice(10,13)}`;
}
