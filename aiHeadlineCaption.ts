import Groq from "groq-sdk";
import "dotenv/config";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function aiHeadline(comments: string[]) {
    const chatCompletion = await getGroqChatCompletion(comments);
    return chatCompletion.choices[0]?.message?.content || "";
}

export async function aiCaption(comments: string[]) {
    const chatCompletion = await getGroqChatCompletion2(comments);
    return chatCompletion.choices[0]?.message?.content || "";
}

function getGroqChatCompletion(comments: string[]) {
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

function getGroqChatCompletion2(comments: string[]) {
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
