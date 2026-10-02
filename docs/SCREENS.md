# Screens

One stage. States swap the contents. Do not route between pages.

## Wireframe, shared chrome

```
+----------------------------------+
| [speaker]            [nothing: 0s]|
|                                  |
|   (o_o)          +----------+    |
|   /|||\          |  $STONK  |    |
|    / \           |  candles |    |
|                  |          |    |
|                  +----------+    |
|                                  |
|  bro is waiting for the breakout |
|                                  |
|         [ FLIP THE WALL ]        |
|                                  |
|  disclaimer in 11px              |
+----------------------------------+
```

Character always left third. Wall always right half. Caption always bottom-center, above the button slot. The button slot is reserved from the start so the caption does not jump when the button appears.

## 1. stare

Duration: 3000ms, then auto-advance to `ready`.

- Wall reads `$STONK`
- Seven static green candles
- Character looks at the wall. Flat mouth.
- Caption: `bro is waiting for the breakout`
- No button yet
- Timer hidden
- A tiny muted line under the caption, after 1.5s: `the candles are not going to do it`

## 2. ready

- Same picture
- Button fades in
- Caption stays
- Click, tap, Enter, or Space fires the flip
- If the player waits another 4 seconds without flipping, caption swaps to `you can keep staring. the candles support you.`

## 3. flipping

700ms. Input locked.

- Wall rotates on Y
- Letters scramble through the frames in `docs/COPY.md`, then settle on `$KNOTS`
- Candles leave with the front face
- Character mouth opens
- Caption: `same letters. other side.`

## 4. holding

The game. Runs until the player taps the character, or until 20s, whichever first.

- Wall shows `$KNOTS` and the knot
- Caption: `do not touch anything. that is the whole strategy.`
- Timer visible, increments every second
- Traders cross the far side. On each trader, one crumb spawns, arcs over, lands as `$STONK`
- First crumb at 1.2s, then every 2.4s
- Character frown starts on the second crumb
- At 8s, a one-line aside replaces the caption for 2s, then the strategy line returns: `he is offended that this worked.`
- Tapping or clicking the character goes to `sold`
- At 20s, auto-advance to `end`

## 5. sold

Immediate.

- Crumbs in the air vanish. Landed pile stays.
- Timer freezes
- Character takes one step left, then stops. That step is the sell.
- A trader still on the far side gets a speech chip: `skill issue`
- Caption depends on the frozen timer. See `docs/COPY.md`.
- After 1600ms, go to `end`

## 6. end

The meme. This is what gets posted.

- Stage dims to 80% behind a card that fills the stage inset
- Card contents are the share-card composition, scaled down
- Headline and subline from `docs/COPY.md`, branched on whether they sold
- Two text buttons, side by side, secondary style (outline, not lime):
  - `save the meme`
  - `stare again`
- `stare again` resets to `stare`
- Disclaimer remains visible under the card

## Empty and edge

- If JS fails, the HTML shows the end-card copy as plain text and the disclaimer. No blank page.
- If the font is blocked, fall back to `ui-monospace` for display and `system-ui` for body.
- No landscape-specific layout. If the phone is landscape, keep the stage centered and scroll.
