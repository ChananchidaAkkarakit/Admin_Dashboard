// สูตรคงที่
export const MAX_MM = 250;

export function clamp01to100(n: number) {
  return Math.max(0, Math.min(100, Math.round(n)));
}

/** แปลง mm → percent (0–100) */
export function mmToPercent(mm?: number | null, max = MAX_MM): number | null {
  if (mm == null || !Number.isFinite(mm)) return null;
  return clamp01to100((mm / max) * 100);
}

/** คืน percent ที่พร้อมใช้ โดยพยายามใช้จาก DB ก่อน ถ้าไม่มีค่อยคำนวณ */
export function getCapacityPercent(input: {
  capacity_percent?: number | null; // จาก view v_slots ถ้ามี
  capacity_mm?: number | null;      // จาก view v_slots ถ้ามี
  capacity?: number | null;         // จากตารางเดิม 0–250
}): number {
  const fromView = input.capacity_percent;
  if (Number.isFinite(fromView as number)) return fromView as number;

  const mm =
    (typeof input.capacity_mm === "number" ? input.capacity_mm : null) ??
    (typeof input.capacity === "number" ? input.capacity : null);

  const p = mmToPercent(mm);
  return p == null ? 0 : p;
}

/** แสดงเป็น "xx / 100" */
export function formatCapacityText(percent: number | null | undefined) {
  const p = Number.isFinite(percent as number) ? Math.round(percent as number) : 0;
  return `${p} / 100`;
}
