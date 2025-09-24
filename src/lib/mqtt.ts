// src/lib/mqtt.ts
import mqtt from "mqtt";                          // ⬅️ ใช้ default import
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
    protocolVersion: 5,
    properties: {
      requestResponseInformation: true,
      requestProblemInformation: true,
    },
  };

  client = mqtt.connect(url, options);            // ⬅️ เรียกผ่าน default import
  return client!;
}
