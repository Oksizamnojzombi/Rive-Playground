---
name: rive-playground-context
description: >
  Project context and recurring gotchas for the "Rive Playground" portfolio page
  (dark-theme site built from Motion Design School's "Rive: Interactive Motion"
  course lessons + a "Commercial Shots" showcase section) in this folder. Load this
  whenever touching index.html, CSS/styles_dark.css, JS/rive.js, JS/masonry.js,
  README.md, favicon.svg, any NN.Lesson_NN folder, or AVQ_logo in this project —
  and ALWAYS before wiring up a new lesson's .riv file, since the single most common
  bug here ("state machine not found", a blank/black card) has a known cause and a
  known fix documented below. Also load it when a lesson card looks visually wrong
  (wrong height/width vs. a sibling card), when editing lesson copy, or when asked
  to preview the site locally.
---

# Rive Playground — project notes

Portfolio page for Oksana's Rive practice: a full-width interactive hero menu,
a "Commercial Shots" showcase for production work outside the course, and a
masonry gallery of ~19 course lessons. Everything is static HTML/CSS/vanilla JS —
no build step, no framework.

```
index.html            — all markup (hero, showcase, gallery, footer)
CSS/styles_dark.css   — the only stylesheet, one big file, sectioned with comments
JS/rive.js            — mounts every Rive canvas on the page
JS/masonry.js         — packs the gallery grid + the scroll-reveal fade-in
favicon.svg           — concentric-ring mark, matches the hero's portal motif
README.md             — lesson table + stack notes, keep it in sync with index.html
NN.Lesson_NN/          — one folder per course lesson, each with a Final_Result/*.riv
AVQ_logo/              — the one "real work" asset (Avanquest logo animation)
```

## The #1 recurring bug: wrong artboard

**Every single lesson added after the first eight has needed this fix at least
once.** When a card's canvas stays blank, or the console says *"State Machine
with name X not found"*, it's almost never a typo — it's that the `.riv` file's
**default artboard isn't the one the needed state machine lives on**. Rive files
routinely contain several artboards (iteration leftovers, nested sub-artboards,
remap variants), and only one of them is "default."

`mount()` in `JS/rive.js` takes an **optional 4th argument** for exactly this:

```js
function mount(canvasId, src, stateMachine, artboard) { ... }
```

Lessons that needed it (default artboard ≠ the one with the right state machine):
Inner Space (`"Inner Space"`), Pluto Routine (`"Planet_Remap"`), Flying Pencil
(`"pencil comp"`), Interactive Text (`"text Remap"`), Walk Control
(`"walk - remap"`), Mushroom Control (`"mush remap"`). Notice the pattern in the
names — a "...Remap"/"... remap" artboard is usually the real interactive one,
while the plain-named default ("Planet_Basic", "text basic", "pencil base") is
an earlier, simpler iteration left in the file.

**Before wiring up any new lesson, inspect the file first** — don't guess from
the Rive editor screenshot alone. Paste this in the browser console on the
running preview page (needs the `@rive-app/webgl2` script already loaded, which
it is on this page):

```js
fetch("NN.Lesson_NN/Final_Result/file.riv?bust=" + Math.random(), { cache: "no-store" })
  .then(r => r.arrayBuffer())
  .then(buf => {
    const canvas = document.createElement("canvas");
    canvas.width = 400; canvas.height = 400;
    const inst = new rive.Rive({
      buffer: buf,
      canvas,
      autoplay: false,
      onLoad: () => {
        console.log("default artboard:", inst.activeArtboard);
        console.log(inst.contents.artboards.map(a => ({
          name: a.name,
          stateMachines: a.stateMachines.map(sm => sm.name),
          animations: a.animations,
        })));
      },
      onLoadError: (e) => console.error(e),
    });
  });
```

That prints every artboard in the file with its state machines and animations.
Find the one that has the state machine you actually want, then pass its name
as the 4th argument — or leave it off if the default artboard is already correct.

## Lazy-mounting + unmounting (don't keep everything alive)

`JS/rive.js` keeps a `LESSONS` array of `[canvasId, src, stateMachine, artboard?]`
tuples. Each canvas's **parent** (`.canvas-inner` / `.showcase-canvas`) is
watched by one `IntersectionObserver` (`nearby`, `rootMargin: "300px 0px"`):
entering mounts the card (or `play()`s it if already alive), leaving
`pause()`s it — Oksana wants paused cards to resume with their interaction
state intact, so there's **no distance-based unmount** (one existed briefly
and was removed on her request).

Pausing does NOT free the WebGL2 context, so there's a safety cap:
`MAX_LIVE = 13` live lesson instances (+ the hero = 14). Past it, paused cards
farthest from the viewport centre are fully unmounted: `inst.cleanup()`,
`WEBGL_lose_context.loseContext()`, and the `<canvas>` is swapped for a fresh
`cloneNode(false)` (a lost-context canvas can't host a new Rive instance).
Those remount from scratch on return (state resets) — in practice the top-most
cards after scrolling the whole gallery. The hero stays mounted, pausing
off-screen. Don't raise `MAX_LIVE` above ~14.

Why: every live Rive canvas is its own WebGL2 context, and Chrome starts
silently killing the oldest ones (`GL_OUT_OF_MEMORY`, `CONTEXT_LOST_WEBGL`)
at ~16 — cards go blank seemingly at random, only in Chrome (Safari tolerates
more). Lazy-mount alone only *delays* this: without the cap, scrolling the
whole gallery once ends with 20+ live contexts. **Add new lessons to
the `LESSONS` array, never as a separate eager `mount()` call.** Observe the
wrapper, not the canvas — the canvas element gets replaced on unmount.

To check the live count while testing:
`(await import('/JS/rive.js')).instances.length` in the console (same module
instance as the page's).

## Card sizing: three independent knobs, easy to confuse

A card's on-screen size is **not** controlled by the `<canvas width height>`
HTML attributes — those only set the internal render resolution (crispness).
Visible size comes from CSS, and from two *independent* things:

1. `--ar` custom property on the `<article style="--ar: W / H">` — sets
   `.card-canvas { aspect-ratio: var(--ar, 1/1) }`. Defaults to a 1:1 square if
   omitted. Set this to the Rive composition's real aspect ratio.
2. `.wide` class on the `<article>` — `grid-column: span 2` in the 3-column
   desktop grid. Independent of `--ar`; a card can be `--ar: 1/1` *and* `wide`
   (a big square) just as easily as `--ar: 2/1` and not `wide` (a narrow banner).

If two cards look like they "should" be the same size on the page but aren't,
check these two per-card settings before assuming a layout bug — they're very
likely just declared differently on purpose or by oversight.

Actual row packing is masonry-via-grid: `.lessons-grid` uses
`grid-auto-rows: 8px; grid-auto-flow: row dense`, and `JS/masonry.js`
(`layoutMasonry()`) measures each card's real rendered height and sets
`grid-row-end: span N` to make the dense packing tight. Runs on load, on
`document.fonts.ready`, and debounced on resize — no manual sync needed when
`--ar`/`wide` change.

## Card order & numbering

Oksana reorders `<article>` lesson cards in the HTML freely and often (newest
or favorite work goes first — the DOM order has no relation to the lesson
number in the filename/folder). The visible `01 02 03…` badges are **not**
hand-typed: `<span class="card-num"></span>` is left empty, and CSS counters
fill it in from DOM order —

```css
.lessons-grid { counter-reset: card; }
.lesson-card  { counter-increment: card; }
.card-num:empty::before { content: counter(card, decimal-leading-zero); }
```

— so reordering cards in the HTML is enough; nothing else needs updating. If a
manual number ever needs to override this, just put text inside that span.

## "Load more" (gallery + Commercial Shots)

Each `<button class="load-more" data-items="...">` (one under `.lessons-grid`
with `data-items=".lesson-card"`, one under the showcase items with
`data-items=".showcase-item"`) is wired by `setupLoadMore()` in
`JS/masonry.js`: its section's first `LOAD_BATCH = 8` items (DOM order) show,
the rest get `.is-collapsed` (`display: none`), and each click reveals the next
8 (label shows how many are left; the button hides when none are). With 8 items
or fewer the button simply never appears — that's why Commercial Shots shows no
button yet (1 item). `display: none` keeps collapsed items out of the masonry,
the CSS card counter and the Rive lazy-mount — their `.riv` files aren't
fetched until revealed. Every reveal re-runs `layoutMasonry()`. Without JS all
items show. HTML order decides what's in the first batch.

To add another Commercial Shot: copy the `<article class="showcase-item">`
block above that section's `.load-more-wrap`, give its canvas a new id, and
add the canvas to `LESSONS` in `JS/rive.js`. Stacked items get spacing from
`.showcase-item + .showcase-item`.

## Card copy conventions

- `.card-desc`: one (sometimes two) past-tense sentence(s), no leading "I" —
  "Explored...", "Built...", "Rigged...", describing the *skill/technique*
  practiced, not a literal description of the animation.
- `.card-hint`: present-tense imperative describing the actual interaction —
  "Tap on screen to...", "Use the sliders to...", "Move the cursor to...".
- When Oksana pastes a course lesson's intro screenshot and asks to "rephrase
  the description", give 2 phrasing options for `.card-desc` plus one
  `.card-hint` suggestion based on what's visible in the screenshot (sliders,
  checkboxes, tap/hover hints) — she picks/edits rather than wanting it applied
  sight-unseen.

## "Commercial Shots" showcase section (`#real-work`)

A full-bleed-style block above the lesson gallery, built as a pixel-accurate
clone of an Avanquest Figma design ("Animated Section Concept" / "PDF SDK, API
& Web SDK.") — used to preview the `AVQ_logo/avq_interactivelogo.riv` logo
animation in context for a manager review. **Its colors and font (`DM Sans`)
are deliberately hardcoded to the exact Figma hex values**, not the site's own
`--bg`/`--card`/`--text`/`--muted` theme tokens — that's intentional, not an
inconsistency to "fix". Oksana's stated plan: once the real content is ready,
delete this banner-style mockup and fold just the logo animation into the
site's own normal dark theme/card style. Don't silently revert the hardcoded
colors to theme tokens before she asks.

The canvas is 1200×600 (2:1) to match the logo file's own shape — if a
different-shaped logo ever replaces it, update `.showcase-canvas`'s
`aspect-ratio` in CSS to match.

## Social preview (Open Graph)

`<head>` has `description`, `og:*` and `twitter:*` tags. `og:image` /
`twitter:image` point to `IMG/Banner.jpg` (1200×714, ~130 KB, made from the `Banner.png` source) by **absolute** URL on the
Pages domain — crawlers ignore relative paths. If the repo/Pages URL changes
again, update `og:url` and both image URLs. Crawlers cache aggressively: after
changing the image, re-scrape via LinkedIn Post Inspector / Facebook Sharing
Debugger.

## Local preview & the caching trap

Static site, needs an HTTP server (not `file://`) because `fetch()`-ing `.riv`
files requires it. `.claude/launch.json` config name `rive-course-static` runs
`python3 -m http.server 8743 --directory <this folder>` — **note that
`launch.json` must live in the Claude Code session's own primary working
directory**, not necessarily inside this project folder, for `preview_start` to
find it; recreate it there if a fresh session's working directory differs.

Python's `http.server` sends no cache-control headers, so both Oksana's real
browser and any automated testing browser will keep serving a stale cached
copy of `JS/rive.js` / `CSS/styles_dark.css` after an edit, even across a
normal reload. Always force a fresh fetch before trusting what you see:

```js
fetch('/JS/rive.js', {cache: 'reload'}).then(() => location.reload());
```

(swap the path for whichever file changed). Tell Oksana to hard-refresh
(Cmd+Shift+R, or clear-cache-and-reload in Safari) when she's testing changes
in her own browser and something looks stale.

Deployed via GitHub Pages from `github.com/Oksizamnojzombi/Rive-Playground`
(renamed from `MDS_Rive_Lessons`, which still redirects; branch `main`) at
`oksizamnojzombi.github.io/Rive-Playground/` — same caching
caveat applies there even more since it's a real CDN.

## If testing via Claude's own Browser-pane tool

The embedded preview tab is frequently `document.hidden === true` when it isn't
the frontmost pane. This silently freezes anything tied to the rendering
pipeline — CSS transitions (`.reveal` fade-ins), WebGL repaint, **and
`IntersectionObserver` callback delivery** (so the lazy-mount in `JS/rive.js`
can look like it "isn't firing" when it's actually just queued). A
`computer{action:"screenshot"}` call forces a real paint frame and flushes all
of this at once. If something looks stuck/blank/static right after a reload in
this tool, take a screenshot (or two) before concluding it's a real bug — this
exact confusion has eaten a lot of debugging time in this project already.

## Known open TODOs (verify current state before assuming)

- **Lesson 09 "Inner Space"** is commented out in `index.html` — animation has
  an unresolved listener/performance glitch (suspected cause: the hero's master
  file bundles every character as a nested artboard, each still carrying its
  own full interactive listener set, multiplying hit-testing cost).
- **Footer social links** are still placeholders (`href="#"`,
  `mailto:hello@example.com`).
- **Lesson 16 "Interactive Text"** had a highlight-sweep bug: the "WaveScale"
  state-machine layer animates the Highlight text run's position, but a
  "Joy MID"/"Joy UP"/"Joy LOW" layer (blend-driven by cursor position, not
  time) also touches the same property with a static keyframe — later layers
  override earlier ones' touched properties, so the sweep only showed while
  hovering. Fix direction was either reordering layers or moving the sweep into
  its own always-looping layer; confirm current state rather than assuming
  it's resolved.
- Palette reference (`CSS/styles_dark.css` `:root`): teal `#00BECD`, blue
  `#0093BA`, yellow `#FFD700`, lime `#D0DF00`, orange `#FF9E52`, bg `#050608`.
