import {assert, describe, test} from 'vitest'
import {convertH2PatternToMidiSequence} from "../convert";
import {ONE_NOTE_H2, ONE_NOTE_WITH_POSITION_H2} from "./data/one-note.h2";
import {SHORT_H2} from "./data/short.h2";
import {ROCK_H2} from "./data/rock.h2";

describe('convertH2PatternToMidiSequence', () => {
  test('one note', () => {
    const output = convertH2PatternToMidiSequence(ONE_NOTE_H2);
    assert.deepEqual(output, {
      size: 48,
      midiSequence: [
        {type: 'NoteOn', note: 0, channel: 0, velocity: 0.8 * 127},
        {type: 'NoteOff', note: 0, channel: 0, velocity: 0},
        {ticks: 48}
      ]
    });
  })

  test('one note with position', () => {
    const output = convertH2PatternToMidiSequence(ONE_NOTE_WITH_POSITION_H2);
    assert.deepEqual(output, {
      size: 48,
      midiSequence: [
        {ticks: 23},
        {type: 'NoteOn', note: 1, channel: 0, velocity: 0.8 * 127},
        {type: 'NoteOff', note: 1, channel: 0, velocity: 0},
        {ticks: 25}
      ]
    });
  })

  test('short', () => {
    const output = convertH2PatternToMidiSequence(SHORT_H2);
    assert.deepEqual(output, {
      size: 192,
      midiSequence: [
        {
          "type": "NoteOn",
          "note": 0,
          "channel": 0,
          "velocity": 101.60000000000001
        },
        {
          "type": "NoteOff",
          "note": 0,
          "channel": 0,
          "velocity": 0
        },
        {
          "type": "NoteOn",
          "note": 6,
          "channel": 0,
          "velocity": 74.92999999999999
        },
        {
          "type": "NoteOff",
          "note": 6,
          "channel": 0,
          "velocity": 0
        },
        {
          "ticks": 24
        },
        {
          "type": "NoteOn",
          "note": 6,
          "channel": 0,
          "velocity": 74.92999999999999
        },
        {
          "type": "NoteOff",
          "note": 6,
          "channel": 0,
          "velocity": 0
        },
        {
          "ticks": 12
        },
        {
          "type": "NoteOn",
          "note": 6,
          "channel": 0,
          "velocity": 74.92999999999999
        },
        {
          "type": "NoteOff",
          "note": 6,
          "channel": 0,
          "velocity": 0
        },
        {ticks: 156}
      ]
    });
  })

  test('rock', () => {
    const output = convertH2PatternToMidiSequence(ROCK_H2);
    assert.deepEqual(output, {
      size: 192,
      midiSequence: [
        {
          "type": "NoteOn",
          "note": 0,
          "channel": 0,
          "velocity": 101.60000000000001
        },
        {
          "type": "NoteOff",
          "note": 0,
          "channel": 0,
          "velocity": 0
        },
        {
          "type": "NoteOn",
          "note": 6,
          "channel": 0,
          "velocity": 74.92999999999999
        },
        {
          "type": "NoteOff",
          "note": 6,
          "channel": 0,
          "velocity": 0
        },
        {
          "ticks": 24
        },
        {
          "type": "NoteOn",
          "note": 6,
          "channel": 0,
          "velocity": 74.92999999999999
        },
        {
          "type": "NoteOff",
          "note": 6,
          "channel": 0,
          "velocity": 0
        },
        {
          "ticks": 24
        },
        {
          "type": "NoteOn",
          "note": 6,
          "channel": 0,
          "velocity": 74.92999999999999
        },
        {
          "type": "NoteOff",
          "note": 6,
          "channel": 0,
          "velocity": 0
        },
        {
          "type": "NoteOn",
          "note": 4,
          "channel": 0,
          "velocity": 101.60000000000001
        },
        {
          "type": "NoteOff",
          "note": 4,
          "channel": 0,
          "velocity": 0
        },
        {
          "ticks": 24
        },
        {
          "type": "NoteOn",
          "note": 6,
          "channel": 0,
          "velocity": 76.2
        },
        {
          "type": "NoteOff",
          "note": 6,
          "channel": 0,
          "velocity": 0
        },
        {
          "ticks": 24
        },
        {
          "type": "NoteOn",
          "note": 0,
          "channel": 0,
          "velocity": 101.60000000000001
        },
        {
          "type": "NoteOff",
          "note": 0,
          "channel": 0,
          "velocity": 0
        },
        {
          "type": "NoteOn",
          "note": 6,
          "channel": 0,
          "velocity": 74.92999999999999
        },
        {
          "type": "NoteOff",
          "note": 6,
          "channel": 0,
          "velocity": 0
        },
        {
          "ticks": 24
        },
        {
          "type": "NoteOn",
          "note": 6,
          "channel": 0,
          "velocity": 74.92999999999999
        },
        {
          "type": "NoteOff",
          "note": 6,
          "channel": 0,
          "velocity": 0
        },
        {
          "ticks": 12
        },
        {
          "type": "NoteOn",
          "note": 0,
          "channel": 0,
          "velocity": 73.66
        },
        {
          "type": "NoteOff",
          "note": 0,
          "channel": 0,
          "velocity": 0
        },
        {
          "ticks": 12
        },
        {
          "type": "NoteOn",
          "note": 6,
          "channel": 0,
          "velocity": 76.2
        },
        {
          "type": "NoteOff",
          "note": 6,
          "channel": 0,
          "velocity": 0
        },
        {
          "type": "NoteOn",
          "note": 4,
          "channel": 0,
          "velocity": 101.60000000000001
        },
        {
          "type": "NoteOff",
          "note": 4,
          "channel": 0,
          "velocity": 0
        },
        {
          "ticks": 24
        },
        {
          "type": "NoteOn",
          "note": 6,
          "channel": 0,
          "velocity": 76.2
        },
        {
          "type": "NoteOff",
          "note": 6,
          "channel": 0,
          "velocity": 0
        },
        {ticks: 24}
      ]
    });
  })
})

