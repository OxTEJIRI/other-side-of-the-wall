import './style.css'
import { createGame } from './game.js'
import { mount } from './render.js'

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

const sound = createSound()
let view = null
const game = createGame({
  on(event) {
    view?.on(event)
    sound.play(event)
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
function tick(now) {
  if (last !== null) game.update(Math.min(now - last, 250))
  last = now
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
