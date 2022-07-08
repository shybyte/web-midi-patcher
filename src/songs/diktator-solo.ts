import {BeatDurationTracker} from '../beat-duration-tracker';
import {ControlForwarder} from '../effects/control-forwarder';
import {harmony, Harmony, octaveUpSequence, repeatSequence, SequenceDrum} from '../effects/sequence-drum';
import {MidiEvent} from '../midi-event';
import {filterByNoteOn, filterNoteOnByPort} from '../midi-filter';
import {MidiOut} from '../midi-out';
import {EXPRESS_PEDAL, HAND_SONIC, MICRO_KORG, NTS, THROUGH_PORT, VMPK,} from '../midi-ports';
import {
  A2,
  A3,
  A4,
  B3,
  B4,
  C3,
  C4,
  C5,
  Cis3,
  D3,
  D4,
  D5,
  Dis3,
  E3,
  E5,
  F3,
  F4,
  F5,
  Fis3,
  G3,
  Gis3,
  H3
} from '../midi_notes';
import {applyEffects, Patch, PatchProps} from '../patch';
import {rangeMapper} from '../utils';
import {MOD} from "../microkorg";

// const DRUM_INPUT_DEVICE = VMPK;
const OUT_DEVICE = THROUGH_PORT;
const DRUM_INPUT_DEVICE = HAND_SONIC;
// const OUT_DEVICE = NTS;

const NTS_CONTROLL = {
  CUTOFF: 43,
  OSC_TYPE: 53,
  OSC_SHAPE: 54,
  OSC_ALT: 55,
}

// Strophe
// a G F C B

// Interlude
// a G F C Gis

// Refrain
// a G C B
// a G d C

// Terminator 1
// d F
// a F e
// d C
// d C


// Terminator 1
// a C
// fis a G
// F C h a G Gis a

// C d e F G Gis a B / Fis h
// C d e F Fis G Gis a B h
export function diktatorSolo(props: PatchProps): Patch {
  const harmonies: Harmony[] = [
    harmony(62, repeatSequence(octaveUpSequence(Fis3, 1), 1), {}, Fis3),
    harmony(63, repeatSequence(octaveUpSequence(H3, 1), 1), {}, H3),
    harmony(64, repeatSequence(octaveUpSequence(A3, 1), 1)),
    harmony(65, repeatSequence(octaveUpSequence(C3, 1), 1), {}, C3),
    harmony(66, repeatSequence(octaveUpSequence(D3, 1), 1), {}, D3),
    harmony(67, repeatSequence(octaveUpSequence(E3, 1), 1), {}, E3),
    harmony(68, repeatSequence(octaveUpSequence(F3, 1), 1), {}, F3),
    harmony(69, repeatSequence(octaveUpSequence(G3, 1), 1), {}, G3),
    harmony(70, repeatSequence(octaveUpSequence(Gis3, 1), 1), {}, Gis3),
    harmony(71, repeatSequence(octaveUpSequence(A3, 1), 1), {}, A3),
    harmony(72, repeatSequence(octaveUpSequence(B3, 1), 1), {}, B3),

  ];

  const defaultBeatDuration = 500;

  const sequenceDrum = new SequenceDrum({
    drumInputDevice: DRUM_INPUT_DEVICE,
    outputDevice: OUT_DEVICE,
    harmonies,
    note_duration: 100,
    harmonyNoteDuration: 200,
    harmonyNoteChannel: 0,
    stepDuration: defaultBeatDuration / 4,
  });
  const effects = [
    new ControlForwarder(EXPRESS_PEDAL, OUT_DEVICE, MOD,
      rangeMapper([0, 127], [0, 127])
    ),
    sequenceDrum
  ]

  return {
    name: 'Diktator Solo',
    midiProgram: 28, // a45
    drumProgram: 113, // DikSolo
    onMidiEvent(midiEvent: MidiEvent, midiOut: MidiOut) {
      const midiMessage = midiEvent.message;
      console.log('midiEvent', midiEvent, midiMessage);
      // beatTracker.onMidiEvent(midiEvent);
      // console.log('beatTracker.beatDuration', beatTracker.beatDuration);
      // sequenceDrum.stepDuration = beatTracker.beatDuration / 4
      applyEffects(midiEvent, midiOut, effects);
    }
  }
}

