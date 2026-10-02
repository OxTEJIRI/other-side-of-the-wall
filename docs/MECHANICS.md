# Mechanics

The player cannot win by acting. The only scoring event is time spent holding. There is no high score, no leaderboard, no name entry.

## State machine

```
stare --3s--> ready --flip--> flipping --700ms--> holding --20s--> end
                                              \
                                               tap character --> sold --1.6s--> end
end --stare again--> stare
```

Illegal input is ignored. Mashing during `stare` does nothing. That is intentional.

## Clock

- One `requestAnimationFrame` loop
- State enters record `performance.now()`
- Timer display floors elapsed holding time to whole seconds
- Tab hidden: pause the loop. Do not bank offline time.

## Crumbs

- Spawn only in `holding`
- First at 1200ms, then every 2400ms
- Each spawn is tied to the next trader name
- A crumb has two phases: `air` (400ms) then `landed`
- On sell, delete `air` crumbs. Keep `landed`.
- Visible landed crumbs cap at 8. Further lands increment `pileCount` and do not add nodes.
- `pileCount` includes the visible ones. The end card shows the count if it is over 8: `and {n} more`

## What the 3% means, in the fiction

Say it once, on the end card subline, not as a lecture.

The real mechanism, so the joke stays accurate:

- $STONK spelled backward is $KNOTS. Same letters.
- Every transfer of $KNOTS takes a 3% tax.
- After a cut for distribution costs, holders are paid in $STONK, pro-rata.
- Nothing to stake, nothing to claim.
- A holder needs about $20 of $KNOTS at the snapshot to receive a payout.
- Payouts only exist if other people transfer. They can be small or stop.

Do not simulate the $20 minimum. Do not simulate price. The crumb is the whole lesson.

## Sell

Hit target is the character SVG only, plus a 12px padding. Tapping the wall, the caption, or empty stage does not sell. People will tap those. Let them.

## Replay

Reset pile, timer, trader index, caption, and wall face. Do not keep a best time.

## Share card contents

- Character, static, frown
- Knotted wall
- Up to 8 coins
- The branched headline
- The branched subline
- `other side of the wall`
- No timer on the card. The card is the meme, not a score screenshot.

## Debug

`KeyD` cycles states forward. Strip it behind `import.meta.env.DEV` so the production build does not include it.

## Acceptance checks

- Fresh load shows the stare caption and no button.
- Button appears at 3 seconds without input.
- Flip cannot be triggered twice.
- Selling at 2 seconds shows `you folded before the crumb.`
- Holding to 20 seconds shows `I did not press sell.`
- Save downloads a PNG that contains that headline.
- Disclaimer is present in both runs.
