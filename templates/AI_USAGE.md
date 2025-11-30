# AI USAGE

## Where AI helped

-   Generating and refining the prompt to get highlights title
-   Getting advise on file structure for tests
-   Adjusting tests
-   Build evaluation function to check for AI generated fields
-   Help make a decision from multiple options

## Prompts or strategies that worked

-   "Adjust the prompt here to have a structured output, since I get problems with the current one, I want ONLY an array of highlights (strings), and nothing else"
-   "Question, for the invariants that I have to test, should I make different files for each or group them together?"
-   "How to change the Ordering test so that It ignores the "caption" and "created_at" field when comparing the 2 stories?"
-   "Generate a function evaluateCaptions that checks factual fields for the Ai generated comments using aiCaption function"
-   "@workspace now that I've added the smart captions (LLM + evaluation script that checks factual fields), what should I do with the results of evalResults? "[
    {
    index: 0,
    hasMinute: true,
    hasPlayer: true,
    caption: "92' Arne Engels penalty goal (right foot to bottom left corner)"
    },
    ...
    {
    index: 6,
    hasMinute: true,
    hasPlayer: true,
    caption: "84' Daizen Maeda goal from right side of box to bottom right corner, assisted by Arne Engels"
    }
    ]", should I add a unit test for it? or just try catch and log an error or maybe if they all don't respect default to the regular comments? "

## Verification steps (tests, assertions, manual checks)

-   Wrote unit tests to enforce invariants from tests/invariants.md
-   Manually added out/story.json to index.html to visually check the correctness
-   Ran the evaluation script to check that AI-generated captions include factual fields (minute, player, etc.) and logged any failures for review

## Cases where you chose **not** to use AI and why

-   Did not use AI for basic data transformation, validation, or file I/O—these are deterministic and better handled with standard code for reliability and transparency
-   Did not use AI for deduplication or ordering logic, since clear business rules and code are easier to test and maintain
