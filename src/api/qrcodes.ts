import type { EnrichedQRCodeSlot } from "../../../backend/src/mock/types";

export async function fetchQRCodes(): Promise<EnrichedQRCodeSlot[]> {
  const res = await fetch("http://localhost:4000/api/qrcodes");
  if (!res.ok) throw new Error("Failed to fetch QR codes");
  return await res.json();
}
