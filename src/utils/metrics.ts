// สูตรคงที่
export const MAX_MM = 200;

export function clamp01to100(n: number) {
  return Math.max(0, Math.min(100, Math.round(n)));
}

// 👇 ตัวช่วย: แปลง "ค่าอะไรก็ได้" → เปอร์เซ็นต์ 0–100
function anyToPercent(value: number, maxMm: number) {
  if (!Number.isFinite(value)) return 0;
  if (value >= 0 && value <= 1) return clamp01to100(value * 100); // ratio
  if (value > 0 && value <= 100) return clamp01to100(value);      // already %
  // > 100 → มองเป็น mm
  return clamp01to100((value / maxMm) * 100);
}

/** แปลง mm → percent (0–100) */
export function mmToPercent(mm?: number | null, max = 200): number | null {
  if (mm == null || !Number.isFinite(mm)) return null;
  // ⬅️ กลับด้านสเกล
  return clamp01to100(100 - (mm / max) * 100);
}

/** คืน percent ที่พร้อมใช้ โดยพยายามใช้จาก DB ก่อน ถ้าไม่มีค่อยคำนวณ
 *  - รองรับทั้ง 0–1, 0–100, และหน่วย mm (>100)
 */
export function getCapacityPercent(input: {
  capacity_percent?: number | null; // จาก view v_slots ถ้ามี (อาจเป็น 0–1 หรือ 0–100)
  capacity_mm?: number | null;      // จาก view v_slots ถ้ามี (mm)
  capacity?: number | null;         // legacy 0–250 (mm)
  maxMm?: number;                   // optional: เพดาน mm รายช่อง
}): number {
  const maxMm = Number.isFinite(input.maxMm as number) ? (input.maxMm as number) : MAX_MM;

  // 1) เชื่อค่า percent จาก DB ก่อน แต่ normalize ให้ครอบคลุมทุกสเกล
  const fromView = input.capacity_percent;
  if (Number.isFinite(fromView as number)) {
    return anyToPercent(Number(fromView), maxMm);
  }

  // 2) ถ้าไม่มี percent ให้ดูค่าที่เป็น mm/legacy
  const mm =
    (typeof input.capacity_mm === "number" ? input.capacity_mm : null) ??
    (typeof input.capacity === "number" ? input.capacity : null);

  if (mm != null && Number.isFinite(mm)) {
    return anyToPercent(Number(mm), maxMm);
  }

  return 0;
}

/** แสดงเป็น "xx / 100" */
export function formatCapacityText(percent: number | null | undefined) {
  const p = Number.isFinite(percent as number) ? Math.round(percent as number) : 0;
  return `${p}%`;
}
