// Every visible string, verbatim from docs/COPY.md. Do not punch these up.

export const COPY = {
  title: 'Other Side of the Wall',

  tickerBefore: '$STONK',
  tickerAfter: '$KNOTS',
  crumbAir: '3%',
  crumbLanded: '$STONK',

  scramble: ['SNOTK', 'TONKS', 'KNOST', 'KNOTS'],

  caption: {
    stare: 'bro is waiting for the breakout',
    stareAside: 'the candles are not going to do it',
    readyLong: 'you can keep staring. the candles support you.',
    flipping: 'same letters. other side.',
    holding: 'do not touch anything. that is the whole strategy.',
    holdingAside: 'he is offended that this worked.',
    soldEarly: 'you folded before the crumb.',
    soldMid: 'congratulations. you discovered holding. then undid it.',
    soldLate: 'so close to doing nothing for a full commercial break.',
  },

  end: {
    held: {
      lines: ['Same letters.', 'Other side.', 'I did not press sell.'],
      sub: 'Hold $KNOTS. $STONK lands. No stake. No claim.',
    },
    sold: {
      lines: ['Same letters.', 'Other side.', 'He pressed sell.'],
      sub: 'The pile stopped. The wall did not.',
    },
    footer: 'other side of the wall',
    more: (n) => `and ${n} more`,
  },

  timer: (n) => `doing nothing: ${n}s`,

  traders: [
    'Paperhands Pete',
    '3am Market Order',
    'Guy Who Bridged Wrong',
    'Sold The Bottom',
    'Just Asking Questions',
    'Notification On',
    'Waiting For Confirmation',
  ],
  skillIssue: 'skill issue',

  button: {
    flip: 'FLIP THE WALL',
    save: 'save the meme',
    again: 'stare again',
  },

  // Spoken by the browser's built-in voice, opt-in. Plain words, said once.
  voice: {
    stare:
      'This is a guy. He is staring at a wall of candles. He is waiting for the breakout. The candles are not going to do it.',
    ready: 'There is one button. It flips the wall.',
    flipping: 'Same letters. Other side. Stonk, spelled backward, is knots.',
    holding:
      'Now he holds. A trader moves the token. The token takes three percent. Some of it lands here, as stonk. He does not touch anything.',
    holdingAside: 'He is offended that this worked.',
    soldTail: 'The crumbs in the air are gone. The pile stays.',
    endHeld: 'Payouts depend on other people moving the token. This is a joke, not advice.',
    endSold: 'This is a joke about a transfer tax, not advice.',
  },

  disclaimer:
    'A joke about a transfer tax. Not yield. Not advice. Payouts depend on other people moving the token.',

  fileName: 'i-did-not-press-sell.png',
}
