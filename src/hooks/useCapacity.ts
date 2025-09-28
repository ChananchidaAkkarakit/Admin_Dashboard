import { useMemo } from "react";
import { getCapacityPercent, formatCapacityText } from "../utils/metrics";

export function useCapacity(input: {
  capacity_percent?: number | null;
  capacity_mm?: number | null;
  capacity?: number | null;
}) {
  const percent = useMemo(() => getCapacityPercent(input), [input.capacity_percent, input.capacity_mm, input.capacity]);
  const text = useMemo(() => formatCapacityText(percent), [percent]);
  return { percent, text };
}
