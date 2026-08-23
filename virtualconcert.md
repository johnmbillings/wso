# Virtual Concert — Development Notes

## What was requested
A page that automatically plays all 3 concert pieces in program order on loop. The idea is to become so accustomed to the flow of the music that it's automatic — a virtual rehearsal you can leave running.

The order is: Coleman (Umoja) → Brahms (Variations on a Theme of Haydn) → Mahler (Symphony No. 2, 1st Movement).

A link was also requested at the bottom of the index page, below the polyrhythm practice link.

The index page song order was also updated to reflect the concert program order (was alphabetical).

## What was built

### concert.html
- Reads `songs.json`, sorts by `order` field, builds a playlist
- Embeds YouTube iframe player, loads first video on "start concert"
- On `YT.PlayerState.ENDED`, automatically loads the next piece via `player.loadVideoById()`
- When the last piece (Mahler) ends, loops back to Coleman
- Shows a setlist with current piece highlighted, previous pieces dimmed
- Loop counter ("loop 1", "loop 2", etc.)
- "start concert" button becomes "restart" after first play

### Data changes
- Added `order` field to each song in `songs.json` (Coleman=1, Brahms=2, Mahler=3)
- Index page sort changed from `localeCompare` (alphabetical) to numeric `order`

### Index page
- "virtual concert" link added in `<nav class="tools">` below "polyrhythm practice"

## Concert archiving (added august 2026)
The playlist is filtered to concerts without `"archived": true`, so the page
always plays the current program rather than every song in `songs.json`. The
subtitle is generated from the active concert name(s) instead of being
hardcoded. If every concert is archived, it falls back to playing everything —
better than an empty setlist.

## Known limitations
- Each piece plays from the very beginning of the YouTube video (no start offset)
- The Mahler video includes other movements — the 1st movement section ends around 40:00 but the video continues. Could add start/end times per piece if needed.
- No pause/resume between pieces (YouTube native controls still work)
- Loop counter resets on page refresh
