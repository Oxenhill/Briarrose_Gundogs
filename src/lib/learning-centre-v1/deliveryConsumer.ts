import {
  validateBrandDeliveryEnvelope,
  type BrandDeliveryItem,
  type DestinationKey,
} from "./brandDeliveryV1";
import {
  deliveryCursorRevision,
  hasValidDeliveryChecksum,
} from "./deliveryIntegrity";

export interface DeliveryConsumerState {
  destination: DestinationKey;
  cursor: string | null;
  items: BrandDeliveryItem[];
  checkedAt: string | null;
}

export interface DeliveryDestinationPolicy {
  destination: DestinationKey;
  origin: string;
  /** Explicitly configured destination routes; never inferred from the content. */
  articlePathPrefix: string;
  canonicalOrigins: Record<DestinationKey, string>;
}

export function emptyDeliveryState(
  destination: DestinationKey,
): DeliveryConsumerState {
  return { destination, cursor: null, items: [], checkedAt: null };
}

function assertItemRoutes(
  item: BrandDeliveryItem,
  policy: DeliveryDestinationPolicy,
) {
  const route = new URL(item.route, policy.origin);
  const prefix = `${policy.articlePathPrefix}/`;
  if (
    item.kind !== "article" ||
    route.origin !== policy.origin ||
    route.pathname !== item.route ||
    route.search ||
    route.hash ||
    !item.route.startsWith(prefix) ||
    !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(item.route.slice(prefix.length))
  )
    throw new Error(
      "Delivery route is outside this destination's approved article surface.",
    );
  const canonical = new URL(item.canonical.url);
  if (
    canonical.username ||
    canonical.password ||
    canonical.search ||
    canonical.hash ||
    canonical.origin !==
      policy.canonicalOrigins[item.canonical.ownerDestination]
  )
    throw new Error("Delivery canonical origin does not match its owner.");
  if (item.mode === "canonical_full" && canonical.href !== route.href)
    throw new Error("Canonical delivery must use the rendered route.");
}

/** Validate a complete page before returning replacement state. The caller commits state
 * atomically; a bad item cannot partially update a destination or advance its cursor. */
export function applyDeliveryPage(
  state: DeliveryConsumerState,
  raw: unknown,
  policy: DeliveryDestinationPolicy,
): DeliveryConsumerState {
  const validation = validateBrandDeliveryEnvelope(raw);
  if (!validation.ok) throw new Error(validation.error);
  const page = validation.envelope;
  for (const origin of [
    policy.origin,
    ...Object.values(policy.canonicalOrigins),
  ]) {
    const parsed = new URL(origin);
    if (parsed.protocol !== "https:" || parsed.origin !== origin)
      throw new Error("Delivery policy requires exact HTTPS origins.");
  }
  if (
    state.destination !== policy.destination ||
    page.destination !== policy.destination
  )
    throw new Error("Delivery destination mismatch.");
  const previous = deliveryCursorRevision(state.cursor);
  const start = deliveryCursorRevision(page.cursor);
  const end = deliveryCursorRevision(page.nextCursor);
  const revisions = [...page.items, ...page.revocations].map(
    (item) => item.revision,
  );
  if (new Set(revisions).size !== revisions.length)
    throw new Error("Delivery revisions must be unique within a page.");
  if (revisions.some((revision) => revision <= start || revision > end))
    throw new Error("Delivery events are outside the cursor window.");
  if ((end > 0 && end <= start) || (end === 0 && revisions.length > 0))
    throw new Error("Delivery cursor did not advance.");
  if (revisions.length === 0 ? end !== 0 : end !== Math.max(...revisions))
    throw new Error("Delivery cursor must end at the last returned event.");
  for (const item of page.items) {
    if (!hasValidDeliveryChecksum(item))
      throw new Error("Delivery checksum mismatch.");
    assertItemRoutes(item, policy);
  }
  // Exact retries are safe, while stale or out-of-order pages must never revive a revocation.
  if (start !== previous) {
    if (end === previous && end > start) return state;
    throw new Error("Delivery page is out of order.");
  }
  const next = new Map(
    state.items.map((item) => [item.publicationRecordId, item]),
  );
  const events = [
    ...page.items.map((item) => ({ type: "publish" as const, item })),
    ...page.revocations.map((item) => ({ type: "revoke" as const, item })),
  ].sort((a, b) => a.item.revision - b.item.revision);
  for (const event of events) {
    if (event.type === "revoke") {
      const existing = next.get(event.item.publicationRecordId);
      if (
        existing &&
        (existing.contentId !== event.item.contentId ||
          existing.versionId !== event.item.versionId)
      )
        throw new Error(
          "Revocation does not match its exact published version.",
        );
      next.delete(event.item.publicationRecordId);
    } else {
      // A newer exact publication replaces the prior version of this content in this destination.
      for (const [id, existing] of next)
        if (existing.contentId === event.item.contentId) next.delete(id);
      next.set(event.item.publicationRecordId, event.item);
    }
  }
  const items = [...next.values()];
  if (new Set(items.map((item) => item.route)).size !== items.length)
    throw new Error("Two delivered items claim the same route.");
  return {
    destination: policy.destination,
    cursor: page.nextCursor ?? state.cursor,
    items,
    checkedAt: page.generatedAt,
  };
}

/** Destination-local failure isolation: callers keep their last valid state on error.
 * Partial pagination is never returned as a completed synchronization. */
export async function synchronizeDelivery(
  initial: DeliveryConsumerState,
  policy: DeliveryDestinationPolicy,
  fetchPage: (cursor: string | null) => Promise<unknown>,
  maxPages = 100,
): Promise<DeliveryConsumerState> {
  let state = initial;
  for (let index = 0; index < maxPages; index++) {
    const raw = await fetchPage(state.cursor);
    const priorCursor = state.cursor;
    state = applyDeliveryPage(state, raw, policy);
    if (state.cursor === priorCursor) return state;
  }
  throw new Error("Delivery page limit reached; no partial state was applied.");
}
