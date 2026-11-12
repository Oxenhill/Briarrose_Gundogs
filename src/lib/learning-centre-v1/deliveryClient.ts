import {
  emptyDeliveryState,
  synchronizeDelivery,
  type DeliveryConsumerState,
  type DeliveryDestinationPolicy,
} from "./deliveryConsumer";

export type DestinationRead = {
  state: DeliveryConsumerState;
  status: "fresh" | "stale" | "unavailable";
};
/** Instantiate only in a destination's server module. The token never belongs in browser code. */
export function createDestinationReader(config: {
  policy: DeliveryDestinationPolicy;
  token: string;
  fetch?: typeof fetch;
  now?: () => number;
  refreshMs?: number;
  maxStaleMs?: number;
}) {
  const fetcher = config.fetch ?? fetch;
  const now = config.now ?? Date.now;
  const refreshMs = config.refreshMs ?? 60_000;
  const maxStaleMs = config.maxStaleMs ?? 300_000;
  let current = emptyDeliveryState(config.policy.destination);
  let verifiedAt: number | null = null;
  let pending: Promise<DestinationRead> | null = null;
  async function refresh(): Promise<DestinationRead> {
    try {
      if (config.token.length < 32)
        throw new Error("Destination is not configured");
      const next = await synchronizeDelivery(
        current,
        config.policy,
        async (cursor) => {
          const url = new URL(
            `/api/delivery/v1/${config.policy.destination}`,
            "https://learn.dogsmarttrainingbehaviour.co.uk",
          );
          if (cursor) url.searchParams.set("cursor", cursor);
          const response = await fetcher(url, {
            headers: { Authorization: `Bearer ${config.token}` },
            cache: "no-store",
            redirect: "error",
            signal: AbortSignal.timeout(5000),
          });
          if (
            !response.ok ||
            !response.headers.get("content-type")?.includes("application/json")
          )
            throw new Error("Destination delivery unavailable");
          // Bound untrusted response size before parsing, including chunked responses.
          const reader = response.body?.getReader();
          if (!reader) throw new Error("Empty delivery response");
          const chunks: Uint8Array[] = [];
          let length = 0;
          try {
            while (true) {
              const chunk = await reader.read();
              if (chunk.done) break;
              length += chunk.value.byteLength;
              if (length > 8 * 1024 * 1024) {
                await reader.cancel();
                throw new Error("Delivery response is too large");
              }
              chunks.push(chunk.value);
            }
          } finally {
            reader.releaseLock();
          }
          return JSON.parse(Buffer.concat(chunks).toString("utf8")) as unknown;
        },
      );
      current = next;
      verifiedAt = now();
      return { state: current, status: "fresh" };
    } catch {
      // Keep a short-lived last verified copy; an outage must not preserve a withdrawn page indefinitely.
      if (verifiedAt !== null && now() - verifiedAt <= maxStaleMs)
        return { state: current, status: "stale" };
      return {
        state: emptyDeliveryState(config.policy.destination),
        status: "unavailable",
      };
    }
  }
  return async function read(): Promise<DestinationRead> {
    if (verifiedAt !== null && now() - verifiedAt < refreshMs)
      return { state: current, status: "fresh" };
    if (!pending)
      pending = refresh().finally(() => {
        pending = null;
      });
    return pending;
  };
}
