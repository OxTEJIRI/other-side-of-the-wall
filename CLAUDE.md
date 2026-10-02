# Claude Code brief

Build "Other Side of the Wall", a single-page meme game. Read every file in `docs/` before writing code. Follow them. Do not invent a dashboard, a tutorial modal, a wallet connect, or a score attack.

## Done when

- `npm run dev` opens one screen that plays the whole joke with no instructions.
- Keyboard, mouse, and tap all work.
- A 390px-wide phone layout is the primary design. Desktop centers the same phone stage, max 420px, on the dark page background.
- The end card can be saved as a PNG.
- `npm run build` emits a static `dist/` that works on GitHub Pages (relative asset paths).
- No backend, no wallet, no analytics, no external API.

## Stack

- Vite + vanilla JS. No React. No framework.
- One canvas or DOM stage. DOM is fine if motion stays at 60fps. Prefer DOM + CSS for text crispness.
- Google fonts, loaded from the HTML: `Silkscreen` for display, `Outfit` for body.
- All copy comes from `docs/COPY.md`. Do not rewrite the jokes.
- Colors, type, spacing, and motion come from `docs/DESIGN.md`.

## Repo layout to create

```
index.html
package.json
vite.config.js
src/main.js
src/style.css
src/game.js          state machine
src/render.js        DOM updates
src/copy.js          strings, imported as data
public/favicon.svg
```

Keep it small. A competent reader should understand `game.js` in one sitting.

## Build order

1. State machine from `docs/MECHANICS.md`, with a debug key (`KeyD`) that jumps states.
2. Screens from `docs/SCREENS.md`, unstyled but complete.
3. Visual system from `docs/DESIGN.md`.
4. Motion.
5. Share-card export.
6. Footer disclaimer.

## Hard rules

- The first three seconds must be boring on purpose. Do not fill them with animation that explains the game.
- There is one real button: FLIP THE WALL. Selling is tapping the character, not a second equal button.
- Never say "APY", "yield", or "guaranteed".
- Never ask the player to connect a wallet or buy anything.
- The end card is the meme. It must read with the sound off.
