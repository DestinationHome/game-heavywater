import { log } from "@main";
import type { Context, Hono } from "hono";
import { getConnInfo } from "hono/bun";
import { getAllUsers, getUserData } from "../store";

const DEFAULT_ALLOW = "127.0.0.0/8,::1,172.16.0.0/12";

const ALLOW = (process.env.RCRALLY_INTERNAL_ALLOW || DEFAULT_ALLOW)
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

function ipv4ToInt(ip: string): number | null {
  const parts = ip.split(".");
  if (parts.length !== 4) return null;
  let n = 0;
  for (const part of parts) {
    const byte = Number(part);
    if (!Number.isInteger(byte) || byte < 0 || byte > 255) return null;
    n = (n << 8) | byte;
  }
  return n >>> 0;
}

export function isAllowedAddress(addr: string | null | undefined): boolean {
  if (!addr) return false;

  // A dual-stack socket reports an IPv4 peer as ::ffff:a.b.c.d
  const ip = addr.replace(/^::ffff:/i, "");
  const v4 = ipv4ToInt(ip);

  for (const entry of ALLOW) {
    const [net, bitsRaw] = entry.split("/");
    const netV4 = ipv4ToInt(net);

    if (netV4 !== null && v4 !== null) {
      const bits = bitsRaw === undefined ? 32 : Number(bitsRaw);
      if (!Number.isInteger(bits) || bits < 0 || bits > 32) continue;
      const mask = bits === 0 ? 0 : (0xffffffff << (32 - bits)) >>> 0;
      if ((v4 & mask) === (netV4 & mask)) return true;
      continue;
    }

    if (net.toLowerCase() === ip.toLowerCase()) return true;
  }

  return false;
}

/**
 * The socket peer, never X-Forwarded-For — that header is caller-supplied and
 * these routes share an app with the public www.services.heavyh2o.net handlers.
 * Returns null when there is no connection (e.g. app.fetch() in tests), which
 * denies rather than allows.
 */
function peerAddress(c: Context): string | null {
  try {
    return getConnInfo(c).remote.address ?? null;
  } catch {
    return null;
  }
}

function reject(c: Context) {
  const addr = peerAddress(c);
  if (isAllowedAddress(addr)) return undefined;

  log.warn(
    `[RCRALLY INTERNAL] denied ${c.req.method} ${c.req.path} from ${addr ?? "unknown"}`,
  );
  return c.json({ error: "forbidden" }, 403);
}

export function internalRoutes(app: Hono) {
  app.get("/internal/rcrally/users", async (c) => {
    const denied = reject(c);
    if (denied) return denied;

    const all = await getAllUsers();
    const users = Object.entries(all).map(([username, data]) => ({
      username,
      times: data.times,
    }));

    log.debug(`[RCRALLY INTERNAL] users list n=${users.length}`);
    return c.json({ users });
  });

  app.get("/internal/rcrally/users/:username", async (c) => {
    const denied = reject(c);
    if (denied) return denied;

    const username = c.req.param("username");
    const data = await getUserData(username);

    log.debug(`[RCRALLY INTERNAL] user=${username}`);
    return c.json({ username, ...data });
  });
}
