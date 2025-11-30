# DECISIONS

## Heuristic and ranking

-   Selected highlights based on event type priority ("goal","penalty goal","penalty won","penalty lost","yellow card","attempt saved",etc.)
-   Sorted highlights by minute (latest first)
-   Limited the number of highlights to the top N
-   Used AI generated headlines and captions for each highlight

## Data handling (duplicates, missing fields, out‑of‑order minutes)

-   Deduplicated events by combining type, minute, player reference, and comment and comparing highlights
-   If player information is missing, fallback to generic captions
-   Out-of-order minutes are sorted descending before selection

## Pack structure and invariants

-   Unique pack_id based on teams and match date
-   a title summarizing the match
-   a pages array starting with a single cover page, followed by highlight or info pages
-   metrics object with counts for goals and highlights
-   source field referencing the input file
-   created_at timestamp in ISO-8601 format

## What I would do with 2 more hours

-   Improve player image matching for better visual context
-   Add more error handling
-   Refine AI prompt engineering for more accurate headlines/captions
-   Improve the heuristic and ranking
