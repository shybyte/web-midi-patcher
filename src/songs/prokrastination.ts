import {BeatDurationTracker} from '../beat-duration-tracker';
import {ControlForwarder} from '../effects/control-forwarder';
import {harmony, Harmony, octaveUpSequence, repeatSequence, SequenceDrum} from '../effects/sequence-drum';
import {MidiEvent} from '../midi-event';
import {filterByNoteOn, filterNoteOnByPort} from '../midi-filter';
import {MidiOut} from '../midi-out';
import {EXPRESS_PEDAL, HAND_SONIC, MICRO_KORG, NTS, THROUGH_PORT, VMPK,} from '../midi-ports';
import {A2, A3, A4, B3, B4, C3, C4, C5, Cis3, D3, D4, D5, Dis3, E3, E5, F3, F4, F5, Fis3, G3, H3} from '../midi_notes';
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
// 4x F C g B

// Pre-Chorus
// 2x d a B a
// d a B F C cis

// Refrain
// d B F g
// B cis


// C cis d F g a B
export function prokrastination(props: PatchProps): Patch {
  const harmonies: Harmony[] = [
    harmony(66, repeatSequence(octaveUpSequence(C3, 1), 1)),
    harmony(67, repeatSequence(octaveUpSequence(Cis3, 1), 1), {62: [F4], 65: [F4]}),
    harmony(68, repeatSequence(octaveUpSequence(D3, 1), 1), {62: [F4], 65: [F4]}, A4),
    harmony(69, repeatSequence(octaveUpSequence(F3, 1), 1), {62: [A4], 65: [A4]}, C4),
    harmony(70, repeatSequence(octaveUpSequence(G3, 1), 1), {62: [B4], 65: [B4]}, B4),
    harmony(71, repeatSequence(octaveUpSequence(A3, 1), 1)),
    harmony(72, repeatSequence(octaveUpSequence(B3, 1), 1), {62: [F4], 65: [F4]}, D4),

  ];

  const defaultBeatDuration = 500;

  const beatTracker = new BeatDurationTracker({
    filter: filterByNoteOn(DRUM_INPUT_DEVICE, 74),
    defaultBeatDuration: defaultBeatDuration
  });

  const sequenceDrum = new SequenceDrum({
    drumInputDevice: DRUM_INPUT_DEVICE,
    outputDevice: OUT_DEVICE,
    harmonies,
    note_duration: 100,
    harmonyNoteDuration: 200,
    harmonyNoteChannel: 0,
    stepDuration: defaultBeatDuration / 4
  });
  const effects = [
    new ControlForwarder(EXPRESS_PEDAL, OUT_DEVICE, MOD,
      rangeMapper([0, 127], [0, 127])
    ),
    sequenceDrum
  ]

  return {
    name: 'Prokrastination',
    midiProgram: 28, // a45
    drumProgram: 112,
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

