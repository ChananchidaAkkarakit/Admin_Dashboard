import { useEffect, useState } from "react";
import { ensureMqtt } from "../lib/mqtt";

export function useMqtt(topics: string[] = []) {
  const [status, setStatus] = useState<"idle"|"connecting"|"connected"|"error">("idle");

  useEffect(() => {
    setStatus("connecting");
    const c = ensureMqtt();

    const onConnect = () => {
      setStatus("connected");
      topics.forEach(t => c.subscribe(t, { qos: 1 }));
    };
    const onReconnect = () => setStatus("connecting");
    const onClose = () => setStatus("idle");
    const onError = () => setStatus("error");

    c.on("connect", onConnect);
    c.on("reconnect", onReconnect);
    c.on("close", onClose);
    c.on("error", onError);

    return () => {
      c.off("connect", onConnect);
      c.off("reconnect", onReconnect);
      c.off("close", onClose);
      c.off("error", onError);
      // อย่าปิด client ที่ share ใช้หลายหน้า
    };
  }, [topics.join("|")]);

  const publish = (topic: string, payload: any) => {
    const c = ensureMqtt();
    const body = typeof payload === "string" ? payload : JSON.stringify(payload);
    c.publish(topic, body, { qos: 1, retain: false });
  };

  const onMessage = (handler: (topic:string, payload:any)=>void) => {
    const c = ensureMqtt();
    const cb = (topic: string, buf: Uint8Array) => {
      const text = new TextDecoder().decode(buf);
      let data: any = text;
      try { data = JSON.parse(text); } catch {}
      handler(topic, data);
    };
    c.on("message", cb);
    return () => c.off("message", cb);
  };

  return { status, publish, onMessage };
}
