# EVALS (optional, if you used AI for captions)

Describe how you evaluated caption quality (e.g., check for minute, player, and score presence). Include 2–3 before/after examples.

To assess the quality of the AI-generated captions I implemented evaluateCaptions() function that checks for the presence of key factual fields in each caption:

-   Ensures that caption references the event time
-   Confirms the main players involved are mentioned

The script logs to the console the result of these evaluations for manual review, and also is checked in a unit test ("All LLM captions contain minute and player").

# Before/After

Before (raw event comments, missing structured details):

-   "Foul by Callum McGregor (Celtic)."
-   "Substitution, Kilmarnock. Marcus Dackers replaces Bruce Anderson."
-   "Attempt blocked. Benjamin Nygren (Celtic) left footed shot from outside the box is blocked. Assisted by Reo Hatate."

After (AI-generated captions, checked for minute and player):

-   "71' Callum McGregor commits a foul, conceding a free kick to Kilmarnock."
-   "66' Marcus Dackers comes on for Bruce Anderson in a substitution for Kilmarnock."
-   "65' Benjamin Nygren's left-footed shot from outside the box is blocked, with an assist from Reo Hatate."
