# Architecture

## Philosophy
- **Static site, no build step** — Vanilla HTML/CSS/JS served as-is from GitHub Pages
- **Zero dependencies** — No npm, no bundler, no framework
- **Single source of truth** — All data lives in `songs.json`; all pages read from it
- **Edit → refresh** — The entire dev loop

## Data flow

```
                 ┌──────────────┐
                 │  songs.json  │  ← conductor edits
                 └──────┬───────┘
                        │ fetch()
           ┌────────────┼────────────────┬──────────────┐
           ▼            ▼                ▼              ▼
    ┌──────────┐  ┌──────────┐  ┌───────────────┐  ┌──────────┐
    │index.html│  │song.html │  │ concert.html  │  │ (static) │
    │  lists   │  │  loops + │  │  plays songs  │  │ polyrhythm│
    │  songs   │  │  YouTube │  │  in order     │  │   .html  │
    └──────────┘  └──────────┘  └───────────────┘  └──────────┘
```

`polyrhythm.html` is standalone — it doesn't read `songs.json`. Everything else does.

## Page responsibilities

### `index.html`
- Fetches `songs.json`
- Groups songs by concert
- Sorts songs within a concert by the `order` field
- Sorts concert sections: active first (in `songs.json` order), `archived` ones last under a "past concerts" divider
- Renders concert sections with names, dates, and song links
- Links to `song.html?s=<slug>` for each song
- Includes a tools nav at the bottom with links to `polyrhythm.html` and `concert.html`

### `song.html`
- Reads `?s=<slug>` from URL query string
- Fetches `songs.json`, finds the matching song
- Embeds YouTube iframe player with the song's `videoId`
- Renders loop controls from the song's `loops` array
- Uses the YouTube iframe API for play/pause/seek/speed control
- `checkLoop` runs on a 200ms interval (only while `loopActive`) to detect loop-end and seek back

### `concert.html`
- Fetches `songs.json`, builds a playlist from the non-`archived` concerts, sorted by `order`
- Embeds YouTube iframe player
- On `YT.PlayerState.ENDED`, advances to the next song (wraps to first)
- Shows a setlist with current piece highlighted
- Tracks loop count ("loop 1", "loop 2", ...)

### `polyrhythm.html`
- Standalone Web Audio tool — does not read `songs.json`
- Pre-renders 6 voices as AudioBuffers at init
- Web Worker ticker sends 25ms messages to schedule beats 120ms ahead
- Two layers (4 beats, 3 beats) play simultaneously, each with independent voice + mute
- Visual beat indicators sync via `requestAnimationFrame` consuming a time-stamped queue

See [polyrhythm.md](polyrhythm.md) for detailed audio engine notes.

## Shared resources

| Resource | Used by |
|---|---|
| `song.css` | `song.html`, `polyrhythm.html`, `concert.html` (shared base styles) |
| `index.css` | `index.html` only |
| `feather.svg` | All pages (decorative icon) |
| Cormorant Garamond (Google Fonts) | All pages |
| `songs.json` | `index.html`, `song.html`, `concert.html` |

## External dependencies
- **YouTube iframe API** — loaded from `https://www.youtube.com/iframe_api` in `song.html` and `concert.html`. If blocked (corporate firewall, ad blocker), video controls fail silently.
- **Google Fonts** — Cormorant Garamond. If blocked, falls back to system serif.
- **No other external services, CDNs, or APIs.**

## Deployment
- `main` branch → GitHub Pages → `wso.learndoteach.org` (CNAME config in `/CNAME`)
- Push triggers a rebuild; typically live within ~30 seconds
- No cache-busting on assets — mobile browsers may serve stale CSS/JS for a while after a deploy

## Directory layout
```
wso/
├── index.html          # Landing page
├── index.css           # Landing page styles
├── song.html           # Song practice page
├── song.css            # Shared styles (song, concert, polyrhythm)
├── concert.html        # Virtual concert page
├── polyrhythm.html     # Polyrhythm practice tool (self-contained)
├── songs.json          # All song + concert data
├── feather.svg         # Decorative icon
├── CNAME               # GitHub Pages custom domain
├── README.md           # Entry point docs
├── CONTRIBUTING.md     # How to make changes
├── ARCHITECTURE.md     # This file
├── DATA.md             # songs.json schema
├── looper.md           # song.html notes
├── virtualconcert.md   # concert.html notes
├── polyrhythm.md       # polyrhythm.html notes
├── aesthetics.md       # Design language
├── bugfixes.md         # Bug fix history
└── unfixedbugs.md      # Known issues
```

## Design decisions worth knowing

- **Why no build step?** The site is tiny (~3 pages of interactive content, ~30 loop entries). A build step would be overhead with no benefit, and the conductor can edit `songs.json` directly without learning npm.
- **Why vanilla JS?** Same reason. React/Vue/Svelte would add a bundle for no functional gain on a ~700-line codebase.
- **Why `songs.json` instead of separate files per song?** Every page needs the full list (index, concert). One fetch, one source of truth.
- **Why GitHub Pages?** Free, reliable, auto-deploys from git. Perfect for static content.
- **Why Cormorant Garamond?** Establishes an elegant, classical typography matching the orchestra's aesthetic.
