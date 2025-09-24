import { connect, MqttClient } from "mqtt";
import type { IClientOptions } from "mqtt";

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
  };

  client = connect(url, options);
  return client!;
}
