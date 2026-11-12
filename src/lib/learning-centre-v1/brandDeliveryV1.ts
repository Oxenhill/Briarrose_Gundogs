import brandDeliveryJsonSchema from "./brandDeliveryV1.schema.json";

/**
 * Versioned, read-only consumer boundary for approved Learning Centre content.
 *
 * This module deliberately describes delivery output, not database storage or
 * publication commands. Destination sites may render an exact human-published
 * version, but this contract gives them no route back into Studio and exposes
 * no drafts, AI jobs, review payloads, private sources or staff-only notes.
 * See docs/brand-delivery-architecture.md and ADR-049.
 */

export const BRAND_DELIVERY_SCHEMA_VERSION = "learning-centre.delivery.v1";
export const BRAND_DELIVERY_JSON_SCHEMA = brandDeliveryJsonSchema;

export const BRAND_KEYS = ["dog_smart", "briarrose_gundogs"] as const;
export type BrandKey = (typeof BRAND_KEYS)[number];

export const DESTINATION_KEYS = [
  "learning_centre",
  "dog_smart_site",
  "briarrose_site",
] as const;
export type DestinationKey = (typeof DESTINATION_KEYS)[number];

export const DELIVERY_MODES = [
  "canonical_full",
  "syndicated_full",
  "summary_link",
] as const;
export type DeliveryMode = (typeof DELIVERY_MODES)[number];

export const CONTENT_KINDS = ["article", "knowledge"] as const;
export type DeliveryContentKind = (typeof CONTENT_KINDS)[number];

export interface DeliveryTopic {
  slug: string;
  label: string;
}

export interface DeliveryCitation {
  citationId: string;
  label: string;
  url: string | null;
  evidenceType: string | null;
}

export interface DeliveryAuthor {
  profileId: string;
  displayName: string;
  role: string | null;
  profileUrl: string | null;
}

export interface BrandPresentation {
  primaryBrand: BrandKey;
  eligibleBrands: BrandKey[];
  destinationBrand: BrandKey | null;
  author: DeliveryAuthor;
  cta: { label: string; href: string } | null;
}

export interface CanonicalOwnership {
  ownerDestination: DestinationKey;
  url: string;
}

export interface BrandDeliveryItem {
  kind: DeliveryContentKind;
  contentId: string;
  versionId: string;
  publicationRecordId: string;
  revision: number;
  publishedAt: string;
  mode: DeliveryMode;
  route: string;
  canonical: CanonicalOwnership;
  presentation: BrandPresentation;
  title: string;
  summary: string;
  bodyMarkdown: string | null;
  seo: {
    title: string;
    description: string;
    imageUrl: string | null;
  };
  topics: DeliveryTopic[];
  citations: DeliveryCitation[];
  checksumSha256: string;
}

export interface BrandDeliveryRevocation {
  contentId: string;
  versionId: string;
  publicationRecordId: string;
  destination: DestinationKey;
  revokedAt: string;
  revision: number;
}

export interface BrandDeliveryEnvelope {
  schemaVersion: typeof BRAND_DELIVERY_SCHEMA_VERSION;
  generatedAt: string;
  destination: DestinationKey;
  cursor: string | null;
  nextCursor: string | null;
  items: BrandDeliveryItem[];
  revocations: BrandDeliveryRevocation[];
}

export type BrandDeliveryValidation =
  | { ok: true; envelope: BrandDeliveryEnvelope }
  | { ok: false; error: string };

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const SHA256_PATTERN = /^[0-9a-f]{64}$/i;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function hasExactKeys(
  value: Record<string, unknown>,
  expected: readonly string[],
): boolean {
  const actual = Object.keys(value);
  return (
    actual.length === expected.length &&
    actual.every((key) => expected.includes(key))
  );
}

function isIsoInstant(value: unknown): value is string {
  return (
    typeof value === "string" &&
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?Z$/.test(value) &&
    !Number.isNaN(Date.parse(value))
  );
}

function isHttpsUrl(value: unknown): value is string {
  if (typeof value !== "string") return false;
  try {
    const parsed = new URL(value);
    return parsed.protocol === "https:";
  } catch {
    return false;
  }
}

function isOneOf<T extends readonly string[]>(
  value: unknown,
  choices: T,
): value is T[number] {
  return typeof value === "string" && choices.includes(value);
}

function validateAuthor(value: unknown, label: string): string | null {
  if (!isRecord(value)) return `${label} must be an object.`;
  if (!hasExactKeys(value, ["profileId", "displayName", "role", "profileUrl"]))
    return `${label} has missing or unknown fields.`;
  if (!isNonEmptyString(value.profileId))
    return `${label}.profileId is required.`;
  if (!isNonEmptyString(value.displayName))
    return `${label}.displayName is required.`;
  if (value.role !== null && typeof value.role !== "string")
    return `${label}.role must be a string or null.`;
  if (value.profileUrl !== null && !isHttpsUrl(value.profileUrl))
    return `${label}.profileUrl must be an HTTPS URL or null.`;
  return null;
}

function validatePresentation(
  value: unknown,
  destination: DestinationKey,
  label: string,
): string | null {
  if (!isRecord(value)) return `${label} must be an object.`;
  if (
    !hasExactKeys(value, [
      "primaryBrand",
      "eligibleBrands",
      "destinationBrand",
      "author",
      "cta",
    ])
  )
    return `${label} has missing or unknown fields.`;
  if (!isOneOf(value.primaryBrand, BRAND_KEYS))
    return `${label}.primaryBrand is invalid.`;
  if (
    !Array.isArray(value.eligibleBrands) ||
    value.eligibleBrands.length === 0 ||
    value.eligibleBrands.some((brand) => !isOneOf(brand, BRAND_KEYS))
  )
    return `${label}.eligibleBrands must contain known brands.`;
  if (!value.eligibleBrands.includes(value.primaryBrand))
    return `${label}.eligibleBrands must include primaryBrand.`;
  if (
    value.destinationBrand !== null &&
    !isOneOf(value.destinationBrand, BRAND_KEYS)
  )
    return `${label}.destinationBrand is invalid.`;

  const requiredDestinationBrand =
    destination === "dog_smart_site"
      ? "dog_smart"
      : destination === "briarrose_site"
        ? "briarrose_gundogs"
        : null;
  if (value.destinationBrand !== requiredDestinationBrand)
    return `${label}.destinationBrand does not match the requested destination.`;
  if (
    requiredDestinationBrand !== null &&
    !value.eligibleBrands.includes(requiredDestinationBrand)
  )
    return `${label} is not eligible for the requested destination brand.`;

  const authorError = validateAuthor(value.author, `${label}.author`);
  if (authorError) return authorError;
  if (value.cta !== null) {
    if (!isRecord(value.cta)) return `${label}.cta must be an object or null.`;
    if (!hasExactKeys(value.cta, ["label", "href"]))
      return `${label}.cta has missing or unknown fields.`;
    if (!isNonEmptyString(value.cta.label))
      return `${label}.cta.label is required.`;
    if (!isHttpsUrl(value.cta.href))
      return `${label}.cta.href must be an HTTPS URL.`;
  }
  return null;
}

function validateItem(
  value: unknown,
  destination: DestinationKey,
  index: number,
): string | null {
  const label = `items[${index}]`;
  if (!isRecord(value)) return `${label} must be an object.`;
  if (
    !hasExactKeys(value, [
      "kind",
      "contentId",
      "versionId",
      "publicationRecordId",
      "revision",
      "publishedAt",
      "mode",
      "route",
      "canonical",
      "presentation",
      "title",
      "summary",
      "bodyMarkdown",
      "seo",
      "topics",
      "citations",
      "checksumSha256",
    ])
  )
    return `${label} has missing or unknown fields.`;
  if (!isOneOf(value.kind, CONTENT_KINDS)) return `${label}.kind is invalid.`;
  for (const field of [
    "contentId",
    "versionId",
    "publicationRecordId",
  ] as const)
    if (typeof value[field] !== "string" || !UUID_PATTERN.test(value[field]))
      return `${label}.${field} must be a UUID.`;
  if (!Number.isSafeInteger(value.revision) || Number(value.revision) < 1)
    return `${label}.revision must be a positive integer.`;
  if (!isIsoInstant(value.publishedAt))
    return `${label}.publishedAt must be an ISO UTC instant.`;
  if (!isOneOf(value.mode, DELIVERY_MODES)) return `${label}.mode is invalid.`;
  if (!isNonEmptyString(value.route) || !/^\/(?!\/)/.test(value.route))
    return `${label}.route must be an absolute path.`;
  if (!isRecord(value.canonical))
    return `${label}.canonical must be an object.`;
  if (!hasExactKeys(value.canonical, ["ownerDestination", "url"]))
    return `${label}.canonical has missing or unknown fields.`;
  if (!isOneOf(value.canonical.ownerDestination, DESTINATION_KEYS))
    return `${label}.canonical.ownerDestination is invalid.`;
  if (!isHttpsUrl(value.canonical.url))
    return `${label}.canonical.url must be an HTTPS URL.`;

  if (
    value.mode === "canonical_full" &&
    value.canonical.ownerDestination !== destination
  )
    return `${label} canonical_full content must be delivered by its canonical owner.`;
  if (
    value.mode === "syndicated_full" &&
    value.canonical.ownerDestination === destination
  )
    return `${label} syndicated_full content must point to another canonical owner.`;
  if (
    (value.mode === "canonical_full" || value.mode === "syndicated_full") &&
    !isNonEmptyString(value.bodyMarkdown)
  )
    return `${label}.bodyMarkdown is required for full delivery.`;
  if (value.mode === "summary_link" && value.bodyMarkdown !== null)
    return `${label}.bodyMarkdown must be null for summary_link delivery.`;

  const presentationError = validatePresentation(
    value.presentation,
    destination,
    `${label}.presentation`,
  );
  if (presentationError) return presentationError;
  if (!isNonEmptyString(value.title)) return `${label}.title is required.`;
  if (!isNonEmptyString(value.summary)) return `${label}.summary is required.`;
  if (!isRecord(value.seo)) return `${label}.seo must be an object.`;
  if (!hasExactKeys(value.seo, ["title", "description", "imageUrl"]))
    return `${label}.seo has missing or unknown fields.`;
  if (!isNonEmptyString(value.seo.title))
    return `${label}.seo.title is required.`;
  if (!isNonEmptyString(value.seo.description))
    return `${label}.seo.description is required.`;
  if (value.seo.imageUrl !== null && !isHttpsUrl(value.seo.imageUrl))
    return `${label}.seo.imageUrl must be an HTTPS URL or null.`;
  if (!Array.isArray(value.topics)) return `${label}.topics must be an array.`;
  if (
    value.topics.some(
      (topic) =>
        !isRecord(topic) ||
        !hasExactKeys(topic, ["slug", "label"]) ||
        !isNonEmptyString(topic.slug) ||
        !isNonEmptyString(topic.label),
    )
  )
    return `${label}.topics contains an invalid topic.`;
  if (!Array.isArray(value.citations))
    return `${label}.citations must be an array.`;
  if (
    value.citations.some(
      (citation) =>
        !isRecord(citation) ||
        !hasExactKeys(citation, [
          "citationId",
          "label",
          "url",
          "evidenceType",
        ]) ||
        !isNonEmptyString(citation.citationId) ||
        !isNonEmptyString(citation.label) ||
        (citation.url !== null && !isHttpsUrl(citation.url)) ||
        (citation.evidenceType !== null &&
          typeof citation.evidenceType !== "string"),
    )
  )
    return `${label}.citations contains an invalid citation.`;
  if (
    typeof value.checksumSha256 !== "string" ||
    !SHA256_PATTERN.test(value.checksumSha256)
  )
    return `${label}.checksumSha256 must be a SHA-256 hex digest.`;
  return null;
}

function validateRevocation(
  value: unknown,
  destination: DestinationKey,
  index: number,
): string | null {
  const label = `revocations[${index}]`;
  if (!isRecord(value)) return `${label} must be an object.`;
  if (
    !hasExactKeys(value, [
      "contentId",
      "versionId",
      "publicationRecordId",
      "destination",
      "revokedAt",
      "revision",
    ])
  )
    return `${label} has missing or unknown fields.`;
  for (const field of [
    "contentId",
    "versionId",
    "publicationRecordId",
  ] as const)
    if (typeof value[field] !== "string" || !UUID_PATTERN.test(value[field]))
      return `${label}.${field} must be a UUID.`;
  if (value.destination !== destination)
    return `${label}.destination does not match the envelope destination.`;
  if (!isIsoInstant(value.revokedAt))
    return `${label}.revokedAt must be an ISO UTC instant.`;
  if (!Number.isSafeInteger(value.revision) || Number(value.revision) < 1)
    return `${label}.revision must be a positive integer.`;
  return null;
}

/**
 * Fails closed on incomplete or cross-brand payloads before a destination
 * renders them. It intentionally returns a typed copy only after all
 * canonical, destination and full/summary invariants have passed.
 */
export function validateBrandDeliveryEnvelope(
  raw: unknown,
): BrandDeliveryValidation {
  if (!isRecord(raw))
    return { ok: false, error: "Envelope must be an object." };
  if (
    !hasExactKeys(raw, [
      "schemaVersion",
      "generatedAt",
      "destination",
      "cursor",
      "nextCursor",
      "items",
      "revocations",
    ])
  )
    return { ok: false, error: "Envelope has missing or unknown fields." };
  if (raw.schemaVersion !== BRAND_DELIVERY_SCHEMA_VERSION)
    return { ok: false, error: "Unsupported delivery schema version." };
  if (!isIsoInstant(raw.generatedAt))
    return { ok: false, error: "generatedAt must be an ISO UTC instant." };
  if (!isOneOf(raw.destination, DESTINATION_KEYS))
    return { ok: false, error: "Unknown destination." };
  if (raw.cursor !== null && !isNonEmptyString(raw.cursor))
    return { ok: false, error: "cursor must be a non-empty string or null." };
  if (raw.nextCursor !== null && !isNonEmptyString(raw.nextCursor))
    return {
      ok: false,
      error: "nextCursor must be a non-empty string or null.",
    };
  if (!Array.isArray(raw.items))
    return { ok: false, error: "items must be an array." };
  if (raw.items.length > 100)
    return { ok: false, error: "items exceeds the 100-item page limit." };
  if (!Array.isArray(raw.revocations))
    return { ok: false, error: "revocations must be an array." };
  if (raw.revocations.length > 100)
    return { ok: false, error: "revocations exceeds the 100-item page limit." };

  for (const [index, item] of raw.items.entries()) {
    const error = validateItem(item, raw.destination, index);
    if (error) return { ok: false, error };
  }
  for (const [index, revocation] of raw.revocations.entries()) {
    const error = validateRevocation(revocation, raw.destination, index);
    if (error) return { ok: false, error };
  }

  const eventKeys = new Set<string>();
  const duplicateActive = raw.items.some((item) => {
    const typed = item as Record<string, unknown>;
    const key = `${typed.publicationRecordId}:${raw.destination}`;
    if (eventKeys.has(key)) return true;
    eventKeys.add(key);
    return false;
  });
  const duplicateOrContradictory = raw.revocations.some((revocation) => {
    const typed = revocation as Record<string, unknown>;
    const key = `${typed.publicationRecordId}:${raw.destination}`;
    if (eventKeys.has(key)) return true;
    eventKeys.add(key);
    return false;
  });
  if (duplicateActive || duplicateOrContradictory)
    return {
      ok: false,
      error:
        "A publication cannot be active and revoked, or repeated, in one envelope.",
    };

  return { ok: true, envelope: raw as unknown as BrandDeliveryEnvelope };
}
