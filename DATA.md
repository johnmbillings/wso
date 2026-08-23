# songs.json Schema Reference

All site data lives in `songs.json`. Every page fetches it at runtime.

## Top-level structure

```json
{
  "concerts": { ... },
  "songs": { ... }
}
```

## `concerts` object

Keys are internal concert identifiers (slugs). Values are display metadata.

```json
"concerts": {
  "fall-2026": {
    "name": "fall 2026",
    "date": "date tbd"
  },
  "transformations": {
    "name": "transformations",
    "date": "may 8, 2026",
    "archived": true
  }
}
```

### Fields
| Field | Type | Required | Description |
|---|---|---|---|
| `name` | string | yes | Display name (shown on the index page) |
| `date` | string | no | Display date, free-form (shown next to name) |
| `archived` | boolean | no | `true` once the concert has been performed. Index sorts it below a "past concerts" divider and dims it; `concert.html` skips it. Song pages keep working. |

### Adding a new concert
```json
"concerts": {
  "transformations": { "name": "transformations", "date": "may 8, 2026" },
  "summer-2026": { "name": "summer classics", "date": "august 15, 2026" }
}
```

Songs reference concerts by their key (e.g. `"concert": "summer-2026"`).

Active concerts render in the order they appear in this object; archived ones
are always pushed to the bottom, so put the current concert first.

### Archiving a concert
Add `"archived": true` to it. Nothing else changes — its songs, loops, and
`song.html?s=<slug>` links all stay live, just dimmed and moved below the
"past concerts" divider. The virtual concert then plays only the remaining
active concert(s). If *every* concert is archived, `concert.html` falls back
to playing everything rather than showing an empty setlist.

## `songs` object

Keys are song slugs — used in URLs (`song.html?s=<slug>`). Keep them URL-safe: lowercase, hyphens, no spaces or special characters.

```json
"songs": {
  "coleman-umoja": {
    "title": "valerie coleman — umoja",
    "videoId": "uMbOFc9xIyo",
    "concert": "transformations",
    "order": 1,
    "loops": [ ... ]
  }
}
```

### Fields
| Field | Type | Required | Description |
|---|---|---|---|
| `title` | string | yes | Displayed on song page and index. Format: `"composer — piece name"` (em dash with spaces). Index page splits on `" — "` to dim the composer. |
| `videoId` | string | yes | YouTube video ID (the part after `v=` in a YouTube URL) |
| `concert` | string | yes | Key into the `concerts` object |
| `order` | number | yes | Determines display order on index and playback order in virtual concert. Use 1, 2, 3... |
| `loops` | array | yes | Loop definitions (see below). Can be empty `[]`. |

## `loops` array

Two formats supported (mix freely within the same song):

### Tuple format
Simple `[start, end]`:
```json
["0:24", "2:13"]
```

### Object format (with label)
Adds a label shown above the loop controls:
```json
{ "start": "0:24", "end": "2:13", "label": "Andante, mm. 0–29" }
```

### Loop fields
| Field | Type | Required | Description |
|---|---|---|---|
| `start` | string | yes | Start timestamp (see format below) |
| `end` | string | yes | End timestamp |
| `label` | string | no | Rehearsal mark / measure reference, shown above controls |

### Timestamp formats
All timestamps are strings:
- `"45"` — 45 seconds
- `"2:13"` — 2 minutes 13 seconds
- `"1:17:12"` — 1 hour 17 minutes 12 seconds

The parser picks the format based on colon count.

### Overlapping loops are allowed
Loops can overlap — useful when a musical phrase doesn't break cleanly at one-second resolution. For example:
```json
{ "start": "1:02", "end": "2:14", "label": "Var. I" },
{ "start": "2:13", "end": "3:38", "label": "Var. II" }
```

## Complete example

```json
{
  "concerts": {
    "transformations": {
      "name": "transformations",
      "date": "may 8, 2026"
    }
  },
  "songs": {
    "coleman-umoja": {
      "title": "valerie coleman — umoja",
      "videoId": "uMbOFc9xIyo",
      "concert": "transformations",
      "order": 1,
      "loops": [
        ["0:00", "1:00"],
        ["1:00", "2:00"]
      ]
    },
    "brahms-haydn-variations": {
      "title": "brahms — variations on a theme of haydn",
      "videoId": "QmQLb5SZb4E",
      "concert": "transformations",
      "order": 2,
      "loops": [
        { "start": "0:24", "end": "2:13", "label": "Andante, mm. 0–29" },
        { "start": "2:13", "end": "3:38", "label": "Var. I, poco più animato, mm. 30–58" }
      ]
    }
  }
}
```

## Common mistakes to avoid

### Trailing commas
**Invalid** (breaks the entire site):
```json
"loops": [
  ["0:00", "1:00"],
  ["1:00", "2:00"],  ← trailing comma
]
```

The pre-commit hook catches this. Set it up (see [README.md](README.md)).

### Mismatched quotes or escapes
JSON is strict — all strings use double quotes. No trailing commas, no comments, no single quotes.

### Forgetting `order`
Songs without `order` fall to the bottom (code uses `|| 99` as fallback). Always include it.

### Wrong `concert` key
If a song's `concert` field doesn't match a key in `concerts`, the song still appears but under an "uncategorized" section on the index page. Not catastrophic, but worth fixing.

### Duplicate slugs
Song slugs (keys in the `songs` object) must be unique. JSON silently keeps the last one.
