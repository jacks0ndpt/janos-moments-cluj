import { expect, test } from "bun:test";
import { galleryOrderMove } from "../src/lib/galleryOrdering";

const images = ["a", "b", "c"].map((id, i) => ({ id, position: (i + 1) * 1000, story_id: "story", storage_path: id }));

test("Story reorder persists positions that reconstruct the same public order", () => {
  const move = galleryOrderMove(images, 2, 0);
  expect(move?.ids).toEqual(["c"]);
  expect(move?.positions).toEqual([0]);
  const stored = images.map((image) => ({ ...image, position: move?.images.find((item) => item.id === image.id)?.position ?? image.position }));
  expect(stored.sort((a, b) => a.position - b.position).map((image) => image.id)).toEqual(["c", "a", "b"]);
  expect(move?.images.map((image) => image.storage_path)).toEqual(["c", "a", "b"]);
});

test("midpoint move preserves all image relationships and untouched positions", () => {
  const move = galleryOrderMove(images, 0, 1);
  expect(move?.positions).toEqual([2500]);
  expect(move?.images.map((image) => image.position)).toEqual([2000, 2500, 3000]);
  expect(move?.images.every((image) => image.story_id === "story")).toBe(true);
});

test("converged positions rebalance the complete story list", () => {
  const move = galleryOrderMove(images.map((image, i) => ({ ...image, position: 1 + i * 0.0001 })), 0, 1);
  expect(move?.ids).toEqual(["b", "a", "c"]);
  expect(move?.positions).toEqual([1000, 2000, 3000]);
});

test("no-op and invalid drops do not change order", () => {
  expect(galleryOrderMove(images, 0, 0)).toBeNull();
  expect(galleryOrderMove(images, -1, 1)).toBeNull();
});