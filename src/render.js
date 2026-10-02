// DOM updates. Builds the stage once, then syncs it to game state every frame.
// The character and the knot are plain shape data so the inline SVG and the
// share-card canvas draw the same picture.

import { COPY } from './copy.js'
import { FLIP_MS, HOLD_MS, CRUMB_EVERY_MS, AIR_MS, PILE_CAP, timerSeconds } from './game.js'

const C = {
  bg: '#0b1020',
  wall: '#1a2236',
  mortar: '#2a3654',
  text: '#f4f1ea',
  muted: '#8b93a7',
  stonk: '#8fd0ff',
  knots: '#c6ff4a',
  danger: '#ff6b6b',
  ink: '#1a1a1a',
  skin: '#f3d2b5',
  red: '#e23b3b',
  redDark: '#9d2424',
  denim: '#24304d',
}
const DISPLAY = 'Unbounded, ui-monospace, monospace'
const BODY = 'Outfit, system-ui, sans-serif'

// ---------- character: 130 x 210, faces right toward the wall ----------

const CHAR_W = 130
const CHAR_H = 210
const CHARACTER = [
  { t: 'rect', x: 44, y: 164, w: 16, h: 32, rx: 4, fill: C.denim, sw: 3 },
  { t: 'rect', x: 70, y: 164, w: 16, h: 32, rx: 4, fill: C.denim, sw: 3 },
  { t: 'rect', x: 40, y: 192, w: 22, h: 10, rx: 5, fill: C.ink },
  { t: 'rect', x: 68, y: 192, w: 26, h: 10, rx: 5, fill: C.ink },
  { t: 'circle', cx: 65, cy: 66, r: 42, fill: C.redDark, sw: 3 }, // hood
  { t: 'rect', x: 13, y: 106, w: 20, h: 56, rx: 10, fill: C.red, sw: 3 },
  { t: 'rect', x: 97, y: 106, w: 20, h: 56, rx: 10, fill: C.red, sw: 3 },
  { t: 'circle', cx: 23, cy: 164, r: 7, fill: C.skin, sw: 3 },
  { t: 'circle', cx: 107, cy: 164, r: 7, fill: C.skin, sw: 3 },
  { t: 'rect', x: 23, y: 98, w: 84, h: 70, rx: 20, fill: C.red, sw: 3 }, // torso
  { t: 'rect', x: 40, y: 138, w: 50, h: 22, rx: 8, fill: C.redDark, sw: 2 },
  { t: 'circle', cx: 65, cy: 111, r: 3.2, fill: C.text },
  { t: 'circle', cx: 65, cy: 123, r: 3.2, fill: C.text },
  { t: 'circle', cx: 65, cy: 62, r: 36, fill: C.skin, sw: 3 }, // head
  { t: 'circle', cx: 58, cy: 64, r: 5, fill: '#fff', sw: 2 },
  { t: 'circle', cx: 80, cy: 64, r: 5, fill: '#fff', sw: 2 },
  {
    t: 'g',
    cls: 'pupils',
    kids: [
      { t: 'circle', cx: 58, cy: 64, r: 2.4, fill: C.ink },
      { t: 'circle', cx: 80, cy: 64, r: 2.4, fill: C.ink },
    ],
  },
  { t: 'path', cls: 'm-flat', d: 'M63 85 H77', sw: 3 },
  { t: 'ellipse', cls: 'm-open', cx: 70, cy: 86, rx: 8, ry: 6, fill: C.ink },
  { t: 'path', cls: 'm-frown', d: 'M63 89 Q70 81 77 89', sw: 3 },
  {
    t: 'g',
    rot: [-6, 65, 40], // cap, brim forward, slight tilt
    kids: [
      { t: 'path', d: 'M28 50 C28 10 102 10 102 50 Z', fill: C.red, sw: 3 },
      { t: 'path', d: 'M90 45 L124 49 Q129 57 120 58 L88 54 Z', fill: C.redDark, sw: 3 },
      { t: 'circle', cx: 65, cy: 16, r: 3.5, fill: C.redDark, sw: 2 },
    ],
  },
]

// One loop, two ends. At the crossing, the over-strand gets its black outline
// redrawn, then the whole over-strand is restroked in lime so no seams show.
const KNOT_D = 'M10 110 C30 90 60 60 60 40 C60 15 30 15 30 40 C30 60 70 85 110 110'
const KNOT_CROSS = 'M39.7 59.2 L55 73.1'
const KNOT_OVER = 'M30 40 C30 60 70 85 110 110'

function svgShape(s) {
  const cls = s.cls ? ` class="${s.cls}"` : ''
  if (s.t === 'g') {
    const tf = s.rot ? ` transform="rotate(${s.rot.join(' ')})"` : ''
    return `<g${cls}${tf}>${s.kids.map(svgShape).join('')}</g>`
  }
  const paint =
    `fill="${s.fill || 'none'}"` +
    (s.sw ? ` stroke="${C.ink}" stroke-width="${s.sw}" stroke-linecap="round" stroke-linejoin="round"` : '')
  if (s.t === 'rect')
    return `<rect${cls} x="${s.x}" y="${s.y}" width="${s.w}" height="${s.h}" rx="${s.rx || 0}" ${paint}/>`
  if (s.t === 'circle') return `<circle${cls} cx="${s.cx}" cy="${s.cy}" r="${s.r}" ${paint}/>`
  if (s.t === 'ellipse')
    return `<ellipse${cls} cx="${s.cx}" cy="${s.cy}" rx="${s.rx}" ry="${s.ry}" ${paint}/>`
  return `<path${cls} d="${s.d}" ${paint}/>`
}

function paintShape(ctx, s, opts) {
  if (s.cls && opts.skip.includes(s.cls)) return
  ctx.save()
  if (s.t === 'g') {
    if (s.rot) {
      const [a, cx, cy] = s.rot
      ctx.translate(cx, cy)
      ctx.rotate((a * Math.PI) / 180)
      ctx.translate(-cx, -cy)
    }
    if (s.cls === 'pupils') ctx.translate(...opts.pupils)
    s.kids.forEach((k) => paintShape(ctx, k, opts))
    ctx.restore()
    return
  }
  const p = s.t === 'path' ? new Path2D(s.d) : new Path2D()
  if (s.t === 'rect') roundRect(p, s.x, s.y, s.w, s.h, s.rx || 0)
  if (s.t === 'circle') p.arc(s.cx, s.cy, s.r, 0, Math.PI * 2)
  if (s.t === 'ellipse') p.ellipse(s.cx, s.cy, s.rx, s.ry, 0, 0, Math.PI * 2)
  if (s.fill) {
    ctx.fillStyle = s.fill
    ctx.fill(p)
  }
  if (s.sw) {
    ctx.strokeStyle = C.ink
    ctx.lineWidth = s.sw
    ctx.lineCap = ctx.lineJoin = 'round'
    ctx.stroke(p)
  }
  ctx.restore()
}

function roundRect(p, x, y, w, h, r) {
  p.moveTo(x + r, y)
  p.arcTo(x + w, y, x + w, y + h, r)
  p.arcTo(x + w, y + h, x, y + h, r)
  p.arcTo(x, y + h, x, y, r)
  p.arcTo(x, y, x + w, y, r)
  p.closePath()
}

const characterSVG = () =>
  `<svg class="char-svg" viewBox="0 0 ${CHAR_W} ${CHAR_H}" width="${CHAR_W}" height="${CHAR_H}" aria-hidden="true">${CHARACTER.map(svgShape).join('')}</svg>`

const knotSVG = () => `<svg class="knot" viewBox="0 0 120 120" aria-hidden="true" fill="none" stroke-linecap="round">
  <path d="${KNOT_D}" stroke="${C.ink}" stroke-width="16"/>
  <path d="${KNOT_D}" stroke="${C.knots}" stroke-width="10"/>
  <path d="${KNOT_CROSS}" stroke="${C.ink}" stroke-width="16" stroke-linecap="butt"/>
  <path d="${KNOT_OVER}" stroke="${C.knots}" stroke-width="10"/>
</svg>`

// ---------- wall: 168 x 460 ----------

const mortarSVG = () => {
  const lines = Array.from({ length: 8 }, (_, i) => {
    const y = Math.round((460 * (i + 1)) / 9)
    return `<line x1="0" x2="168" y1="${y}" y2="${y}"/>`
  }).join('')
  return `<svg class="mortar" viewBox="0 0 168 460" preserveAspectRatio="none" aria-hidden="true">${lines}</svg>`
}

// Seven static candles. Decoration, not a chart. Only the last one blinks.
const CANDLE_H = [28, 40, 34, 52, 44, 62, 70]
const candlesSVG = () => {
  const bars = CANDLE_H.map((h, i) => {
    const x = 18 + i * 20
    const bottom = 220 - i * 22
    const cls = i === 6 ? ' class="blink"' : ''
    return `<g${cls}><line x1="${x + 6}" x2="${x + 6}" y1="${bottom - h - 8}" y2="${bottom + 6}"/><rect x="${x}" y="${bottom - h}" width="12" height="${h}" rx="2"/></g>`
  }).join('')
  return `<svg class="candles" viewBox="0 0 168 240" aria-hidden="true">${bars}</svg>`
}

// ---------- scene geometry (350 x 500 design px, ground at y=500) ----------

const SCENE_W = 350
const SCENE_H = 500
const CHAR_TOP = SCENE_H - 206
const EYES = [69, CHAR_TOP + 64]
const SLOTS = [
  [120, 489], [142, 489], [164, 489], [186, 489],
  [131, 470], [153, 470], [175, 470],
  [153, 451],
]
const traderX = (p) => 372 - 222 * p
const CRUMB_START = [traderX(0.5) + 14, 34]
const CRUMB_PEAK = 8

function crumbPos(age, slot) {
  const [sx, sy] = CRUMB_START
  const [ex, ey] = SLOTS[slot]
  if (age < 180) {
    const k = 1 - (1 - age / 180) ** 2
    return [sx + (ex - sx) * 0.45 * k, sy + (CRUMB_PEAK - sy) * k]
  }
  const k = Math.min(1, (age - 180) / 220) ** 2
  return [sx + (ex - sx) * (0.45 + 0.55 * k), CRUMB_PEAK + (ey - CRUMB_PEAK) * k]
}

export function soldCaption(sec) {
  if (sec < 5) return COPY.caption.soldEarly
  if (sec <= 12) return COPY.caption.soldMid
  return COPY.caption.soldLate
}

// ---------- mount ----------

export function mount(root, game) {
  root.innerHTML = `
  <main class="stage" data-state="stare">
    <i class="hud tl"></i><i class="hud tr"></i><i class="hud bl"></i><i class="hud br"></i>
    <header class="bar">
      <div class="tools">
        <button class="speaker" type="button" aria-label="sound effects" aria-pressed="false">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path class="spk" d="M4 9h4l5-4v14l-5-4H4z"/><path class="off" d="M17 9l5 6M22 9l-5 6"/><path class="on" d="M17 8.5a5 5 0 0 1 0 7M19.5 6a8.5 8.5 0 0 1 0 12"/></svg>
        </button>
        <button class="voice" type="button" aria-label="voiceover" aria-pressed="false" hidden>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 10v4M8 7v10M12 4v16M16 8v8M20 11v2"/></svg>
          <span>voiceover</span>
        </button>
      </div>
      <div class="timer" aria-live="off"></div>
    </header>
    <div class="meter"><i></i></div>
    <div class="scene-box">
      <div class="floor" aria-hidden="true"></div>
      <div class="scene">
        <div class="trader"><i></i><span></span><b class="say">${COPY.skillIssue}</b></div>
        <div class="wall">
          <div class="wall-inner">
            <div class="face front">${mortarSVG()}<div class="ticker">${COPY.tickerBefore}</div>${candlesSVG()}</div>
            <div class="face back">${mortarSVG()}<div class="ticker">${COPY.tickerAfter}</div>${knotSVG()}</div>
          </div>
        </div>
        <button class="char" type="button" aria-label="sell">
          <div class="bob">${characterSVG()}</div>
        </button>
        <div class="crumbs"></div>
      </div>
    </div>
    <div class="copy">
      <div class="captions">
        <p class="caption" aria-live="polite"></p>
        <p class="aside"></p>
      </div>
      <div class="slot">
        <button class="flip" type="button" disabled>${COPY.button.flip}</button>
      </div>
    </div>
    <section class="end" hidden>
      <div class="card">
        <canvas width="1080" height="1080" role="img"></canvas>
        <div class="end-actions">
          <button class="save" type="button">${COPY.button.save}</button>
          <button class="again" type="button">${COPY.button.again}</button>
        </div>
      </div>
    </section>
    <footer class="disclaimer">${COPY.disclaimer}</footer>
  </main>`

  const $ = (s) => root.querySelector(s)
  const els = {
    stage: $('.stage'),
    speaker: $('.speaker'),
    voice: $('.voice'),
    timer: $('.timer'),
    meter: $('.meter'),
    sceneBox: $('.scene-box'),
    scene: $('.scene'),
    trader: $('.trader'),
    traderName: $('.trader span'),
    wallInner: $('.wall-inner'),
    tickers: root.querySelectorAll('.ticker'),
    char: $('.char'),
    charSvg: $('.char-svg'),
    pupils: $('.pupils'),
    crumbs: $('.crumbs'),
    caption: $('.caption'),
    aside: $('.aside'),
    flip: $('.flip'),
    end: $('.end'),
    canvas: $('.end canvas'),
    save: $('.save'),
    again: $('.again'),
  }

  // Fit the 350 x 500 scene into whatever height the stage has left.
  const fit = () => {
    const { clientWidth: w, clientHeight: h } = els.sceneBox
    const s = Math.min(w / SCENE_W, h / SCENE_H)
    els.scene.style.setProperty('--s', s.toFixed(4))
  }
  new ResizeObserver(fit).observe(els.sceneBox)
  fit()

  const cache = new Map()
  const set = (key, value, apply) => {
    if (cache.get(key) === value) return
    cache.set(key, value)
    apply(value)
  }
  const crumbNodes = new Map()
  let cardReady = Promise.resolve()

  function frame() {
    const { g } = game
    const t = game.stateMs
    const s = g.state
    const flipped = s === 'holding' || s === 'sold' || s === 'end'

    // Captions
    let caption = ''
    let aside = ''
    if (s === 'stare') {
      caption = COPY.caption.stare
      if (t >= 1500) aside = COPY.caption.stareAside
    } else if (s === 'ready') {
      caption = t >= 4000 ? COPY.caption.readyLong : COPY.caption.stare
      aside = COPY.caption.stareAside
    } else if (s === 'flipping') caption = COPY.caption.flipping
    else if (s === 'holding')
      caption = g.holdMs >= 8000 && g.holdMs < 10000 ? COPY.caption.holdingAside : COPY.caption.holding
    else if (s === 'sold') caption = soldCaption(timerSeconds(g))
    set('caption', caption, (v) => (els.caption.textContent = v))
    set('aside', aside, (v) => (els.aside.textContent = v))

    set('state', s, (v) => (els.stage.dataset.state = v))

    // Timer
    const timerOn = s === 'holding' || s === 'sold' || s === 'end'
    set('timerOn', timerOn, (v) => {
      els.timer.classList.toggle('on', v)
      els.meter.classList.toggle('on', v)
    })
    set('meter', Math.round((g.holdMs / HOLD_MS) * 400), (v) => els.meter.style.setProperty('--p', v / 400))
    set('timer', COPY.timer(timerSeconds(g)), (v) => (els.timer.textContent = v))

    // Button
    set('flip', s === 'ready', (v) => {
      els.flip.classList.toggle('in', v)
      els.flip.disabled = !v
    })

    // Wall
    set('wall', s === 'flipping' ? 'flipping' : flipped ? 'flipped' : '', (v) => {
      els.wallInner.classList.toggle('is-flipping', v === 'flipping')
      els.wallInner.classList.toggle('is-flipped', v === 'flipped')
    })
    let front = COPY.tickerBefore
    let back = COPY.tickerAfter
    if (s === 'flipping') {
      const i = Math.floor(t / (FLIP_MS / 5))
      front = back = i < COPY.scramble.length ? COPY.scramble[i] : COPY.tickerAfter
    }
    set('front', front, (v) => (els.tickers[0].textContent = v))
    set('back', back, (v) => (els.tickers[1].textContent = v))

    // Trader: one per crumb, crossing behind the wall top
    const showTrader = s === 'holding' || s === 'sold'
    let p = (g.holdMs % CRUMB_EVERY_MS) / CRUMB_EVERY_MS
    if (s === 'sold') p = Math.min(0.82, Math.max(0.15, p))
    const tIdx = Math.floor(g.holdMs / CRUMB_EVERY_MS)
    set('traderOn', showTrader, (v) => els.trader.classList.toggle('on', v))
    set('traderName', COPY.traders[tIdx % COPY.traders.length], (v) => (els.traderName.textContent = v))
    set('traderSay', s === 'sold', (v) => els.trader.classList.toggle('talking', v))
    if (showTrader) {
      els.trader.style.transform = `translateX(${traderX(p).toFixed(1)}px)`
      els.trader.style.opacity = s === 'sold' ? 1 : Math.min(1, p / 0.12, (1 - p) / 0.15).toFixed(3)
    }

    // Crumbs
    const landed = g.crumbs.filter((c) => c.landed)
    const air = g.crumbs.filter((c) => !c.landed)
    const live = new Set()
    let look = null
    const place = (c, slot) => {
      live.add(c.id)
      let el = crumbNodes.get(c.id)
      if (!el) {
        el = document.createElement('div')
        el.className = 'crumb'
        els.crumbs.append(el)
        crumbNodes.set(c.id, el)
      }
      const [x, y] = c.landed ? SLOTS[slot] : crumbPos(g.holdMs - c.bornAt, slot)
      if (!c.landed) look = [x, y]
      if (el._landed !== c.landed) {
        el._landed = c.landed
        el.classList.toggle('landed', c.landed)
        el.innerHTML = `<span>${c.landed ? COPY.crumbLanded : COPY.crumbAir}</span>`
      }
      el.style.transform = `translate(${(x - 11).toFixed(1)}px, ${(y - 11).toFixed(1)}px)`
    }
    landed.forEach((c, i) => place(c, i))
    air.forEach((c, i) => place(c, Math.min(PILE_CAP - 1, landed.length + i)))
    for (const [id, el] of crumbNodes) {
      if (live.has(id)) continue
      el.remove()
      crumbNodes.delete(id)
    }

    // Face: pupils follow whatever he is looking at
    if (!look) {
      if (s === 'sold') look = [-200, EYES[1]]
      else if (landed.length) look = [150, 480]
      else look = [266, 200]
    }
    const dx = look[0] - EYES[0]
    const dy = look[1] - EYES[1]
    const len = Math.hypot(dx, dy) || 1
    set('pupils', `${((dx / len) * 2).toFixed(2)},${((dy / len) * 2).toFixed(2)}`, (v) => {
      els.pupils.style.transform = `translate(${v.replace(',', 'px,')}px)`
    })
    let mouth = 'flat'
    if (s === 'flipping') mouth = 'open'
    else if (s === 'sold' || (s === 'holding' && g.pileCount >= 2)) mouth = 'frown'
    set('mouth', mouth, (v) => (els.char.dataset.mouth = v))
    set('stepped', s === 'sold', (v) => els.char.classList.toggle('stepped', v))
    set('sellable', s === 'holding', (v) => els.char.classList.toggle('sellable', v))

    // End card
    set('end', s === 'end', (v) => {
      els.end.hidden = !v
      if (v) cardReady = drawShareCard(els.canvas, g)
    })
  }

  // One-shot effects on state entry.
  function on(event) {
    if (event === 'sold' && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
      els.charSvg.classList.remove('shake')
      void els.charSvg.getBoundingClientRect()
      els.charSvg.classList.add('shake')
    }
    if (event === 'end') requestAnimationFrame(() => els.again.focus({ preventScroll: true }))
  }

  async function save() {
    await cardReady
    els.canvas.toBlob((blob) => {
      if (!blob) return
      const a = document.createElement('a')
      a.href = URL.createObjectURL(blob)
      a.download = COPY.fileName
      document.body.append(a)
      a.click()
      a.remove()
      setTimeout(() => URL.revokeObjectURL(a.href), 2000)
    }, 'image/png')
  }

  return { els, frame, on, save }
}

// ---------- share card: 1080 x 1080 ----------

const fontsReady = Promise.race([
  Promise.all(
    ['700 72px Unbounded', '600 34px Outfit', '600 18px Outfit'].map((f) => document.fonts?.load(f).catch(() => null))
  ),
  new Promise((r) => setTimeout(r, 2500)),
])

export async function drawShareCard(canvas, g) {
  await fontsReady
  const ctx = canvas.getContext('2d')
  const W = 1080
  const end = g.sold ? COPY.end.sold : COPY.end.held
  canvas.setAttribute('aria-label', `${end.lines.join(' ')} ${end.sub}`)

  ctx.fillStyle = C.bg
  ctx.fillRect(0, 0, W, W)
  ctx.textBaseline = 'alphabetic'

  // Chamber: soft glow behind the wall, perspective grid under his feet
  const glow = ctx.createRadialGradient(800, 720, 30, 800, 720, 520)
  glow.addColorStop(0, 'rgba(143, 208, 255, 0.16)')
  glow.addColorStop(1, 'rgba(143, 208, 255, 0)')
  ctx.fillStyle = glow
  ctx.fillRect(0, 0, W, W)
  ctx.save()
  ctx.beginPath()
  ctx.rect(0, 980, W, 100)
  ctx.clip()
  ctx.strokeStyle = 'rgba(143, 208, 255, 0.22)'
  ctx.lineWidth = 2
  for (const gy of [980, 992, 1012, 1040, 1076]) {
    ctx.beginPath()
    ctx.moveTo(0, gy)
    ctx.lineTo(W, gy)
    ctx.stroke()
  }
  for (let i = -14; i <= 14; i++) {
    ctx.beginPath()
    ctx.moveTo(540 + i * 40, 980)
    ctx.lineTo(540 + i * 130, 1080)
    ctx.stroke()
  }
  ctx.restore()

  // Headline, shrunk only if Unbounded runs wide
  let size = 72
  ctx.font = `700 ${size}px ${DISPLAY}`
  while (size > 40 && Math.max(...end.lines.map((l) => ctx.measureText(l).width)) > W - 144) {
    size -= 2
    ctx.font = `700 ${size}px ${DISPLAY}`
  }
  const step = Math.round(size * 1.35)
  end.lines.forEach((line, i) => {
    ctx.fillStyle = i < 2 ? C.text : g.sold ? C.danger : C.knots
    ctx.fillText(line, 72, 72 + size + i * step)
  })
  ctx.font = `600 34px ${BODY}`
  ctx.fillStyle = C.muted
  ctx.fillText(end.sub, 72, 72 + size + 2 * step + 64)

  // Knotted wall
  const wx = 650
  const wy = 470
  const ww = 300
  const wh = 510
  const wall = new Path2D()
  roundRect(wall, wx, wy, ww, wh, 28)
  ctx.save()
  ctx.fillStyle = C.wall
  ctx.fill(wall)
  ctx.clip(wall)
  ctx.fillStyle = C.mortar
  for (let i = 1; i <= 8; i++) ctx.fillRect(wx, wy + Math.round((wh * i) / 9) - 2, ww, 4)
  ctx.restore()
  ctx.save()
  ctx.lineWidth = 4
  ctx.strokeStyle = C.knots
  ctx.shadowColor = 'rgba(198, 255, 74, 0.5)'
  ctx.shadowBlur = 34
  ctx.stroke(wall)
  ctx.restore()
  ctx.font = `700 32px ${DISPLAY}`
  ctx.fillStyle = C.knots
  ctx.textAlign = 'center'
  ctx.fillText(COPY.tickerAfter, wx + ww / 2, wy + 92)
  ctx.save()
  ctx.translate(wx + ww / 2 - 132, wy + 170)
  ctx.scale(2.2, 2.2)
  const strokes = [
    [KNOT_D, C.ink, 16, 'round'],
    [KNOT_D, C.knots, 10, 'round'],
    [KNOT_CROSS, C.ink, 16, 'butt'],
    [KNOT_OVER, C.knots, 10, 'round'],
  ]
  for (const [d, color, width, cap] of strokes) {
    ctx.strokeStyle = color
    ctx.lineWidth = width
    ctx.lineCap = cap
    ctx.stroke(new Path2D(d))
  }
  ctx.restore()

  // Character, static, frown
  const k = 2
  const groundY = 980
  const charX = 110
  ctx.save()
  ctx.translate(charX, groundY - 202 * k)
  ctx.scale(k, k)
  CHARACTER.forEach((s) => paintShape(ctx, s, { skip: ['m-flat', 'm-open'], pupils: [1.4, 1.4] }))
  ctx.restore()

  // Pile, same slots as the game, scaled
  ctx.textAlign = 'center'
  const visible = Math.min(PILE_CAP, g.pileCount)
  const coinXY = ([x, y]) => [charX + x * k, groundY - (SCENE_H - y) * k]
  for (let i = 0; i < visible; i++) {
    const [cx, cy] = coinXY(SLOTS[i])
    ctx.beginPath()
    ctx.arc(cx, cy, 22, 0, Math.PI * 2)
    ctx.fillStyle = C.stonk
    ctx.fill()
    ctx.lineWidth = 4
    ctx.strokeStyle = C.ink
    ctx.stroke()
    ctx.save()
    ctx.translate(cx, cy + 6)
    ctx.scale(0.52, 1)
    ctx.font = `600 18px ${BODY}`
    ctx.fillStyle = C.ink
    ctx.fillText(COPY.crumbLanded, 0, 0)
    ctx.restore()
  }
  if (g.pileCount > PILE_CAP) {
    const [mx, my] = coinXY(SLOTS[7])
    ctx.font = `600 28px ${BODY}`
    ctx.fillStyle = C.stonk
    ctx.fillText(COPY.end.more(g.pileCount - PILE_CAP), mx, my - 44)
  }

  ctx.font = `500 18px ${BODY}`
  ctx.fillStyle = C.muted
  ctx.textAlign = 'right'
  ctx.fillText(COPY.end.footer, W - 72, W - 40)
  ctx.textAlign = 'left'
}
