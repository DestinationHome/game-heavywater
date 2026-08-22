export interface ParsedTicket {
  version: number;
  serial: string;
  issuerId: number;
  issuedAt: bigint;
  expiresAt: bigint;
  accountId: bigint;
  username: string;
  region: string;
  domain: string;
  serviceId: string;
}

function decodeString(buf: Buffer, start: number, end: number): string {
  if (start >= buf.length) return "";
  const slice = buf.subarray(start, Math.min(end, buf.length));
  const nullIdx = slice.indexOf(0);
  const validSlice = nullIdx !== -1 ? slice.subarray(0, nullIdx) : slice;
  return validSlice.toString("utf8").trim();
}

/**
 * Parses a PlayStation Network (NP) ticket binary buffer according to the Sony NP ticket layout.
 * Reference: npticket-rs (Destination Home)
 */
export function parseNpTicket(data: Buffer | Uint8Array): ParsedTicket | null {
  const buf = Buffer.isBuffer(data) ? data : Buffer.from(data);

  if (buf.length < 212) {
    return null;
  }

  const version = buf.readUInt16BE(0);

  // V2 (0x2100), V2.1 (0x2101), V3 (0x3100)
  if (version === 0x2100 || version === 0x2101 || version === 0x3100) {
    return {
      version,
      serial: decodeString(buf, 0x10, 0x24),
      issuerId: buf.readUInt32BE(0x28),
      issuedAt: buf.readBigUInt64BE(0x30),
      expiresAt: buf.readBigUInt64BE(0x3c),
      accountId: buf.readBigUInt64BE(0x48),
      username: decodeString(buf, 0x54, 0x74),
      region: decodeString(buf, 0x78, 0x7a) || "br",
      domain: decodeString(buf, 0x80, 0x82) || "un",
      serviceId: decodeString(buf, 0x88, 0x9b),
    };
  }

  // V4 (0x4100)
  if (version === 0x4100) {
    return {
      version,
      serial: decodeString(buf, 0x14, 0x28),
      issuerId: buf.readUInt32BE(0x2c),
      issuedAt: buf.readBigUInt64BE(0x34),
      expiresAt: buf.readBigUInt64BE(0x40),
      accountId: buf.readBigUInt64BE(0x4c),
      username: decodeString(buf, 0x58, 0x78),
      region: decodeString(buf, 0x7c, 0x7e) || "br",
      domain: decodeString(buf, 0x84, 0x86) || "un",
      serviceId: decodeString(buf, 0x8c, 0x9f),
    };
  }

  return null;
}
