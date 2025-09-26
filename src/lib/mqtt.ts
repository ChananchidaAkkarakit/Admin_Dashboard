import mqtt from "mqtt";
import type { IClientOptions, MqttClient } from "mqtt";

let client: MqttClient | null = null;

export function ensureMqtt(): MqttClient {
  if (client) return client;

  const url = import.meta.env.VITE_MQTT_URL as string;
  const options: IClientOptions = {
    username: import.meta.env.VITE_MQTT_USERNAME,
    password: import.meta.env.VITE_MQTT_PASSWORD,
    clientId: `web-${crypto.randomUUID()}`,
    keepalive: 45,
    clean: true,
    reconnectPeriod: 2000,
    connectTimeout: 20_000,
    protocol: "wss",          // เน้นให้ชัด
    protocolVersion: 5,       // ถ้าไม่ได้ ลอง 4
    resubscribe: true,
  };

  console.info("[mqtt] url:", url, "user:", !!options.username);

  client = mqtt.connect(url, options);

  client.on("connect",    () => console.info("[mqtt] connect"));
  client.on("reconnect",  () => console.warn("[mqtt] reconnecting..."));
  client.on("close",      () => console.warn("[mqtt] close"));
  client.on("offline",    () => console.warn("[mqtt] offline"));
  client.on("end",        () => console.warn("[mqtt] end"));
  client.on("error",      (e) => console.error("[mqtt] error:", e?.message || e));

  return client!;
}
