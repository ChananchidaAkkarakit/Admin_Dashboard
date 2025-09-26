// src/state/mqtt-store.ts
import { useSyncExternalStore, useRef } from "react";

type TopicData = { payload: any; ts: number };
const topicMap = new Map<string, TopicData>();
const subs = new Set<() => void>();
const emit = () => subs.forEach((fn) => fn());

export const mqttStore = {
  getSnapshot() {
    const out: Record<string, TopicData> = {};
    topicMap.forEach((v, k) => (out[k] = v));
    return out;
  },
  subscribe(cb: () => void) {
    subs.add(cb);
    return () => subs.delete(cb);
  },
  upsert(topic: string, payload: any) {
    topicMap.set(topic, { payload, ts: Date.now() });
    emit();
  },
  read(topic: string) {
    return topicMap.get(topic) ?? null;
  },
};

export function useTopic(topic?: string | null) {
  const t = topic ?? "";
  const get = () => (t ? mqttStore.read(t) : null);
  return useSyncExternalStore(mqttStore.subscribe, get, get);
}

export function useTopics(topics: string[]) {
  const topicsRef = useRef(topics);
  topicsRef.current = topics;
  const get = () =>
    topicsRef.current.map((t) => [t, mqttStore.read(t)] as const);
  return useSyncExternalStore(mqttStore.subscribe, get, get);
}
