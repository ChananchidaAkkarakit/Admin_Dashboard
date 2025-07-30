// src/api/slots.ts
import type { Slot } from "../../../backend/src/mock/types";

export async function fetchSlots(): Promise<Slot[]> {
  const res = await fetch("http://localhost:4000/api/slots");
  if (!res.ok) throw new Error("Failed to fetch slots");
  return await res.json();
}
