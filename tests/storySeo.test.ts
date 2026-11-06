import { describe, expect, it } from "vitest";
import { storySeoTitle, storySitemapPaths, excerpt } from "../src/lib/storySeo";
const s = { slug: "a", title_ro: "Ana & Dan", title_en: "Ana & Dan", venue: "Elitis", location: "Cluj", intro_ro: null, intro_en: null };
describe("story SEO", () => {
  it("RO title format", () => expect(storySeoTitle(s, "ro")).toBe("Ana & Dan - Nuntă la Elitis, Cluj | Jimmy Hada"));
  it("EN title format", () => expect(storySeoTitle(s, "en")).toBe("Ana & Dan - Wedding at Elitis, Cluj | Jimmy Hada"));
  it("sitemap excludes unpublished", () => expect(storySitemapPaths([{ slug: "p", status: "published" }, { slug: "d", status: "draft" }, { slug: "x", status: "archived" }])).toEqual(["/stories/p"]));
  it("description truncated to 160", () => expect(excerpt("word ".repeat(100)).length).toBeLessThanOrEqual(160));
});
