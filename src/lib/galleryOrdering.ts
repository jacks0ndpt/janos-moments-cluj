import { arrayMove } from "@dnd-kit/sortable";

/** Gallery fractional ordering, with sparse rebalancing when adjacent positions converge. */
export function galleryOrderMove<T extends { id: string; position: number }>(images: T[], from: number, to: number) {
  if (from < 0 || to < 0 || from >= images.length || to >= images.length || from === to) return null;
  const next = arrayMove(images, from, to);
  const moved = images[from];
  const before = next[to - 1];
  const after = next[to + 1];
  const lo = before ? before.position : (after ? after.position - 2000 : 0);
  const hi = after ? after.position : (before ? before.position + 2000 : 1000);
  const rebalance = hi - lo < 0.002;
  const ids = rebalance ? next.map((image) => image.id) : [moved.id];
  const positions = rebalance ? next.map((_, index) => (index + 1) * 1000) : [(lo + hi) / 2];
  const byId = new Map(ids.map((id, index) => [id, positions[index]]));
  return { ids, positions, images: next.map((image) => ({ ...image, position: byId.get(image.id) ?? image.position })) };
}