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
  const s = new TextDecoder().decode(buf);
  if (s === "") return null;

  // ลอง parse JSON ก่อน
  try {
    return JSON.parse(s);
  } catch {
    // Fallback: ถ้าเป็นตัวเลข (รวมกรณี "25,7" → "25.7")
    const normalized = s.replace(",", ".");
    const n = Number(normalized);
    if (!Number.isNaN(n)) return n;

    // สุดท้าย: ส่งเป็น string ดิบ
    return s;
  }
}


/** MQTT wildcard matcher: supports + and # */
function matchesWildcard(pattern: string, topic: string): boolean {
  if (pattern === "#") return true;
  const p = pattern.split("/");
  const t = topic.split("/");

  for (let i = 0; i < p.length; i++) {
    const seg = p[i];
    if (seg === "#") {
      // '#' ต้องเป็นตัวสุดท้ายใน pattern
      return i === p.length - 1;
    }
    if (seg === "+") {
      if (t[i] == null) return false;
      continue;
    }
    if (t[i] !== seg) return false;
  }
  return t.length === p.length;
}

function bindGlobalMessageHandler() {
  if (boundGlobal) return;
  const c = ensureMqtt();

  c.on("message", (topic: string, raw: Uint8Array, packet?: any) => {
    const parsed = safeParse(raw);
    lastPayloadByTopic.set(topic, { payload: parsed, raw });

    // ลอง debug retained/QoS (ถ้าต้องการ)
    if (packet) {
      dbi("mqtt/msg", { topic, retain: packet.retain, qos: packet.qos, payload: parsed });
    }

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


type UseMqttOptions = {
  /** ถ้าเปิดไว้: จะไม่รีเลย์ retained message เป็นครั้งแรก (ต่อ topic) */
  ignoreFirstRetained?: boolean;
  /** ฟังก์ชันดึงค่าเริ่มต้นจาก DB (เช่น /api/lasts) แล้ว seed เข้า cache */
  seedFromDb?: () => Promise<Record<string, any>>; // map: topic -> payload
};

const deliveredFirstRetained = new Set<string>(); // จำว่าส่ง retained ครั้งแรกไปแล้ว

export function useMqtt(topics: string[] = [], opts?: UseMqttOptions) {

  const [status, setStatus] = useState<MqttStatus>("idle");

  // คิว publish ระหว่างยังไม่ต่อ
  const pendingQueueRef = useRef<Array<{ topic: string; body: string }>>([]);

  // เก็บ topics ล่าสุดของ hook นี้ (สำหรับกรองข้อความ/รีเพลย์)
  const topicsRef = useRef<string[]>([]);
  topicsRef.current = topics;


  useEffect(() => {
    setStatus("connecting");
    const c = ensureMqtt();

    // ถ้ามีการ seed จาก DB ให้ทำครั้งเดียวตอนเชื่อมต่อ (หรือทันที)
    const seed = async () => {
      if (!opts?.seedFromDb) return;
      try {
        const map = await opts.seedFromDb();
        Object.entries(map).forEach(([t, payload]) => {
          lastPayloadByTopic.set(t, { payload, raw: new Uint8Array() });
          // ส่งให้ผู้ฟังเหมือน message ปกติ
          listeners.forEach((fn) => {
            try { fn(t, payload, new Uint8Array()); } catch { }
          });
        });
        dbi("mqtt/seedFromDb", Object.keys(map).length);
      } catch (e) {
        dbe("mqtt/seedFromDb/error", String(e));
      }
    };


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

    const onConnect = async () => {
      setStatus("connected");
      dbi("mqtt/connect", "connected");
      doSubscribe();
      flushQueue();
      await seed();
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
    };
  }, [topics.join("|")]);

  /** ลงทะเบียนผู้ฟัง แล้วกรองด้วย wildcard-aware matcher */
  function onMessage(
    cb: (topic: string, payload: any, meta?: { retained?: boolean }) => void,
    opt?: { replayLast?: boolean }
  ): () => void {
    const wrapper: GlobalListener = (topic, payload, raw) => {
      const interested = topicsRef.current.some((pat) => {
        if (!pat) return false;
        if (pat.includes("+") || pat.includes("#")) {
          return matchesWildcard(pat, topic);
        }
        return pat === topic;
      });
      if (!interested) return;

      // ถ้ามีการ ignore retained ครั้งแรก
      const pkt: any = (raw as any)?.packet; // ถ้าคุณสามารถแนบ packet เข้า raw ได้จาก ensureMqtt
      const retained = pkt?.retain === true;

      if (retained && opts?.ignoreFirstRetained && !deliveredFirstRetained.has(topic)) {
        deliveredFirstRetained.add(topic);
        // ข้าม retained ครั้งแรก
        return;
      }
      cb(topic, payload, { retained });
    };

    listeners.add(wrapper);

    // รีเพลย์ล่าสุด (จาก cache + seed DB ถ้าทำแล้ว)
    if (opt?.replayLast) {
      const replay = () => {
        const pats = topicsRef.current.filter(Boolean);
        if (!pats.length) return;
        for (const [t, cached] of lastPayloadByTopic.entries()) {
          if (pats.some((pat) => matchesWildcard(pat, t))) {
            cb(t, cached.payload);
          }
        }
      };
      typeof queueMicrotask === "function" ? queueMicrotask(replay) : setTimeout(replay, 0);
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
