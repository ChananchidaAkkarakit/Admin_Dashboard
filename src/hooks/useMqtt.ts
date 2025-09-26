// src/hooks/useMqtt.ts
import { useEffect, useRef, useState } from "react";
import { ensureMqtt } from "../lib/mqtt";
import { dbi, dbw, dbe } from "../debug";

/** ---------- Topic builders (ให้ตรงกับ HW) ---------- */
export function makeStatusTopic(nodeId: string, slotId: string) {
  return `smartlocker/${nodeId}/slot_id/${slotId}/status`;
}
export function makeWarningTopic(nodeId: string, slotId: string) {
  return `smartlocker/${nodeId}/slot_id/${slotId}/warning`;
}
export function makeCommandTopic(
  nodeId: string,
  slotId: string,
  action: "door"
) {
  // เปิด/ปลดล๊อกประตูช่อง: command_open/door
  return `smartlocker/${nodeId}/slot_id/${slotId}/command_open/${action}`;
}

type MqttStatus = "idle" | "connecting" | "connected" | "error";

/** ---------- GLOBAL MESSAGE FAN-OUT ---------- */
type GlobalListener = (topic: string, payload: any, raw: Uint8Array) => void;
const listeners = new Set<GlobalListener>();
let boundGlobal = false;

// จำ payload ล่าสุดของแต่ละ "topicจริง" (ไม่ใช่ pattern)
const lastPayloadByTopic = new Map<string, { payload: any; raw: Uint8Array }>();

function safeParse(buf: Uint8Array) {
  try {
    const s = new TextDecoder().decode(buf);
    return s ? JSON.parse(s) : null;
  } catch {
    return null;
  }
}

/** MQTT wildcard matcher: supports + and # */
function matchesWildcard(pattern: string, topic: string): boolean {
  if (pattern === "#") return true;
  const p = pattern.split("/");
  const t = topic.split("/");

  for (let i = 0; i < p.length; i++) {
    const seg = p[i];
    if (seg === "#") return true; // match rest
    if (seg === "+") {
      if (t[i] == null) return false;
      continue;
    }
    if (t[i] !== seg) return false;
  }
  // extra segments on topic only valid if pattern ended with "#"
  return t.length === p.length;
}

function bindGlobalMessageHandler() {
  if (boundGlobal) return;
  const c = ensureMqtt();

  c.on("message", (topic: string, raw: Uint8Array) => {
    const parsed = safeParse(raw);
    lastPayloadByTopic.set(topic, { payload: parsed, raw });

    listeners.forEach((fn) => {
      try {
        fn(topic, parsed, raw);
      } catch (e) {
        console.error("[useMqtt listener error]", e);
      }
    });
  });

  boundGlobal = true;
}

/** ---------- HOOK ---------- */
export function useMqtt(topics: string[] = []) {
  const [status, setStatus] = useState<MqttStatus>("idle");

  // คิว publish ระหว่างยังไม่ต่อ
  const pendingQueueRef = useRef<Array<{ topic: string; body: string }>>([]);

  // เก็บ topics ล่าสุดของ hook นี้ (สำหรับกรองข้อความ/รีเพลย์)
  const topicsRef = useRef<string[]>([]);
  topicsRef.current = topics;

  useEffect(() => {
    setStatus("connecting");
    const c = ensureMqtt();

    const flushQueue = () => {
      const q = pendingQueueRef.current;
      if (!q.length) return;
      q.forEach(({ topic, body }) =>
        c.publish(topic, body, { qos: 1, retain: false })
      );
      pendingQueueRef.current = [];
    };

    const doSubscribe = () => {
      topicsRef.current.forEach((t) => t && c.subscribe(t, { qos: 1 }));
    };

    const onConnect = () => {
      dbi("mqtt/connect", "connected");
      doSubscribe();
      flushQueue();
    };
    const onError = () => dbe("mqtt/error", "client error");
    const onReconnect = () => setStatus("connecting");
    const onClose = () => setStatus("idle");


    c.on("connect", onConnect);
    c.on("reconnect", onReconnect);
    c.on("close", onClose);
    c.on("error", onError);

    bindGlobalMessageHandler();

    if ((c as any).connected) {
      setStatus("connected");
      doSubscribe();
      flushQueue();
    }

    return () => {
      c.off("connect", onConnect);
      c.off("reconnect", onReconnect);
      c.off("close", onClose);
      c.off("error", onError);
      // ไม่ unsubscribe เพื่อไม่กระทบหน้าที่ใช้อยู่
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topics.join("|")]);

  /** ลงทะเบียนผู้ฟัง แล้วกรองด้วย wildcard-aware matcher */
  function onMessage(
    cb: (topic: string, payload: any) => void,
    opts?: { replayLast?: boolean }
  ): () => void {
    const wrapper: GlobalListener = (topic, payload) => {
      // ถ้า topicsRef มี wildcard ให้ตรวจด้วย matchesWildcard
      const interested = topicsRef.current.some((pat) => {
        if (!pat) return false;
        if (pat.includes("+") || pat.includes("#")) {
          return matchesWildcard(pat, topic);
        }
        return pat === topic;
      });
      if (interested) cb(topic, payload);
    };

    listeners.add(wrapper);

    // รีเพลย์ payload ล่าสุดทันที (รองรับ wildcard)
    if (opts?.replayLast) {
      const replay = () => {
        const pats = topicsRef.current.filter(Boolean);
        if (!pats.length) return;
        // วนทุก topic ที่เคยรับ แล้ว callback เฉพาะที่ match
        for (const [t, cached] of lastPayloadByTopic.entries()) {
          if (pats.some((pat) => matchesWildcard(pat, t))) {
            cb(t, cached.payload);
          }
        }
      };
      if (typeof queueMicrotask === "function") {
        queueMicrotask(replay);
      } else {
        setTimeout(replay, 0);
      }
    }

    return () => {
      listeners.delete(wrapper);
    };
  }

  /** publish: ต่ออยู่ → ยิงเลย, ไม่ต่อ → เข้าคิว */
  const publish = (topic: string, payload: any) => {
    const c = ensureMqtt();
    const body =
      typeof payload === "string" ? payload : JSON.stringify(payload ?? {});
    if ((c as any).connected) {
      c.publish(topic, body, { qos: 1, retain: false });
    } else {
      pendingQueueRef.current.push({ topic, body });
    }
  };

  /** helper ส่ง unlock door */
  const publishUnlock = (
    nodeId: string,
    slotId: string,
    role: "admin" | "professor" | "student" = "admin"
  ) => {
    const topic = makeCommandTopic(nodeId, slotId, "door");
    publish(topic, { role });
  };

  return { status, publish, publishUnlock, onMessage };
}
