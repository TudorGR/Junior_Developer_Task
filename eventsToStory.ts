import * as fs from "fs";
import { aiHeadline, aiCaption } from "./aiHeadlineCaption";

const squads = [
    JSON.parse(fs.readFileSync("./data/celtic-squad.json", "utf8")).squad[0]
        .person,
    JSON.parse(fs.readFileSync("./data/kilmarnock-squad.json", "utf8")).squad[0]
        .person,
];
const assetDescriptions = JSON.parse(
    fs.readFileSync("./assets/asset_descriptions.json", "utf8")
).assets;

function findPlayer(playerId) {
    for (const squad of squads) {
        const player = squad.find((p) => p.id === playerId);
        if (player) return player;
    }
    return null;
}

export function evaluateCaptions(highlights) {
    return highlights.map((h, i) => {
        const player = findPlayer(h.playerRef1) || findPlayer(h.playerRef2);
        let hasPlayer = false;
        if (player) {
            const { shortFirstName, shortLastName } = player;
            const fullName = `${shortFirstName} ${shortLastName}`.toLowerCase();
            const reversedFullName =
                `${shortLastName} ${shortFirstName}`.toLowerCase();
            const captionLower = h.caption.toLowerCase();
            hasPlayer =
                (shortFirstName &&
                    captionLower.includes(shortFirstName.toLowerCase())) ||
                (shortLastName &&
                    captionLower.includes(shortLastName.toLowerCase())) ||
                captionLower.includes(fullName) ||
                captionLower.includes(reversedFullName);
        }
        const hasMinute = h.caption.includes(h.minute.toString());
        return {
            index: i,
            hasMinute,
            hasPlayer,
            caption: h.caption,
        };
    });
}

function findImageForPlayer(playerId) {
    const player = findPlayer(playerId);
    if (!player) return undefined;
    const { shortFirstName, shortLastName } = player;
    const match = assetDescriptions.find(
        (asset) =>
            (shortFirstName && asset.description.includes(shortFirstName)) ||
            (shortLastName && asset.description.includes(shortLastName))
    );
    return match ? `../assets/${match.filename}` : undefined;
}

(() => {
    const n = 6;
    eventsToStory(n);
})();

export default async function eventsToStory(n = 5) {
    try {
        fs.readFileSync("./data/match_events.json");
        console.log("Match_events.json exists\n");
        return writeStoryFile(
            await createStoryObject("./data/match_events.json", n)
        );
    } catch (e) {
        console.log("Match_events.json does not exist\n");
        return null;
    }
}

async function writeStoryFile(story) {
    if (!story) return;
    console.log("Creating Story.json file...\n");
    try {
        await fs.writeFileSync("./out/story.json", JSON.stringify(story));
        console.log("Story.json created\n");
        return story;
    } catch (e) {
        console.log(e);
        console.log("Failed to create Story.json\n");
        return null;
    }
}

async function createStoryObject(eventsPath, n) {
    const eventsFileLocation = eventsPath;
    console.log("Reading match_events.json\n");
    try {
        const events = JSON.parse(
            fs.readFileSync(eventsFileLocation, { encoding: "utf8" })
        );

        const obj = {
            pack_id: "",
            title: "",
            pages: [],
            metrics: {
                goals: null,
                highlights: null,
            },
            source: "",
            created_at: "",
        };

        obj.pack_id = `${events.matchInfo.contestant[0].name}_${events.matchInfo.contestant[1].name}_${events.matchInfo.localDate}`;
        obj.title = `Top Moments \u2014 ${events.matchInfo.contestant[0].name} vs ${events.matchInfo.contestant[1].name}`;
        obj.metrics.goals = events.messages[0].message.filter(
            (e) => e.type == "goal" || e.type == "penalty goal"
        ).length;
        obj.source = eventsFileLocation;
        obj.created_at = new Date().toISOString();

        let coverImage = "../assets/21521989.jpg";

        obj.pages = new Array();
        obj.pages.push({
            type: "cover",
            headline: `${events.matchInfo.contestant[0].name} vs ${events.matchInfo.contestant[1].name}`,
            image: coverImage || "../assets/placeholder.png",
        });

        const highlights = await createHighlights(
            events.messages[0].message,
            n
        );
        obj.metrics.highlights = highlights.length;

        // const evalResults = evaluateCaptions(highlights);
        // console.log("Caption Evaluation Results:", evalResults);

        if (highlights.length == 0) {
            obj.pages.push({
                type: "info",
                headline: `${events.matchInfo.contestant[0].name} vs ${events.matchInfo.contestant[1].name}`,
                body: "no highlights",
            });
        } else {
            obj.pages.push(...highlights);
        }

        return obj;
    } catch (error) {
        console.log(error);
        console.log(`Failed to read ${eventsFileLocation}\n`);
        return null;
    }
}

async function createHighlights(events, n = 5) {
    const highlightWorthy = events.filter((e) =>
        [
            "goal",
            "penalty goal",
            "penalty won",
            "penalty lost",
            "yellow card",
            "attempt saved",
            "attempt blocked",
            "miss",
            "corner",
            "post",
        ].includes(e.type)
    );

    const exists = new Set();
    let deduplicated = highlightWorthy.filter((e) => {
        // e.comment is the one from match_events.json, we compare eg. "goal-45-12345-scored a great goal"
        const event = `${e.type}-${e.minute}-${e.playerRef1}-${e.comment}`;
        if (exists.has(event)) return false;
        exists.add(event);
        return true;
    });

    deduplicated.sort((a, b) => Number(b.minute) - Number(a.minute));
    deduplicated = deduplicated.slice(0, n);

    const comments = deduplicated.map((e) => ({
        minute: e.minute,
        type: e.type,
        player:
            findPlayer(e.playerRef1)?.shortFirstName +
            " " +
            findPlayer(e.playerRef1)?.shortLastName,
        comment: e.comment,
    }));

    let headlines = [];
    try {
        const json = await aiHeadline(comments);
        headlines = JSON.parse(json);
    } catch (error) {
        console.log("Failed to generate headlines\n");
        headlines = comments;
    }

    let captions = [];
    try {
        const json = await aiCaption(comments);
        captions = JSON.parse(json);
    } catch (error) {
        console.log("Failed to generate captions\n");
        captions = comments;
    }

    const images = deduplicated.map(
        (e) =>
            findImageForPlayer(e.playerRef1) || findImageForPlayer(e.playerRef2)
    );

    return deduplicated.map((e, i) => ({
        type: "highlight",
        minute: Number(e.minute),
        headline: headlines[i],
        caption: captions[i],
        image: images[i] || "../assets/placeholder.png",
        explanation: "Latest minute highlight + important type",
        playerRef1: e.playerRef1,
        playerRef2: e.playerRef2,
    }));
}
