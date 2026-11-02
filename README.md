# MDS Rive — Interactive Motion

Practice files and lesson projects from the
[Rive: Interactive Motion](https://motiondesign.school/courses/rive-interactive-motion/)
course by Maksym Marakhovskyi / Motion Design School.

## Lessons

| # | Project | Topics |
|---|---------|--------|
| 01 | Jump Ball | Rive basics, state machines, character skin |
| 02 | Water Bubble | Wave & bubble rig, joysticks, sliders |
| 03 | Belly Mixing | Bone rigging, animation blending |
| 04 | Sunny Rock | Advanced rigging, additive blending, 1D blend |
| 05 | Artist Parallax | Constraints, 3D parallax, character animation |
| 06 | Lazer Boy | Multi-layer parallax, nested artboards, particles |
| 07 | Fire 360 | FX sequences, frame-by-frame in state machine |
| 08 | Octopus Echo | Held-input interaction, echo motion |
| 09 | Inner Space | Multi-layer parallax rigs, cursor-tracked particles, nested artboards |
| 10 | Pluto Routine | Interactive planet, follow-pointer movement, mixing & blending |
| 11 | Space Duo | Planet switching, basic rig & state machine, color skins |
| 12 | Flying Pencil | Faux-3D setups, nested artboards, rigging & animation techniques |
| 13 | Wavy Plant | Bone rigging, FK setups, animation tricks |
| 14 | Double Balance | Complex balance rig, seamless cyclical animation transitions |
| 15 | Follow Bat | Advanced shape techniques, cursor-follow & gaze-listener setup |
| 16 | Interactive Text | Text in Rive, text-based setups, custom rigs |
| 17 | Walk Control | Seamless walk-cycle animation, slider-driven rigging |
| 18 | Outline Morphings | 3D object rig, shape-morphing transformations |
| 19 | Mushroom Control | Custom 3D rig, advanced rigging & compositing |
| Bonus | Main Menu (hero) | Radial menu, nested artboards, click navigation |

> Lesson 09 (Inner Space) is temporarily commented out in `index.html` while
> an animation glitch in that file is being tracked down.

## Preview page

`index.html` — dark-theme portfolio page:

- **Hero** — full-width interactive radial menu (bonus lesson, 2000×1000)
- **Real Work** — a section for production pieces outside the course
  (currently: the `AVQ_logo/avq_interactivelogo.riv` dotted-logo animation).
  The surrounding copy/colors are a pixel-accurate mockup of an Avanquest
  Figma design ("PDF SDK, API & Web SDK.") used to preview the logo in context
  for a manager review — swap in real copy and the site's own theme tokens
  (`--bg`, `--card`, `--text`, `--muted`) once that's done.
- **Gallery** — masonry grid of lesson cards; hover a card for a description
  and an interaction hint. Cards mount lazily (`IntersectionObserver`, see
  `JS/rive.js`) so the browser isn't juggling 15+ WebGL2 contexts at once.
- Rive runtime: `@rive-app/webgl2` (required — some blend-mode effects are
  ignored by the Canvas2D renderer)

## Stack

- [Rive](https://rive.app) — animation & interactivity
- HTML + CSS + Rive Web Runtime (WebGL2) — lesson preview page
