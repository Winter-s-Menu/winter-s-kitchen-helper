// In-memory session order: stable across SPA navigation, regenerated on full reload.
let cachedOrder: Map<string, number> | null = null;

/**
 * Returns a stable per-session sort key per recipe id.
 * Uses weighted randomness: newer recipes (by createdAt) get a boost.
 * Lower key sorts first.
 */
function buildKey(createdAt?: string | null): number {
  const now = Date.now();
  const created = createdAt ? new Date(createdAt).getTime() : now - 365 * 24 * 60 * 60 * 1000;
  const ageDays = Math.max(0, (now - created) / (1000 * 60 * 60 * 24));
  // Boost: ~3x for brand new, decays to ~1x over ~60 days
  const weight = 1 + 2 * Math.exp(-ageDays / 60);
  const r = Math.random();
  // Efraimidis–Spirakis style weighted reservoir key (negated for ascending sort)
  return -Math.log(r === 0 ? 1e-12 : r) / weight;
}

export function getDiscoveryOrder(
  items: { id: string; createdAt?: string | null }[]
): Map<string, number> {
  if (!cachedOrder) cachedOrder = new Map();
  for (const it of items) {
    if (!cachedOrder.has(it.id)) {
      cachedOrder.set(it.id, buildKey(it.createdAt));
    }
  }
  return cachedOrder;
}
