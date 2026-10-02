> **Redesign v2 (supersedes the sections below where they conflict).**
> - Full-viewport stage, not a framed 390x780 phone. Phones stack the scene over the caption and button. At 900px and up the layout splits: caption and button on the left, large scene on the right.
> - Futuristic chamber: perspective grid floor, corner HUD brackets, glass wall slab with a glow (ice before the flip, lime after), a lime scan beam during the flip. The character stays flat with thick outlines on purpose.
> - Display type is Unbounded (replaces Silkscreen). Body stays Outfit.
> - Optional voiceover, off by default, using the browser speech engine (no files, no network). Script lives in `src/copy.js` under `voice`. It never says APY, yield, or guaranteed.

# Design system

Tone: deadpan crypto meme. Not a fintech app, not a kid's cartoon, not pixel-art cosplay of an existing meme coin. Flat shapes, thick outlines, one character, one wall.

The contest poster is the palette source: near-black navy, ice blue, lime, a yellow pill. The character is a cousin of the red dither-hoodie guy already circulating in contest entries, but original: round head, red cap, red hoodie, dot eyes, no trademarked face.

## Stage

- Page background: `#070b14`
- Phone stage: 390 x 780, centered, radius 28px, border `1px solid #1c2740`
- Safe padding inside the stage: 20px
- On viewports under 420px, the stage is `100vw` by `100dvh`, no radius, no page chrome

## Color

| Token | Hex | Use |
|---|---|---|
| bg | `#0b1020` | stage fill |
| bg-2 | `#12182b` | wall, panels |
| line | `#24304d` | hairline borders |
| text | `#f4f1ea` | primary type |
| muted | `#8b93a7` | secondary type |
| stonk | `#8fd0ff` | $STONK, crumbs after they land, candles |
| knots | `#c6ff4a` | $KNOTS, the flip button, the knot |
| yolk | `#f0d56a` | timer pill, rare emphasis |
| red | `#e23b3b` | character hoodie |
| red-dark | `#9d2424` | hoodie shadow, cap brim |
| danger | `#ff6b6b` | the sell state only |

Do not add gradients except a very soft top vignette on the stage (`#0b1020` to `#10182e`). No glassmorphism. No neon glow except a 8px `knots` shadow on the flip button.

## Type

- Display: `Silkscreen`, 400. Headers, the button, the end-card lines.
- Body: `Outfit`, 500 and 600. Captions, trader names, disclaimer.
- Display tracking: `-0.02em` is too tight for Silkscreen. Use `0`.
- Caption size: 18px Outfit, line-height 1.25, max two lines.
- End-card headline: 22px Silkscreen, line-height 1.35.
- Never all-caps a full sentence. All-caps is for the button and the tickers only.

## Character

Draw him in SVG, inline. Do not use a generated bitmap.

- Head: 72px circle, `#f3d2b5`, 3px `#1a1a1a` stroke
- Eyes: two 10px circles, pupils shift to whatever he is looking at
- Mouth: a 14px flat line while waiting; a 16px open oval on the flip; a small frown when crumbs land (he is offended that it worked)
- Cap: red, brim forward, slight tilt
- Hoodie: red torso 84 x 70, rounded, two white dot buttons
- Idle: 2px vertical bob, 1.6s ease-in-out, infinite
- He never walks. Walking is selling.

## Wall

- A rounded rect, 168 x 460, `#1a2236`, 3px `#1a1a1a` stroke, sitting right of the character
- Mortar lines: 8 horizontal, 2px, `#2a3654`
- Front face text, centered, Silkscreen 20px: `$STONK` before the flip, `$KNOTS` after
- Candles on the front face only: 7 green rects, heights 28 to 70, no wicks that move. They are decoration. They must not animate like a chart. A single candle may blink once every 4 seconds. That is the joke.
- After the flip, the candle face is gone. The wall has one overhand knot drawn with a 10px lime stroke. Keep the knot simple: one loop, two ends.

## Crumbs

- Before landing: 22px circle, `#f4f1ea`, 2px stroke, label `3%` in 9px Outfit
- After landing: same circle, fill `stonk`, label `$STONK`
- They arc over the wall (180ms up, 220ms down) and stack at his feet, max 8 visible, then the pile number increments
- A crumb only spawns while state is `holding`

## Traders

Tiny pills walking the far side of the wall, 11px Outfit, `#8b93a7` on a `#1c2438` chip. They exist to be the reason a crumb appears. Names are in `docs/COPY.md`. One on screen at a time. They enter from the right, cross in 2.4s, leave. No faces required. A 8px circle is enough.

## Button

One button.

- Label: `FLIP THE WALL`
- Background `#c6ff4a`, text `#11160a`, Silkscreen 13px, padding 14px 18px, radius 999px
- 3px black stroke, offset shadow `4px 4px 0 #11160a`
- Press: translate 2px 2px, shadow shrinks to 2px
- Hidden until state `ready`
- Disabled and gone after the flip. It does not come back on replay until the run resets.

## Timer pill

Top right. Yolk background, black text, Outfit 12px 700.

`doing nothing: 0s`

It only increments in `holding`. It freezes on sell.

## Footer

Outside the joke, under the stage on desktop, inside the stage at the bottom on mobile, 11px muted:

`A joke about a transfer tax. Not yield. Not advice. Payouts depend on other people moving the token.`

## Motion

| Moment | Duration | Curve |
|---|---|---|
| Stare hold before button | 3000ms | linear, nothing else |
| Button in | 180ms | ease-out, translateY 8px to 0 |
| Wall flip | 700ms | cubic-bezier(.6,-0.2,.4,1.2), rotateY 0 to 180 |
| Letter scramble | during the flip, 5 frames of wrong letters | steps(5) |
| Crumb arc | 400ms | ease-in |
| Sell flinch | 120ms shake, 3px | linear |
| End card in | 240ms | ease-out |

Reduced motion: if `prefers-reduced-motion`, cut the flip to a 100ms crossfade and do not shake.

## Sound

Off by default. A small speaker toggle, top left, muted icon.

If implemented, three sounds only, each under 200ms, synthesized in the Web Audio API, no files:

- flip: a short downward blip
- crumb: a soft coin tick
- sell: a sad slide

No music.

## Share card

A hidden 1080x1080 layout rendered to canvas on demand.

Background `#0b1020`. Character left. Knotted wall right. Pile of coins. Exact end-card copy from `docs/COPY.md`. Bottom right, 18px muted: `other side of the wall`.

Button under the end card: `save the meme`. Downloads `i-did-not-press-sell.png`.

## Do not

- No loading splash with a logo animation
- No particle burst on the flip
- No confetti
- No "you earned APY"
- No live price
- No copy that asks the player to buy
