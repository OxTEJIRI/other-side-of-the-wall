// State machine from docs/MECHANICS.md.
//
//   stare --3s--> ready --flip--> flipping --700ms--> holding --20s--> end
//                                                       \
//                                                        tap character --> sold --1.6s--> end
//   end --stare again--> stare
//
// Time is a game clock that only advances while the tab is visible,
// so hidden time is never banked.

export const STARE_MS = 3000
export const READY_NAG_MS = 4000
export const FLIP_MS = 700
export const HOLD_MS = 20000
export const SOLD_MS = 1600
export const FIRST_CRUMB_MS = 1200
export const CRUMB_EVERY_MS = 2400
export const AIR_MS = 400
export const PILE_CAP = 8
export const STATES = ['stare', 'ready', 'flipping', 'holding', 'sold', 'end']

export function createGame({ on = () => {} } = {}) {
  const g = {
    state: 'stare',
    clock: 0, // ms of visible time since load
    enteredAt: 0,
    holdMs: 0, // time spent in holding; frozen on sell
    spawned: 0, // crumbs spawned this run, also the trader index
    crumbs: [], // { id, bornAt, landed }
    pileCount: 0,
    sold: false,
  }

  function enter(state) {
    g.state = state
    g.enteredAt = g.clock
    on(state, g)
  }

  function reset() {
    g.holdMs = 0
    g.spawned = 0
    g.crumbs = []
    g.pileCount = 0
    g.sold = false
  }

  function tickHolding() {
    g.holdMs = Math.min(g.clock - g.enteredAt, HOLD_MS)

    // Each crumb is scheduled at a fixed time and tied to one trader.
    while (FIRST_CRUMB_MS + g.spawned * CRUMB_EVERY_MS <= g.holdMs) {
      g.crumbs.push({
        id: g.spawned,
        bornAt: FIRST_CRUMB_MS + g.spawned * CRUMB_EVERY_MS,
        landed: false,
      })
      g.spawned++
    }

    for (const c of g.crumbs) {
      if (c.landed || g.holdMs - c.bornAt < AIR_MS) continue
      c.landed = true
      g.pileCount++
      on('land', g)
    }
    // Only 8 coins stay on screen. pileCount keeps counting.
    const landed = g.crumbs.filter((c) => c.landed)
    if (landed.length > PILE_CAP) {
      const drop = new Set(landed.slice(PILE_CAP).map((c) => c.id))
      g.crumbs = g.crumbs.filter((c) => !drop.has(c.id))
    }

    if (g.holdMs >= HOLD_MS) enter('end')
  }

  const api = {
    g,

    get stateMs() {
      return g.clock - g.enteredAt
    },

    update(dt) {
      g.clock += dt
      const t = g.clock - g.enteredAt
      if (g.state === 'stare' && t >= STARE_MS) enter('ready')
      else if (g.state === 'flipping' && t >= FLIP_MS) enter('holding')
      else if (g.state === 'holding') tickHolding()
      else if (g.state === 'sold' && t >= SOLD_MS) enter('end')
    },

    // Illegal input is ignored. That is intentional.
    flip() {
      if (g.state !== 'ready') return false
      enter('flipping')
      return true
    },

    sell() {
      if (g.state !== 'holding') return false
      g.sold = true
      g.crumbs = g.crumbs.filter((c) => c.landed)
      enter('sold')
      return true
    },

    restart() {
      if (g.state !== 'end') return false
      reset()
      enter('stare')
      return true
    },
  }

  // Dev only: KeyD walks the graph forward. Stripped from production builds.
  if (import.meta.env.DEV) {
    api.debugNext = () => {
      const s = g.state
      if (s === 'stare') enter('ready')
      else if (s === 'ready') api.flip()
      else if (s === 'flipping') enter('holding')
      else if (s === 'holding') api.sell()
      else if (s === 'sold') enter('end')
      else api.restart()
    }
  }

  return api
}

export const timerSeconds = (g) => Math.floor(g.holdMs / 1000)
