import { createHash } from "node:crypto";
import type { BrandDeliveryItem } from "./brandDeliveryV1";

/** Delivery v1 hash input: sorted object keys, unchanged array order, UTF-8 JSON.
 * Contract keys are ASCII; values are never normalised or rewritten. */
export function canonicalDeliveryJson(value: unknown): string {
  if (Array.isArray(value))
    return `[${value.map(canonicalDeliveryJson).join(",")}]`;
  if (value !== null && typeof value === "object") {
    const record = value as Record<string, unknown>;
    return `{${Object.keys(record)
      .sort()
      .map(
        (key) => `${JSON.stringify(key)}:${canonicalDeliveryJson(record[key])}`,
      )
      .join(",")}}`;
  }
  if (
    value === undefined ||
    (typeof value === "number" && !Number.isFinite(value))
  )
    throw new Error("Delivery checksum input is not JSON.");
  return JSON.stringify(value);
}

export function deliveryChecksum(
  item: Omit<BrandDeliveryItem, "checksumSha256">,
) {
  return createHash("sha256")
    .update(canonicalDeliveryJson(item), "utf8")
    .digest("hex");
}

export function hasValidDeliveryChecksum(item: BrandDeliveryItem) {
  const { checksumSha256, ...payload } = item;
  return deliveryChecksum(payload) === checksumSha256;
}

export function deliveryCursorRevision(cursor: string | null): number {
  if (cursor === null) return 0;
  if (!/^revision:[1-9]\d*$/.test(cursor))
    throw new Error("Invalid delivery cursor.");
  const revision = Number(cursor.slice("revision:".length));
  if (!Number.isSafeInteger(revision))
    throw new Error("Invalid delivery cursor.");
  return revision;
}
