export type QRCodeSlot = {
  slotId: string;
  cupboardId: string | null;
  capacity: number | null;
  connectionStatus: 'active' | 'inactive' | 'offline' | null;
  qrId: string | null;
  teacherId: string | null;
  teacherName: string | null;
};
