export type Slot = {
  slotId: string;
  cupboardId: string;
  teacherId: string;
  capacity?: number;
  connectionStatus: "active" | "inactive";
};
