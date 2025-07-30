// frontend/src/contexts/SlotContext.ts
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { Slot } from "../../../../../../backend/src/mock/types"; // ปรับ path ให้ตรงกับ frontend
import { fetchSlots } from "../../../../api/slots"; // ✅ ใช้ fetch จาก API

type SlotContextType = {
  slots: Slot[];
  updateSlotStatus: (slotId: string, status: boolean) => void;
  updateTeacher: (slotId: string, teacherId: string, teacherName?: string) => void;
};

const SlotContext = createContext<SlotContextType | undefined>(undefined);

export const SlotProvider = ({ children }: { children: ReactNode }) => {
  const [slots, setSlots] = useState<Slot[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchSlots();
        setSlots(data);
      } catch (error) {
        console.error("โหลด slot ไม่สำเร็จ", error);
      }
    };
    load();
  }, []);

  const updateSlotStatus = (slotId: string, status: boolean) => {
    setSlots(prev =>
      prev.map(slot =>
        slot.slotId === slotId
          ? { ...slot, connectionStatus: status ? "active" : "inactive" }
          : slot
      )
    );
  };

  const updateTeacher = (slotId: string, teacherId: string, teacherName?: string) => {
    setSlots(prev =>
      prev.map(slot =>
        slot.slotId === slotId
          ? { ...slot, teacherId, teacherName }
          : slot
      )
    );
  };

  return (
    <SlotContext.Provider value={{ slots, updateSlotStatus, updateTeacher }}>
      {children}
    </SlotContext.Provider>
  );
};

export const useSlotContext = () => {
  const ctx = useContext(SlotContext);
  if (!ctx) throw new Error("useSlotContext must be used within SlotProvider");
  return ctx;
};
