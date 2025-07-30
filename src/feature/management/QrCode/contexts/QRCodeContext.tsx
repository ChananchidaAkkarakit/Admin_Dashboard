import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import type { EnrichedQRCodeSlot } from "../../../../../../backend/src/mock/types";

export type QRCodeSlot = EnrichedQRCodeSlot; // ✅ alias ให้ context ใช้ QRCodeSlot ที่ enriched



import { fetchQRCodes } from "../../../../api/qrcodes";

type QRCodeContextType = {
  slots: QRCodeSlot[];
  updateSlotStatus: (slotId: string, status: boolean) => void;
  updateTeacher: (slotId: string, teacherId: string, teacherName: string) => void;
};

const QRCodeContext = createContext<QRCodeContextType | undefined>(undefined);

export const QRCodeProvider = ({ children }: { children: ReactNode }) => {
 const [slots, setSlots] = useState<QRCodeSlot[]>([]);


  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchQRCodes();
        setSlots(data);
      } catch (err) {
        console.error("Failed to fetch QRCode data", err);
      }
    };

    load();
  }, []);

  const updateTeacher = (slotId: string, teacherId: string, teacherName: string) => {
    setSlots(prev =>
      prev.map(slot =>
        slot.slotId === slotId ? { ...slot, teacherId, teacherName } : slot
      )
    );
  };

  const updateSlotStatus = (slotId: string, status: boolean) => {
    setSlots(prev =>
      prev.map(slot =>
        slot.slotId === slotId
          ? { ...slot, connectionStatus: status ? "active" : "inactive" }
          : slot
      )
    );
  };

  return (
    <QRCodeContext.Provider value={{ slots, updateSlotStatus, updateTeacher }}>
      {children}
    </QRCodeContext.Provider>
  );
};

export const useQRCodeContext = () => {
  const context = useContext(QRCodeContext);
  if (!context) throw new Error("useQRCodeContext must be used within QRCodeProvider");
  return context;
};
