import Groq from "groq-sdk";
import "dotenv/config";

const hasGroqKey = !!process.env.GROQ_API_KEY;
const groq = hasGroqKey ? new Groq({ apiKey: process.env.GROQ_API_KEY }) : null;

export async function aiHeadline(comments) {
    if (!hasGroqKey) {
        console.log(
            "⚠️ Warning: GROQ_API_KEY not set in .env. Using default comments for headlines. ⚠️\n"
        );
        return JSON.stringify(comments.map((c) => c.minute + "' " + c.comment));
    }
    const chatCompletion = await getGroqChatCompletion(comments);
    return chatCompletion.choices[0]?.message?.content || "";
}

export async function aiCaption(comments) {
    if (!hasGroqKey) {
        console.log(
            "⚠️ Warning: GROQ_API_KEY not set in .env. Using default comments for captions. ⚠️\n"
        );
        return JSON.stringify(comments.map((c) => c.minute + "' " + c.comment));
    }
    const chatCompletion = await getGroqChatCompletion2(comments);
    return chatCompletion.choices[0]?.message?.content || "";
}

function getGroqChatCompletion(comments) {
    return groq.chat.completions.create({
        messages: [
            {
                role: "user",
                content: `You will receive an array of football match commentary comments.
                        For each comment, generate a headline: a short and concise, attention-grabbing phrase that summarizes the main point of the comment.
                        Return ONLY a valid JSON array of headlines in the exact same order as the input comments, with no extra text or explanation.
                        Here is the array of comments:\n${JSON.stringify(
                            comments
                        )}`,
            },
        ],
        model: "openai/gpt-oss-20b",
    });
}

function getGroqChatCompletion2(comments) {
    return groq.chat.completions.create({
        messages: [
            {
                role: "user",
                content: `You will receive an array of football match commentary comments.
                        For each comment, generate a smarter, and more detailed caption suitable for a highlight reel.
                        **Each caption MUST include the minute (as a number), player name(s) (as in the comment), and event type if available.**
                        Format: "[minute'] [player name(s)] [event description]".
                        Return ONLY a valid JSON array of captions in the exact same order as the input comments, with no extra text or explanation.
                        Example: ["67' Smith scores a brilliant goal!", ...]
                        Here is the array of comments:\n${JSON.stringify(
                            comments
                        )}`,
            },
        ],
        model: "openai/gpt-oss-20b",
    });
}
