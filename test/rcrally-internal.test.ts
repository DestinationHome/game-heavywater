import { describe, expect, it } from "bun:test";
import app from "../src/index";
import { isAllowedAddress } from "../src/services/rcrally/routes/internal";

describe("RC Rally internal read API", () => {
  it("denies a request with no connection info", async () => {
    const res = await app.fetch(
      new Request("http://localhost/internal/rcrally/users"),
    );
    expect(res.status).toBe(403);
  });

  it("ignores X-Forwarded-For", async () => {
    const res = await app.fetch(
      new Request("http://localhost/internal/rcrally/users", {
        headers: { "X-Forwarded-For": "172.17.0.5" },
      }),
    );
    expect(res.status).toBe(403);
  });

  it("allows Docker bridge and loopback addresses", () => {
    expect(isAllowedAddress("172.17.0.5")).toBe(true);
    expect(isAllowedAddress("172.18.0.2")).toBe(true);
    expect(isAllowedAddress("172.31.255.254")).toBe(true);
    expect(isAllowedAddress("127.0.0.1")).toBe(true);
    expect(isAllowedAddress("::ffff:127.0.0.1")).toBe(true);
    expect(isAllowedAddress("::1")).toBe(true);
  });

  it("denies everything outside the allowed ranges", () => {
    expect(isAllowedAddress("172.15.0.1")).toBe(false);
    expect(isAllowedAddress("172.32.0.1")).toBe(false);
    expect(isAllowedAddress("8.8.8.8")).toBe(false);
    expect(isAllowedAddress("192.168.1.10")).toBe(false);
    expect(isAllowedAddress("10.0.0.1")).toBe(false);
    expect(isAllowedAddress("")).toBe(false);
    expect(isAllowedAddress(null)).toBe(false);
    expect(isAllowedAddress(undefined)).toBe(false);
    expect(isAllowedAddress("not-an-ip")).toBe(false);
  });
});
