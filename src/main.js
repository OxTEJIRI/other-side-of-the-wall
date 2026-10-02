import './style.css'
import { createGame, timerSeconds } from './game.js'
import { mount, soldCaption } from './render.js'
import { COPY } from './copy.js'

// Sound is off by default. Three synthesized blips, no files.
function createSound() {
  let ctx = null
  let on = false
  const tone = (f0, f1, dur, type, gain) => {
    const t = ctx.currentTime
    const osc = ctx.createOscillator()
    const amp = ctx.createGain()
    osc.type = type
    osc.frequency.setValueAtTime(f0, t)
    osc.frequency.exponentialRampToValueAtTime(f1, t + dur)
    amp.gain.setValueAtTime(gain, t)
    amp.gain.exponentialRampToValueAtTime(0.0001, t + dur)
    osc.connect(amp).connect(ctx.destination)
    osc.start(t)
    osc.stop(t + dur)
  }
  const sounds = {
    flipping: () => tone(520, 180, 0.15, 'square', 0.06), // short downward blip
    land: () => tone(1320, 1760, 0.06, 'triangle', 0.08), // soft coin tick
    sold: () => tone(440, 140, 0.19, 'sawtooth', 0.05), // sad slide
  }
  return {
    toggle() {
      on = !on
      if (on && !ctx) ctx = new (window.AudioContext || window.webkitAudioContext)()
      if (on) ctx.resume()
      return on
    },
    play(event) {
      if (on && ctx && sounds[event]) sounds[event]()
    },
  }
}

// Voiceover: the browser's own speech synthesis. No files, no network, opt-in
// (browsers block speech until the player has tapped something).
function createVoice() {
  const supported = 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window
  let on = false
  let voice = null
  const pick = () => {
    const en = speechSynthesis.getVoices().filter((v) => /^en/i.test(v.lang))
    voice =
      en.find((v) => /Daniel|Guy|Ryan|David|Google UK English Male/i.test(v.name)) ||
      en.find((v) => /^en-(GB|US)/i.test(v.lang)) ||
      en[0] ||
      null
  }
  if (supported) {
    pick()
    speechSynthesis.addEventListener?.('voiceschanged', pick)
  }
  return {
    supported,
    toggle() {
      on = !on
      if (!on && supported) speechSynthesis.cancel()
      return on
    },
    // queue: wait for the current line instead of cutting it off
    say(text, queue = false) {
      if (!on || !supported || !text) return
      if (!queue) speechSynthesis.cancel()
      const u = new SpeechSynthesisUtterance(text)
      if (voice) u.voice = voice
      u.lang = voice?.lang || 'en-US'
      u.rate = 0.95
      u.pitch = 0.8
      speechSynthesis.speak(u)
    },
  }
}

// What he says in each state. The captions stay the jokes; this explains them.
function narration(state, g) {
  const v = COPY.voice
  if (state === 'stare') return v.stare
  if (state === 'ready') return v.ready
  if (state === 'flipping') return v.flipping
  if (state === 'holding') return v.holding
  if (state === 'sold') return `${soldCaption(timerSeconds(g))} ${v.soldTail}`
  if (state === 'end') {
    const end = g.sold ? COPY.end.sold : COPY.end.held
    return `${end.lines.join(' ')} ${end.sub} ${g.sold ? v.endSold : v.endHeld}`
  }
  return ''
}

// These follow on from the line before; the rest are player actions and cut in.
const QUEUED = new Set(['ready', 'holding', 'end'])

const sound = createSound()
const voice = createVoice()
let view = null
const game = createGame({
  on(event, g) {
    view?.on(event)
    sound.play(event)
    if (event !== 'land') voice.say(narration(event, g), QUEUED.has(event))
  },
})
view = mount(document.getElementById('app'), game)
const { els } = view

// Input. The flip is the only real button; selling is tapping him.
els.flip.addEventListener('click', () => game.flip())
els.char.addEventListener('click', () => game.sell())
els.again.addEventListener('click', () => game.restart())
els.save.addEventListener('click', () => view.save())
els.speaker.addEventListener('click', () => {
  els.speaker.setAttribute('aria-pressed', String(sound.toggle()))
})
els.voice.hidden = !voice.supported
els.voice.addEventListener('click', () => {
  const on = voice.toggle()
  els.voice.setAttribute('aria-pressed', String(on))
  voice.say(narration(game.g.state, game.g)) // start with whatever is happening now
})

addEventListener('keydown', (e) => {
  if (e.repeat) return
  // Buttons handle their own Enter/Space.
  if ((e.code === 'Enter' || e.code === 'Space') && !e.target.closest?.('button')) {
    e.preventDefault()
    game.flip()
  }
})

if (import.meta.env.DEV) {
  addEventListener('keydown', (e) => {
    if (e.code === 'KeyD' && !e.repeat) game.debugNext()
  })
}

// One rAF loop. Hidden tab pauses the clock; offline time is not banked.
let raf = 0
let last = null
let asideSpoken = false
function tick(now) {
  if (last !== null) game.update(Math.min(now - last, 250))
  last = now
  if (game.g.state === 'holding' && !asideSpoken && game.g.holdMs >= 8000) {
    asideSpoken = true
    voice.say(COPY.voice.holdingAside, true)
  }
  if (game.g.state !== 'holding') asideSpoken = false
  view.frame()
  raf = requestAnimationFrame(tick)
}
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    cancelAnimationFrame(raf)
    raf = 0
  } else if (!raf) {
    last = null
    raf = requestAnimationFrame(tick)
  }
})
if (!document.hidden) raf = requestAnimationFrame(tick)
