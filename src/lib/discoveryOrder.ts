// In-memory session order: stable across SPA navigation, regenerated on full reload.
let cachedOrder: Map<string, number> | null = null;

/**
 * Returns a stable per-session sort key per recipe id.
 * Uses weighted randomness: newer + better-rated recipes get a boost.
 * Lower key sorts first.
 */
function buildKey(createdAt?: string | null, avgRating?: number, reviewCount?: number): number {
  const now = Date.now();
  const created = createdAt ? new Date(createdAt).getTime() : now - 365 * 24 * 60 * 60 * 1000;
  const ageDays = Math.max(0, (now - created) / (1000 * 60 * 60 * 24));
  // Recency boost: ~3x for brand new, decays to ~1x over ~60 days
  const recencyBoost = 1 + 2 * Math.exp(-ageDays / 60);
  // Rating boost: gently dampened by review count so a single 5-star doesn't dominate.
  // No reviews => neutral (1.0). 5 stars with many reviews => up to ~2x.
  const r = typeof avgRating === 'number' && avgRating > 0 ? avgRating : 0;
  const n = typeof reviewCount === 'number' ? reviewCount : 0;
  const confidence = n / (n + 3); // 0..~1
  const ratingBoost = 1 + confidence * Math.max(0, (r - 3) / 2); // up to 1 + 1 = 2x
  const weight = recencyBoost * ratingBoost;
  const rand = Math.random();
  // Efraimidis–Spirakis style weighted reservoir key (negated for ascending sort)
  return -Math.log(rand === 0 ? 1e-12 : rand) / weight;
}

export function getDiscoveryOrder(
  items: { id: string; createdAt?: string | null; avgRating?: number; reviewCount?: number }[]
): Map<string, number> {
  if (!cachedOrder) cachedOrder = new Map();
  for (const it of items) {
    if (!cachedOrder.has(it.id)) {
      cachedOrder.set(it.id, buildKey(it.createdAt, it.avgRating, it.reviewCount));
    }
  }
  return cachedOrder;
}
