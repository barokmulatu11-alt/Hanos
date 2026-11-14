# Hanos — illustrated space presentation

The illustrated landing page is restored: Hanos’s logo, the original extruded title, astronaut, alien, ringed planet, moon, UFO, telescope, rocks, and a three-chapter scroll story. The presentation retains the Planet X and SPHEREx context and the blank team project area.

## Open locally

Open `dist/index.html` in a browser. No installation or build step is required. Or serve it with:

```sh
python3 -m http.server 8080 --directory dist
```

## Continuous flow

The hero’s lower black shapes extend past its viewport into the shared paper surface. They have organic closing contours rather than flat cropped edges; the telescope and illustrations can also pass the former section boundary. The introduction has no border or separate background. Gentle hero parallax leads into the pinned moon, Saturn, and astronaut scenes. The final dark section grows from a curved edge instead of a rectangular color break.

Native scrolling, chapter anchors, touch, and keyboard navigation remain intact. The scroll handler caches geometry and schedules one frame per update. Reduced-motion preferences remove drift, parallax, transforms, and crossfades.

## Interaction and content

Click/tap the left black blob, or focus it and press Enter/Space, to read the challenge. Close with Escape, the close control, Back to exploring, or the empty dark surface. Opening from the footer preserves the original scroll position and focus when closed. Lower-page controls are inert while the challenge is open. The mobile menu and every navigation link have real section targets.

The Hanos project name, solution, demo link, repository, and results remain intentionally blank in `data-project-blank`. Mission and challenge facts are grounded in the sources listed in `SOURCES.md`; the illustrations are decorative and are not mission imagery or scientific evidence.

## Assets and verification

The illustrations use inline SVG clips over the user-supplied reference, cached once as `assets/reference.webp`. The original title font was restored from its saved vector lettering. Fonts are self-hosted and licenses are included.

Checks cover asset references, anchors, art names, mobile navigation, reveal focus/scroll restoration, interrupted transitions, reverse scrolling, chapter progress, resizing, and reduced motion. Browser rendering remains unverified because this environment blocks browser startup and local network sockets. Publication remains incomplete because the required source Git host cannot resolve. The Site identity is preserved in `.openai/hosting.json`.

The previous version is saved separately at `../versions/Hanos-before-illustration-restore.zip`.
