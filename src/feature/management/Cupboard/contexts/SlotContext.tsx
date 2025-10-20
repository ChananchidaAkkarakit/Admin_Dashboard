// src/feature/management/Cupboard/contexts/SlotContext.tsx
import { createContext, useContext, useEffect, useState, useCallback } from "react";
import type { ReactNode } from "react";
import { supabase } from "../../../../supabaseClient";

/** ---------- Types ---------- */
export type Slot = {
  slotId: string;
  cupboardId: string;
  teacherId: string | null;
  capacityPercent: number | null;
  capacityMm: number | null;
  connectionStatus: "online" | "offline" | "unknown";
  teacherName?: string | null;
};

export type SlotContextType = {
  slots: Slot[];
  loading: boolean;
  refresh: () => Promise<void>;
  updateSlotStatus: (slotId: string, status: boolean) => Promise<void>;
  updateTeacher: (slotId: string, teacherId: string, teacherName?: string) => Promise<void>;
  addSlot: (teacherId: string, on: boolean, capacityMm?: number) => Promise<{ slotId: string; cupboardId: string }>;
};

const SlotContext = createContext<SlotContextType | undefined>(undefined);

export const useSlotContext = () => {
  const ctx = useContext(SlotContext);
  if (!ctx) throw new Error("useSlotContext must be used within SlotProvider");
  return ctx;
};
// เพิ่ม helper ไฟล์นี้
function normalizeUiConnFromView(v: any): "online" | "offline" | "unknown" {
  const s = String(v ?? "").trim().toLowerCase();
  if (s === "active" || s === "online" || s === "connected") return "online";
  if (s === "inactive" || s === "offline" || s === "disconnected") return "offline";
  return "unknown";
}

function mapRow(r: any): Slot {
  return {
    slotId: r.slot_id,
    cupboardId: r.cupboard_id,
    teacherId: r.teacher_id,
    capacityPercent: r.capacity_percent ?? null,
    capacityMm: r.capacity_mm ?? null,
    connectionStatus: normalizeUiConnFromView(r.connection_status), // ✅ normalize ที่เดียว
    teacherName: r.teacher_name_thai ?? r.teacher_name_eng ?? null
  };
}

// function mapRow(r: any): Slot {
//   return {
//     slotId: r.slot_id,
//     cupboardId: r.cupboard_id,
//     teacherId: r.teacher_id,
//     capacityPercent: r.capacity_percent ?? null,  // ✅ เอาค่านี้ไปใช้ทุกหน้า
//     capacityMm: r.capacity_mm ?? null,
//     connectionStatus: r.connection_status ?? "unknown", // v_slots ส่ง online/offline/unknown
//     teacherName: r.teacher_name_thai ?? r.teacher_name_eng ?? null
//   };
// }

export const SlotProvider = ({ children }: { children: ReactNode }) => {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);

    // ถ้ามี view v_slots_ordered ใช้ตัวนี้ได้เลย
    // ถ้าไม่มี ให้เปลี่ยนเป็น .from("v_slots") แล้ว order ด้วย cupboard_id, slot_id
    const { data, error } = await supabase
      .from("v_slots")
      .select("slot_id,cupboard_id,teacher_id,capacity_mm,capacity_percent,connection_status,is_open,last_seen_at,teacher_name_thai,teacher_name_eng")
      .order("cupboard_id")
      .order("slot_id");

    if (error) {
      console.error("❌ fetch slots:", error);
      setSlots([]);
    } else {
      setSlots((data ?? []).map(mapRow));
    }
    setLoading(false);
  }, []);

  useEffect(() => { void refresh(); }, [refresh]);

  // realtime: ฟังจากตารางจริง 'slots' ก็พอ (view ไม่ยิง event)
  useEffect(() => {
    const ch = supabase
      .channel("slots-rt")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "slots" }, refresh)
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "slots" }, refresh)
      .on("postgres_changes", { event: "DELETE", schema: "public", table: "slots" }, refresh)
      .subscribe();

    return () => { void supabase.removeChannel(ch); };
  }, [refresh]);

  const updateSlotStatus = useCallback(async (slotId: string, status: boolean) => {
    const { error } = await supabase
      .from("slots")
      .update({ connection_status: status ? "active" : "inactive" })
      .eq("slot_id", slotId);
    if (error) throw error;
    setSlots(prev =>
      prev.map(s => s.slotId === slotId ? { ...s, connectionStatus: status ? "online" : "offline" } : s)
    );
  }, []);

  const updateTeacher = useCallback(async (slotId: string, teacherId: string, teacherName?: string) => {
    const { error } = await supabase.from("slots").update({ teacher_id: teacherId }).eq("slot_id", slotId);
    if (error) throw error;
    setSlots(prev =>
      prev.map(s => s.slotId === slotId ? { ...s, teacherId, teacherName } : s)
    );
  }, []);

  // เพิ่มช่องใหม่: ตารางจริง 'slots.capacity' เก็บเป็น mm (raw)
// ✅ ให้ตรงกับ CHECK ใน DB
type ConnectionStatus = 'active' | 'inactive';

const addSlot = useCallback(
  async (teacherId: string, on: boolean, capacityMm = 60) => {
    const { data, error } = await supabase
      .from('slots')
      .insert({
        teacher_id: teacherId.toUpperCase(),
        capacity_mm: Math.max(0, Math.floor(capacityMm)),   // ← เก็บ mm ลงช่องที่ถูกต้อง
        connection_status: on ? 'active' : 'inactive',      // ✅ map boolean -> string ที่ DB ยอมรับ
        
      })
      .select('slot_id,cupboard_id')
      .single();

    if (error) throw error;

    await refresh();
    return { slotId: data!.slot_id, cupboardId: data!.cupboard_id };
  },
  [refresh]
);


  const value: SlotContextType = { slots, loading, refresh, updateSlotStatus, updateTeacher, addSlot };
  return <SlotContext.Provider value={value}>{children}</SlotContext.Provider>;
};
