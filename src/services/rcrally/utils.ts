/** Normalize a value that may be a single item, an array, or nullish into an array. */
export function toArray<T>(v: T | T[] | undefined | null): T[] {
  if (v == null) return [];
  return Array.isArray(v) ? v : [v];
}

/** Coerce an unknown value to a finite number, defaulting to 0. */
export function num(v: unknown): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

/** Escape a value for safe inclusion in XML text/attributes. */
export function xmlEsc(s: unknown): string {
  const map: Record<string, string> = {
    "<": "&lt;",
    ">": "&gt;",
    "&": "&amp;",
    "'": "&apos;",
    '"': "&quot;",
  };
  return String(s ?? "").replace(/[<>&'"]/g, (c) => map[c]);
}
