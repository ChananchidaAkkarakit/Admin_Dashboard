// src/feature/management/Cupboard/contexts/SlotContext.tsx
import { createContext, useContext, useEffect, useState, useCallback } from "react";
import type { ReactNode } from "react";
import { supabase } from "../../../../supabaseClient";

/** ---------- Types ---------- */
export type Slot = {
  slotId: string;
  cupboardId: string;
  teacherId: string | null;
  capacity: number | null;
  connectionStatus: "active" | "inactive";
  teacherName?: string | null;
};

// ✅ เปลี่ยน type ให้รองรับ capacity (optional)
export type SlotContextType = {
  slots: Slot[];
  loading: boolean;
  refresh: () => Promise<void>;
  updateSlotStatus: (slotId: string, status: boolean) => Promise<void>;
  updateTeacher: (slotId: string, teacherId: string, teacherName?: string) => Promise<void>;
  addSlot: (teacherId: string, on: boolean, capacity?: number) => Promise<{ slotId: string; cupboardId: string }>;
};


const SlotContext = createContext<SlotContextType | undefined>(undefined);

export const useSlotContext = () => {
  const ctx = useContext(SlotContext);
  if (!ctx) throw new Error("useSlotContext must be used within SlotProvider");
  return ctx;
};

function mapRow(r: any): Slot {
  return {
    slotId: r.slot_id,
    cupboardId: r.cupboard_id,
    teacherId: r.teacher_id,
    capacity: r.capacity ?? null,
    connectionStatus: r.connection_status,
  };
}

export const SlotProvider = ({ children }: { children: ReactNode }) => {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("v_slots_ordered")
      .select("slot_id, cupboard_id, teacher_id, capacity, connection_status, slot_no, cupboard_no")
      .order("cupboard_no")
      .order("slot_no");


    if (error) {
      console.error("❌ fetch slots:", error);
      setSlots([]);
    } else {
      setSlots((data ?? []).map(mapRow));
    }
    setLoading(false);
  }, []);

  useEffect(() => { void refresh(); }, [refresh]);

  // 👇 วาง realtime useEffect ตรงนี้
  useEffect(() => {
    const ch = supabase
      .channel("slots-rt")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "slots" }, refresh)
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "slots" }, refresh)
      .on("postgres_changes", { event: "DELETE", schema: "public", table: "slots" }, refresh)
      .subscribe();

    // ✅ คืนค่าเป็น () => void
    return () => { void supabase.removeChannel(ch); };
  }, [refresh]);


  const updateSlotStatus = useCallback(async (slotId: string, status: boolean) => {
    const { error } = await supabase
      .from("slots")
      .update({ connection_status: status ? "active" : "inactive" })
      .eq("slot_id", slotId);
    if (error) throw error;
    setSlots(prev => prev.map(s => s.slotId === slotId ? { ...s, connectionStatus: status ? "active" : "inactive" } : s));
  }, []);

  const updateTeacher = useCallback(async (slotId: string, teacherId: string, teacherName?: string) => {
    const { error } = await supabase.from("slots").update({ teacher_id: teacherId }).eq("slot_id", slotId);
    if (error) throw error;
    setSlots(prev => prev.map(s => s.slotId === slotId ? { ...s, teacherId, teacherName } : s));
  }, []);

  // ✅ เปลี่ยน implementation ให้รับ 3 พารามิเตอร์ และ insert capacity เข้าไป
  const addSlot = useCallback(
    async (teacherId: string, on: boolean, capacity = 60) => {
      const { data, error } = await supabase
        .from("slots")
        .insert({
          teacher_id: teacherId.toUpperCase(),
          capacity,
          connection_status: on ? "active" : "inactive",
        })
        .select("slot_id, cupboard_id")
        .single();

      if (error) throw error;

      await refresh(); // ถ้าใช้ realtime อยู่แล้วจะเอาออกก็ได้
      return { slotId: data!.slot_id, cupboardId: data!.cupboard_id };
    },
    [refresh]
  );

  const value: SlotContextType = { slots, loading, refresh, updateSlotStatus, updateTeacher, addSlot };
  return <SlotContext.Provider value={value}>{children}</SlotContext.Provider>;
};
