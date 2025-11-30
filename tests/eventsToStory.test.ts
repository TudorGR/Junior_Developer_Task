import eventsToStory, { evaluateCaptions } from "../eventsToStory";
import Ajv2020 from "ajv/dist/2020";
import * as fs from "fs";
import * as path from "path";
import addFormats from "ajv-formats";

function stripHeadlineAndCreatedAt(story) {
    // Deep clone without headline and created_at and caption (since LLM used)
    const clone = JSON.parse(JSON.stringify(story));
    delete clone.created_at;
    if (Array.isArray(clone.pages)) {
        clone.pages = clone.pages.map((page) => {
            const { headline, caption, ...rest } = page;
            return rest;
        });
    }
    return clone;
}

describe("Required invariants", () => {
    let story;
    beforeAll(async () => {
        story = await eventsToStory();
    });

    test("validates against schema", async () => {
        const ajv = new Ajv2020();
        addFormats(ajv);
        const schemaPath = path.join(__dirname, "../schema/story.schema.json");
        const schema = JSON.parse(
            await fs.readFileSync(schemaPath, {
                encoding: "utf8",
            })
        );
        const validate = ajv.compile(schema);
        const valid = validate(story);
        if (!valid) {
            console.error(validate.errors);
        }
        expect(valid).toBe(true);
    });

    test("Contains exactly one `cover` Page at index 0", async () => {
        const firstPage = story.pages[0];
        expect(firstPage.type).toBe("cover");
    });

    test("For non-empty highlights, `pages[1:]` contain only unique highlights (no exact duplicates)", () => {
        const highlights = story.pages.slice(1);
        if (highlights.length > 1) {
            const seen = new Set<String>();
            for (const h of highlights) {
                expect(seen.has(h.caption)).toBe(false);
                seen.add(h.caption);
            }
        }
    });

    test("Ordering is stable and deterministic for the same input.", async () => {
        const story2 = await eventsToStory();
        expect(stripHeadlineAndCreatedAt(story)).toEqual(
            stripHeadlineAndCreatedAt(story2)
        );
    });

    test('When events are empty or no items pass your threshold, include an `info` Page communicating "no highlights".', async () => {
        const emptyStory = await eventsToStory(0);
        expect(emptyStory.pages.length).toBe(2);
        const infoPage = emptyStory.pages[1];
        expect(infoPage.type).toBe("info");
        expect(infoPage.body.toLowerCase()).toContain("no highlights");
    });

    test("`created_at` is ISO‑8601 (UTC recommended).", () => {
        const createdAt = story.created_at;
        const date = new Date(createdAt);
        expect(date.toISOString()).toBe(createdAt);
    });

    test("`source` points to the input file used (e.g., `../data/match_events.json`).", () => {
        expect(story.source).toBe("./data/match_events.json");
    });

    test("All LLM captions contain minute and player", async () => {
        const highlights = story.pages.slice(1);
        if (highlights.length > 1) {
            const evalResults = evaluateCaptions(highlights);
            for (const result of evalResults) {
                expect(result.hasMinute).toBe(true);
                expect(result.hasPlayer).toBe(true);
            }
        }
    });
});
