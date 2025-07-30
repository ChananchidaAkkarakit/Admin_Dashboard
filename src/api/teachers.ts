import type { Teacher } from "../../../backend/src/mock/types";

export async function fetchTeachers(): Promise<Teacher[]> {
  const res = await fetch("http://localhost:4000/api/teachers");
  if (!res.ok) throw new Error("Failed to fetch teachers");
  return await res.json();
}
