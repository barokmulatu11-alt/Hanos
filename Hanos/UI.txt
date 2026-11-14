I'm pulling full-resolution frames from the video so I can read the details accurately, and I'm viewing them now.

# Implementation prompt: "Voyager" – monochrome illustrated space landing page with blob-morph content reveal

Evidence base: a 14-second, 800×600 looping screen recording, with no narration and no scrolling, with a device-frame mockup, a few frames inspected at higher resolution, and the rest sampled at 1 frame per second. Timestamps are approximate, to about ±0.5 s. One unrelated screenshot (a terminal list of model names) was also attached. It contains no interface content and is ignored.

---

## A. Project objective

Build a single-viewport, hand-illustrated landing page for a fictional space-news brand called **VOYAGER**. The page is a black-and-white, ink-illustration composition. A large 3D-extruded headline reads **"EXPLORE THE SPACE"** and is surrounded by organic black "blob" shapes. Cartoon space illustrations sit on and around the blobs: an astronaut, a ringed planet, a UFO, a moon, an alien, and a telescope.

The one demonstrated interaction is a **blob-morph content reveal**. A black liquid shape expands from the left-hand blob and swallows the centre of the page. Inside it, white text replaces the hero: the headline **"Mystery: What came before the big bang?"** and a paragraph. The hero then returns, with the headline sliding in from the left.

Scope:
- One page with two states: **Hero** and **Mystery reveal**. Nothing else is demonstrated.
- The nav links are visible but no destinations are shown. Do not build other pages.

Most important to preserve, in priority order:
1. The composition: centred headline, illustrations scattered around it, black blobs as the main graphic device.
2. Strict black, off-white and gray monochrome with a paper-grain texture.
3. The extruded outlined headline.
4. The blob-expansion reveal and its reversal.
5. The ambient drift of the illustrations.

---

## B. Reference map

| Timestamp | Page / state | Action | Implementation detail |
|---|---|---|---|
| 0–1 s | Hero, intro | Headline is ghosted and faint, as if fading in. A small blurred ringed planet crosses in front of the title. | Entrance animation. Title fades from about 10% opacity to full. The planet is small and motion-blurred. |
| 1–3 s | Hero | Title solid. The planet grows and moves to the upper-right blob. The astronaut shifts slightly. | The planet scales up from about 40% to 100% while travelling right. |
| 3–6 s | Hero, idle | Stable composition. Everything else holds still apart from small drifts. | Idle state. |
| ~6 s | Hero | A thin white ring cursor appears over the left black blob, near the headline's left edge. | Custom cursor is visible in the recording. |
| ~7 s | Transition | A black blob expands from the left and centre. It covers the left part of the headline while the right part ("XPLORE / SPACE") is still visible. White "Mystery…" text appears inside the black. | Mask or morph reveal, mid-transition. |
| 8–10 s | Mystery state | Black shape fully covers the centre. White heading and paragraph are shown. The cursor ring moves toward Saturn (about 62% x, 28% y). | Stable alternate state, about 2–3 s. |
| ~10–11 s | Transition back | Black shape retracts. An extruded "EX / TH…" slides in from the left over the still-visible Mystery text. | The reverse transition uses a horizontal slide-in for the title. |
| 11–14 s | Hero | Returns to the intro state, then holds. | The video loops. Looping is a recording property, not necessarily a website behavior. |

**Presentation effects to ignore:** the rounded dark device bezel (about 12 px, near-black), the soft gray diagonal light-and-shadow bands across the whole frame, and the light backdrop outside the device. These come from the mockup. Do not build them into the website. The gray bands also tint the page, so the true page background is lighter than it appears in the recording.

---

## C. Overall layout and composition

Layout is a **full-bleed, single-viewport, non-scrolling canvas** (screen aspect about 16:10). Everything is absolutely positioned on layered planes. There is no visible grid. Elements sit on a centre axis or are scattered organically.

Approximate positions are given as % of viewport width (x) and height (y). All are estimates.

- **Header:** logo at the left (x 5–13%, y about 10%). Five nav links right-aligned to about x 95%, vertically centred with the logo. There is no visible bar, border, or background.
- **Headline block:** centred horizontally (x about 31–70%, y about 30–53%), two lines.
- **Subtitle:** centred, two lines, about x 35–65%, y about 62–67%.
- **Byline "James Singleton":** centred, small, about y 76%, slightly left of the subtitle's centre line.
- **Blobs (solid black):**
  - Top-right, large and vertically tall, x 76–98%, y 12–45%, containing Saturn with a few white stars.
  - Left-middle, rounded, x 5–30%, y 20–55%.
  - Bottom-left, large and cropped by the viewport edge, x 0–30%, y 62–100%.
  - Bottom-right, large and cropped, x 78–100%, y 60–100%, behind the astronaut's legs.
  - A narrow sliver at the far left edge (x 0–2%, y about 30–45%).
  - Edges are smooth and irregular, with no sharp corners.
- **Illustrations (all black ink on off-white, or white ink on black):**
  - Astronaut: right side, x 62–95%, y 28–95%, floating and tilted diagonally, in gray-shaded line art.
  - Saturn: upper right, x 70–96%, y 18–35%. Its ring crosses over the right end of the headline.
  - Alien: standing on the left blob's edge, x 6–11%, y 45–68%, waving.
  - Moon: cratered sphere, x 8–18%, y 68–85%, white on black.
  - UFO: x 30–48%, y 68–90%, with thin sketchy beam lines below it.
  - Telescope on tripod: x 58–72%, y 83–100%, cropped at the bottom.
  - Small pebbles and asteroids around the astronaut, and 4-point sparkle stars in the blobs.
- **Layering (back to front):** paper background, blobs, illustrations (moon, UFO, telescope, alien), headline and text, astronaut, Saturn.
- **Density:** the centre is open. Most visual weight sits on the right (astronaut and top-right blob) and bottom-left. Text occupies a small share of the area.
- **Mystery state:** a black shape spans about x 6–80%, y 12–70%, behind the centre content and in front of the hero text. The astronaut and Saturn stay above it. The alien, moon and UFO remain visible over or beside it.

---

## D. Visual system and design tokens

### Colors (all estimated)

| Token | Value | Use |
|---|---|---|
| `--paper` | `#F2F1ED` (slightly warm off-white) | Page background, with a fine noise or grain |
| `--ink` | `#0A0A0A` | Blobs, nav text, subtitle, outlines |
| `--bone` | `#FFFFFF` | Headline fill, text on black, white illustration strokes |
| `--graphite` | `#8E8E8A` to `#B5B5B0` | Astronaut shading and soft gray areas |

The only accent is an off-white or gray ring cursor. There is no color accent, and the page is strictly grayscale.

### Typography

| Role | Observed appearance | Substitute suggestion |
|---|---|---|
| Hero title | Very heavy, slightly condensed, rounded-slab display caps with a vintage poster feel. White fill, thick black outline, and a hard black extruded offset (about 6–8 px, toward the lower-left). | Bowlby One, Chango, or a heavy condensed sans with a stacked `text-shadow` for the extrusion. Do not claim a specific font. |
| Mystery heading | White, a quirky semi-condensed geometric/humanist sans in sentence case. It looks slightly hand-drawn with irregular letterforms. About 2.2× body size. | Any similar friendly semi-condensed face (Mali, Baloo 2, Amaranth). |
| Nav and logo wordmark | Small uppercase, condensed, medium-bold sans. Roughly 7–8 px at the recorded scale (about 11–12 px on a 1280 px page). Moderate tracking. | Oswald, Barlow Condensed, or Bebas Neue at small size. |
| Subtitle and byline | Tiny, wide-tracked (about 0.1em), lowercase or sentence case. Subtitle is centred. Byline is slightly smaller and bolder. | Same family as nav, or a light condensed sans. |
| Mystery paragraph | White, condensed, about 7–8 lines, left-aligned, ragged right, tight leading (about 1.25). | Same family as the Mystery heading. |

- Title: two lines, "EXPLORE" over "THE SPACE". Line-height is very tight (about 0.9, lines nearly touching). Cap height is roughly 11–12% of viewport height per line.
- The "ampersand" in "RESOURCES & EDUCATION" is a stylized, quirky glyph. Use an ordinary `&` if the font lacks one.

### Spacing and geometry

- Outer gutter is about 5% of width.
- The nav gap is about 28–32 px at 1280 px.
- The logo is a spiral or swirl emblem, about 18–20 px, with the wordmark "VOYAGER" about 8 px to its right.
- There are no buttons, inputs, or cards in the reference.
- Corner radii are not applicable. Blob outlines are organic curves.

### Surface treatments

- Subtle paper grain or noise over the off-white (observed as slight speckle).
- Illustrations are flat black ink with line-hatching. No drop shadows are visible on illustrations.
- The headline's extrusion is a hard-edged, blur-free shadow, not a soft one.
- No gradients, glass, or blur appear on the page. The one exception is the motion-blurred planet during the intro, which is a motion effect.

---

## E. Section-by-section specification

### E1. Header
1. **Content:** a spiral logo mark plus the wordmark "VOYAGER" at the left. Nav links: **NEWS, OBSERVING, RESOURCES & EDUCATION, COMMUNITY, ABOUT US**.
2. **Structure:** a flex row, space-between, transparent, with no divider.
3. **Style:** black text, uppercase, small.
4. **Motion:** none shown. No hover or active states are demonstrated.
5. **Observed quirk:** in the Mystery state, the black shape partially covers "COMMUNITY". The nav sits underneath the blob, or its black text is invisible on black.
6. **Responsive:** recommendation only. Collapse to a menu button below about 768 px.

### E2. Hero (default state)
1. **Content:** the title "EXPLORE THE SPACE", the subtitle "Many people sign up for affiliate programs with the hopes of making some serious money.", and the byline "James Singleton".
2. **Subtitle line break:** it breaks after "with the" (line 1: "Many people sign up for affiliate programs with the", line 2: "hopes of making some serious money.").
3. **Placement:** centred on the page's vertical axis. The title is the focal point.
4. **Overlaps:** Saturn's ring crosses over the final "E" of "EXPLORE", and the astronaut's helmet comes close to "SPACE". Both are above the text in z-order.
5. **Illustrations:** as listed in section C. There are no photographs.

### E3. Mystery reveal (alternate state of the same page, not a separate page)
1. **Content:** heading "Mystery: What came before the big bang?" and a paragraph, shown in white on a black shape.
2. **Heading:** centred, two lines ("Mystery: What came before" / "the big bang?"), at about x 30–70%, y 22–35%.
3. **Paragraph:** left-aligned, about x 29–72%, y 38–60%. Clearly legible text (partly truncated or overlapped by the astronaut on the right in the recording): "IT WAS gone almost as soon as it came, so it is hardly surprising that we didn't even notice it. Only in 2007, six years after the event, did Duncan Lorimer at West Virginia University and his student David Narkevic [partly unreadable] … They were scouring archived data from the Parkes radio telescope [partly unreadable] … South Wales, Australia, when they noticed a burst of radio waves of unimaginable ferocity. Lasting less than 5 milliseconds, it hit Earth on [partly unreadable] 2001, releasing roughly as much energy as the sun spits out over five [unreadable]."
4. Use this only as **placeholder copy**. Finish the truncated sentences yourself, mark them as invented, and keep the paragraph to about 7 lines at this width.
5. The astronaut overlaps the right end of the paragraph. Keep that overlap but avoid hiding critical words, for example by wrapping the paragraph narrower than the astronaut's left edge.

---

## F. Reusable components

- **Blob:** an organic black SVG path (`<path>` or `clip-path`), used as the primary shape. Variants differ only by size and position. The expanding shape in the Mystery state should be built from the same blob language: smooth, rounded, with no straight edges.
- **Illustration sprite:** a transparent PNG or SVG of an ink drawing. Each has a transform origin at its centre for drift animations.
- **Sparkle star:** 4-point white star, small, placed inside black areas.
- **Ring cursor:** a circle about 55–60 px wide (about 8% of viewport width at recording scale), with a 2 px white or light-gray outline and a transparent fill. It sometimes has a tiny dot inside, which may be an inner pointer. Observed from about 6 s to about 9 s. Whether it is always present is not shown.
- **Nav link:** text only. No hover, focus, or active styling is demonstrated. If you add any, label it as recommended and make it minimal, for example an underline or opacity change.

---

## G. Interaction and navigation specification

| Element | Trigger | Result | State change / transition | Evidence |
|---|---|---|---|---|
| Ring cursor | Pointer movement | A ring follows the pointer, with a lag or smoothing. | Position eased toward pointer | Observed visually (6–9 s). Whether it exists outside that window is not shown. |
| Left blob (or the area under the cursor at ~6 s) | **Unknown.** Likely click, press, or hover. No click is visible. | Black blob expands, Mystery content appears. | Blob grows from the left to cover the centre in about 1–1.5 s | Observed result, inferred trigger |
| Mystery state | Second click, pointer leave, or timeout | Blob retracts, hero returns, title slides in from left. | Reverse of the above, about 1 s | Observed result, inferred trigger |
| Nav links | Click | Not demonstrated | n/a | Not demonstrated |

**Recommended trigger:** click or tap the left blob to open the reveal, and click anywhere on the black shape, or press Esc, to close. Also support the Enter and Space keys on a focusable button that wraps the blob. Label this clearly as an implementation choice.

Do not create destinations for the nav links. Use `href="#"` placeholders or inert buttons, and do not claim any integration.

---

## H. Animation and scroll behavior

There is no scrolling in the recording. Build the page as a fixed viewport (`100dvh`, `overflow: hidden`), and treat any scrolling as not demonstrated.

1. **Hero intro (0–3 s, plays once on load):**
   - Title: opacity from about 0.1 to 1, with the extruded shadow fading in with it. Duration about 1 s, ease-out.
   - Planet: starts small (about 40%), blurred and near the title's centre, then scales to full size and travels right to its resting position in the top-right blob. The blur clears as it settles. Duration about 2–3 s, ease-out.
2. **Idle drift (continuous, inferred):** the astronaut shifts slightly in position between frames. Add a slow floating animation, for example ±6–12 px vertical drift with ±2–3° rotation over about 6–8 s, ease-in-out, alternating. The other illustrations are stable. Labeled as inferred, and keep it subtle.
3. **Blob reveal (about 1–1.5 s):**
   - A black shape grows from the left blob's area outward, with a rounded, liquid leading edge, until it covers the centre.
   - Hero title and subtitle are covered as it passes. The right portion of the title is still visible mid-transition, so the reveal travels roughly left to right.
   - Mystery heading and paragraph fade or slide in white once the shape covers their area. Easing is smooth.
   - Implement with an SVG `clip-path` or mask, or a scaled blob path. Any approach that gives an organic, expanding black shape is acceptable.
4. **Reveal reversal (about 1 s):** the shape retracts. The extruded title ("EX / TH…") enters from the left with a horizontal translate, from about −20% to 0, and fades in. Hero text returns.
5. **Reduced motion:** if `prefers-reduced-motion: reduce`, skip the intro, drift, and morph. Show the hero immediately and swap states with a short opacity crossfade (about 150 ms).

Do not implement camera zooms, cuts, or the device-bezel shadow movement.

---

## I. Responsive behavior

Only one viewport (about 16:10 desktop or tablet landscape) is demonstrated. Everything below is **recommended**.

- **≥1024 px:** as recorded.
- **768–1023 px:** keep the composition. Scale the title to about 9vw, reduce illustrations proportionally, and keep the nav inline if it fits.
- **<768 px:** collapse the nav into a single menu button. Keep the title centred, scaled to about 14–16vw. Reduce or hide the telescope and UFO if crowded, and stack the Mystery paragraph at a narrower width with `font-size` about 14–15 px. Make the paragraph scroll within the black shape if it overflows. Use `dvh` units.
- Illustrations should use `object-fit: contain`, and the page must never scroll horizontally.

---

## J. Content and asset inventory

No assets were supplied. Create or source the following in black-and-white ink style:

- Logo: spiral mark, plus wordmark "VOYAGER".
- Illustrations (transparent, vector preferred): astronaut (gray-shaded, floating), ringed planet (white on black, striped body), alien (waving, line art), cratered moon (white on black), UFO with beam lines, small telescope on tripod, 4-point sparkle, and a few small rocks or asteroids.
- Textures: subtle paper noise, which can be a tiled PNG or an SVG `feTurbulence` filter.
- Fonts: substitutes as per section D.
- Visible text: as transcribed above. The nav, title, subtitle, byline and Mystery heading are readable. The Mystery paragraph is partly unreadable.

Do not fabricate asset URLs. If exact artwork cannot be produced, use simple SVG stand-ins and say so.

---

## K. Implementation requirements

- Use plain HTML, CSS and a small amount of JavaScript, or a lightweight framework if the project already uses one. No heavy dependencies are required, and no backend.
- Centralize colors, type sizes and timings as CSS variables.
- Use semantic markup: `<header>`, `<nav>`, `<main>`, `<h1>` for the title, `<h2>` for the Mystery heading.
- Build the reveal as a real functional control, not a looped video or GIF.
- Illustrations are decorative, with `alt=""` (or `aria-hidden`), unless they convey meaning.

---

## L. Accessibility and performance

- The reveal control must be a keyboard-focusable `<button>` with a visible focus ring, and an accessible name such as "Open article: Mystery". Closing works with Esc and a close control.
- When the Mystery panel opens, move focus to its heading and return focus to the trigger on close.
- Contrast: white text on black is fine. The tiny subtitle (about 8 px in the recording) must be at least about 12–13 px on real screens. This is an accessibility adjustment from the reference.
- Do not hide the nav behind the blob in a way that makes it unreadable. Recommended fix: lift the nav above the blob and give it a white color (or `mix-blend-mode: difference`) when the panel is open. This departs from the reference, so mark it as such.
- Provide `prefers-reduced-motion` behavior as in section H.
- Use `will-change` or `transform` for animations, and avoid layout shifts by giving illustrations fixed aspect ratios.
- Optimize images (SVG preferred, or WebP/PNG at 2× maximum).

---

## M. Visual verification and acceptance criteria

Compare your build against the reference frames at about 1280×800 for these states: intro (about 0–1 s), settled hero (about 4 s), mid-reveal (about 7 s), full Mystery state (about 9 s), and return transition (about 10–11 s). Prioritize fixes in this order:

1. Composition: centred title, correct placement of the blobs and illustrations, and the layering.
2. Typography and illustration scale: the extruded title, and Saturn and the astronaut sizes and overlaps.
3. Spacing: nav alignment, centred subtitle and byline, and the gaps between title and subtitle.
4. Color and texture: strict monochrome, paper grain, and the astronaut's gray shading.
5. Motion: intro, reveal and reversal sequence.

The work is complete when:
- The hero matches the reference composition and section content.
- The reveal opens and closes on interaction, shows the correct heading and paragraph, and returns to the hero.
- No horizontal overflow occurs at any width, and no unresolved placeholders are left without a label.
- Reduced-motion behavior works.

Do not claim a pixel-perfect match, and report only comparisons you have actually made.

---

## N. Assumptions and unresolved details

**Essential for visual fidelity**
- Exact illustration artwork is unavailable. The astronaut, Saturn, alien, moon, UFO and telescope must be redrawn or substituted.

**Minor, resolve during implementation**
- All colors, sizes, positions and timings are approximations from 800×600 video frames.
- Font identity is unknown. Use the substitutes listed.
- The reveal trigger (click, hover or timed) is not shown. A click-to-open, click-or-Esc-to-close behavior is recommended.
- The Mystery paragraph is partially unreadable. Complete it with clearly labeled placeholder copy.
- The ring cursor's visibility outside 6–9 s is unknown. Show it only on pointer devices if you include it.
- Whether the astronaut and other illustrations drift continuously is inferred from small position changes between frames.
- The video loop, the device bezel, the diagonal gray light bands, and the mockup backdrop are presentation effects and are not part of the site.
- Nav hover, active and focus states, responsive layouts, and nav destinations are not demonstrated.
- The 14-second loop may be an edited demonstration rather than a real user session.