// src/debug.ts
type Level = "debug" | "info" | "warn" | "error";

const isProd = import.meta.env?.MODE === "production" || process.env.NODE_ENV === "production";
const enabled = !isProd;

const lastAt: Record<string, number> = {};
const MAX_PER_KEY_MS = 300; // อย่างน้อย 300ms ต่อคีย์เดียวกัน

function shouldLog(key: string) {
  const now = Date.now();
  const last = lastAt[key] ?? 0;
  if (now - last < MAX_PER_KEY_MS) return false;
  lastAt[key] = now;
  return true;
}

function clampJSON(obj: any, maxLen = 300) {
  try {
    const s = JSON.stringify(obj);
    if (s.length <= maxLen) return s;
    return s.slice(0, maxLen) + `… (+${s.length - maxLen} chars)`;
  } catch {
    return String(obj);
  }
}

function out(level: Level, key: string, ...args: any[]) {
  if (!enabled) return;
  if (!shouldLog(key)) return;

  // ทำ lazy-format เฉพาะตอนจะพิมพ์จริง
  const fmt = args.map((a) => (typeof a === "object" ? clampJSON(a) : a));
  const tag = `[${key}]`;
  // ใช้ console ที่ตรงระดับ เพื่อให้ DevTools filter ได้
  if (level === "debug") console.debug(tag, ...fmt);
  else if (level === "info") console.info(tag, ...fmt);
  else if (level === "warn") console.warn(tag, ...fmt);
  else console.error(tag, ...fmt);
}

export const dbg = (key: string, ...args: any[]) => out("debug", key, ...args);
export const dbi = (key: string, ...args: any[]) => out("info", key, ...args);
export const dbw = (key: string, ...args: any[]) => out("warn", key, ...args);
export const dbe = (key: string, ...args: any[]) => out("error", key, ...args);
