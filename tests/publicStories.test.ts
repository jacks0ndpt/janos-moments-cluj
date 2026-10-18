import { expect, test } from "bun:test";
import { publishedStories } from "../src/lib/publicStories";

test("public overview includes only published Stories", () => {
  expect(publishedStories([
    { id: "visible", status: "published" },
    { id: "draft", status: "draft" },
    { id: "archived", status: "archived" },
  ]).map((story) => story.id)).toEqual(["visible"]);
});