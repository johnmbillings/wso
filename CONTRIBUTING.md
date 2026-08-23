# Contributing

## Before you start
- Install the pre-commit hook (see [README.md](README.md)) — it catches invalid JSON before it breaks the live site
- `main` is the live branch — pushes deploy to GitHub Pages automatically. No PRs required for this small project, but be careful

## Common tasks

### Update a loop timestamp
1. Edit `songs.json`
2. Find the song, find the loop, update `start` or `end`
3. `git add songs.json && git commit -m "update X loop Y" && git push`

### Add a new song
1. Add an entry in `songs.json` under `"songs"`:
   ```json
   "slug-name": {
     "title": "composer — piece name",
     "videoId": "YouTubeVideoId",
     "concert": "concert-key",
     "order": 4,
     "loops": [
       { "start": "0:00", "end": "1:30", "label": "Theme" }
     ]
   }
   ```
2. `order` determines display order on the index page and the virtual concert playback order
3. `concert` must match a key under `"concerts"` in the same file
4. No other files need to change — both `index.html` and `song.html` read from `songs.json`

### Add a new concert
1. Under `"concerts"` in `songs.json`:
   ```json
   "summer-2026": { "name": "summer concert", "date": "august 15, 2026" }
   ```
2. Reference the key in each song's `concert` field

### Archive a concert (after it has been performed)
1. Add `"archived": true` to its entry under `"concerts"` in `songs.json`:
   ```json
   "transformations": { "name": "transformations", "date": "may 8, 2026", "archived": true }
   ```
2. Add the new concert above it and point the new songs at its key
3. That's it — archived concerts drop below a "past concerts" divider on the
   index (dimmed, still clickable), and the virtual concert stops playing them

### Remove a song
1. Delete the entry from `songs.json`
2. Commit and push — nothing else to clean up

## Loop format options

Loops support two formats:

**Tuple (simple)**:
```json
["0:24", "2:13"]
```

**Object (with label)**:
```json
{ "start": "0:24", "end": "2:13", "label": "Andante, mm. 0–29" }
```

Mix both in the same song if you want. Labels display above the loop controls as a rehearsal mark reference. See [DATA.md](DATA.md) for the full schema.

## Timestamp format

All timestamps are strings. Supported formats:
- `SS` — seconds only (e.g. `"45"`)
- `M:SS` — minutes and seconds (e.g. `"2:13"`)
- `H:MM:SS` — hours, minutes, seconds (e.g. `"1:17:12"`)

## Git workflow
```sh
# Before editing, pull latest
git pull origin main

# Edit files, then:
git add <files>
git commit -m "brief description"
git push origin main
```

**Never commit with `--no-verify`** — the pre-commit hook exists to prevent the trailing-comma disaster (see [bugfixes.md](bugfixes.md) round 4).

## When in doubt
- Validate JSON manually: `python3 -c "import json; json.load(open('songs.json'))"`
- Test locally before pushing: `python3 -m http.server 8000` and visit `http://localhost:8000`
- Mobile cache can be aggressive — hard refresh (clear site data) if you don't see changes after a deploy

## What NOT to do
- Don't add trailing commas in `songs.json` (invalid JSON)
- Don't push directly to `main` without validating JSON first (pre-commit hook handles this, but don't skip it)
- Don't add build tooling or package managers — this is intentionally a zero-dependency static site
- Don't create documentation files unless there's a genuine need — we already have plenty

## Code style
- Two-space indentation
- Vanilla JS, no frameworks
- Lowercase in user-facing text (matches the aesthetic)
- Prefer editing existing files over creating new ones
