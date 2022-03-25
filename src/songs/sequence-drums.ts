import {BeatDurationTracker} from '../beat-duration-tracker';
import {ControlForwarder} from '../effects/control-forwarder';
import {harmony, Harmony, octaveUpSequence, repeatSequence, SequenceDrum} from '../effects/sequence-drum';
import {MOD} from '../microkorg';
import {MidiEvent} from '../midi-event';
import {filterByNoteOn, filterNoteOnByPort} from '../midi-filter';
import {MidiOut} from '../midi-out';
import {EXPRESS_PEDAL, HAND_SONIC, MICRO_KORG, NTS, THROUGH_PORT, VMPK,} from '../midi-ports';
import {A2, A4, C3, C4, C5, D3, D5, Dis3, E3, E4, E5, F3, F4, F5, G3} from '../midi_notes';
import {applyEffects, Patch, PatchProps} from '../patch';
import {rangeMapper} from '../utils';

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

// Cm, EsDur,
export function sequenceDrums(props: PatchProps): Patch {
  // const harmonies: Harmony[] = [
  //   harmony(C5, repeatSequence(octaveUpSequence(C3), 4)),
  //   harmony(D5, repeatSequence(octaveUpSequence(Dis3), 4)),
  //   harmony(E5, repeatSequence(octaveUpSequence(F3), 4)),
  // ];
  const harmonies: Harmony[] = [
    // harmony(C5, repeatSequence(octaveUpSequence(A2), 4), {69: [C3, E3]}),
    harmony(C5, repeatSequence(octaveUpSequence(A2), 4), {52: [C4, E4]}),
    harmony(D5, repeatSequence(octaveUpSequence(D3), 4), {52: [F4, A4]}),
    harmony(E5, repeatSequence(octaveUpSequence(F3), 4), {52: [A4, C5]}),
    harmony(F5, repeatSequence(octaveUpSequence(G3), 4)),
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
    stepDuration: defaultBeatDuration / 4
  });
  const effects = [
    new ControlForwarder(EXPRESS_PEDAL, OUT_DEVICE, MOD,
      rangeMapper([0, 127], [0, 127])
    ),
    sequenceDrum
  ]

  return {
    name: 'Sequence-Drums',
    midiProgram: 28, // a45
    drumProgram: 110,
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

