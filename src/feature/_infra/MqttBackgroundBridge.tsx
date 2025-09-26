// src/feature/_infra/MqttBackgroundBridge.tsx
import { useEffect, useRef } from "react";
import { useMqtt } from "../../hooks/useMqtt";
import { mqttStore } from "../../state/mqtt-store";
import { dbg } from "../../debug";

const WILDCARDS = [
    "smartlocker/+/slot_id/+/status",
    "smartlocker/+/slot_id/+/warning",
];

const PER_TOPIC_MIN_MS = 60; // กันสแปมต่อ topic (ms)

export default function MqttBackgroundBridge() {
    const { onMessage } = useMqtt(WILDCARDS);
    const lastEmitRef = useRef<Record<string, number>>({});

    useEffect(() => {
        const off = onMessage(
            (topic, payload) => {
                const now = Date.now();
                const last = lastEmitRef.current[topic] ?? 0;
                if (now - last < PER_TOPIC_MIN_MS) return;
                lastEmitRef.current[topic] = now;

                if (topic.endsWith("/status")) {
                    // --- normalize (เบา + ครอบคลุม) ---
                    const p: any = payload ?? {};

                    // ts → ms (รองรับวินาที/มิลลิวินาที/สตริง)
                    const tsNum = Number(p.ts);
                    const ts =
                        Number.isFinite(tsNum)
                            ? (tsNum < 1e12 ? tsNum * 1000 : tsNum) // ถ้าดูเหมือนวินาที ให้คูณ 1000
                            : Date.now();

                    // capacity_mm / capacity → capacity (number)
                    let capacity: number | undefined;
                    if (typeof p.capacity === "number") capacity = p.capacity;
                    else if (typeof p.capacity_mm === "number") capacity = p.capacity_mm;

                    // is_open → boolean
                    let is_open: boolean | undefined;
                    if (typeof p.is_open === "boolean") {
                        is_open = p.is_open;
                    } else if (typeof p.is_open === "number") {
                        is_open = p.is_open === 1;
                    } else if (typeof p.is_open === "string") {
                        const s = p.is_open.trim().toLowerCase();
                        if (["1", "true", "open", "opened", "unlock"].includes(s)) is_open = true;
                        else if (["0", "false", "closed", "close", "lock"].includes(s)) is_open = false;
                    }

                    // ฟิลด์ที่ใช้จริง
                    const v = {
                        node_id: p.cupboard_id ?? p.node_id ?? undefined,
                        slot_id: p.slot_id ?? undefined,
                        capacity,
                        is_open,
                        sensor_status: p.sensor_status ?? undefined,
                        wifi_status: p.wifi_status ?? undefined,
                        wifi_rssi: typeof p.wifi_rssi === "number" ? p.wifi_rssi : undefined,
                        ip_addr: p.ip_addr ?? undefined,
                        ts, // เก็บเป็น ms number
                    };

                    // --- upsert เฉพาะตอน "มีการเปลี่ยนจริง" ---
                    const prev = mqttStore.read(topic)?.payload ?? null;
                    const same =
                        !!prev &&
                        prev.capacity === v.capacity &&
                        prev.is_open === v.is_open &&
                        prev.sensor_status === v.sensor_status &&
                        prev.wifi_status === v.wifi_status &&
                        prev.wifi_rssi === v.wifi_rssi &&
                        prev.ip_addr === v.ip_addr &&
                        prev.node_id === v.node_id &&
                        prev.slot_id === v.slot_id;

                    if (!same) {
                        mqttStore.upsert(topic, v);
                    }
                }
                else {
                    mqttStore.upsert(topic, payload);
                }
            },
            { replayLast: true }
        );
        return off;
    }, [onMessage]);

    return null;
}
