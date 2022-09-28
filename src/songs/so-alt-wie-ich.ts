import {BeatDurationTracker} from '../beat-duration-tracker';
import {ControlForwarder} from '../effects/control-forwarder';
import {harmony, Harmony, octaveUpSequence, repeatSequence, SequenceDrum} from '../effects/sequence-drum';
import {MidiEvent} from '../midi-event';
import {filterByNoteOn, filterNoteOnByPort} from '../midi-filter';
import {MidiOut} from '../midi-out';
import {EXPRESS_PEDAL, HAND_SONIC, MICRO_KORG, NTS, THROUGH_PORT, VMPK,} from '../midi-ports';
import {A2, A3, C3, C5, Cis3, D3, D5, Dis3, E3, E5, F3, F5, Fis3, G3, H3} from '../midi_notes';
import {applyEffects, Patch, PatchProps} from '../patch';
import {rangeMapper} from '../utils';
import {NoteForwarder} from "../effects/note-forwarder";
import {KEYBOARD_IN} from "../config";
import {isRealNote} from "../midi-message";
import {MOD} from "../microkorg";

// const DRUM_INPUT_DEVICE = VMPK;
const OUT_DEVICE = THROUGH_PORT;
const DRUM_INPUT_DEVICE = HAND_SONIC;
// const OUT_DEVICE = NTS;

// A E D E
// A h D
// fis A E D
// fis A cis E
// fis h D A

// cis D E fis A h
export function soAltWieIch(props: PatchProps): Patch {
  const harmonies: Harmony[] = [
    harmony(67, repeatSequence(octaveUpSequence(Cis3), 4)),
    harmony(68, repeatSequence(octaveUpSequence(D3), 4)),
    //
    harmony(69, repeatSequence(octaveUpSequence(E3), 4)),
    harmony(70, repeatSequence(octaveUpSequence(Fis3), 4)),
    harmony(71, repeatSequence(octaveUpSequence(A3), 4)),
    harmony(72, repeatSequence(octaveUpSequence(H3), 4)),

  ];

  const defaultBeatDuration = 500;

  const beatTracker = new BeatDurationTracker({
    filter: filterByNoteOn(DRUM_INPUT_DEVICE, 74),
    defaultBeatDuration: defaultBeatDuration
  });

  const noteForwarder = new NoteForwarder((event) =>
      event.comesFrom(KEYBOARD_IN) && isRealNote(event.message) && event.message.note > C5
    , THROUGH_PORT,
    (message) => ({
      ...message,
      note: message.note,
      channel: 3
    })
  );

  const sequenceDrum = new SequenceDrum({
    drumInputDevice: DRUM_INPUT_DEVICE,
    outputDevice: OUT_DEVICE,
    harmonies,
    stepDuration: defaultBeatDuration / 4
  });
  const effects = [
    new ControlForwarder(EXPRESS_PEDAL, OUT_DEVICE, MOD,
      rangeMapper([0, 127], [0, 127]),3
    ),
    sequenceDrum,
    noteForwarder
  ]

  return {
    name: 'So alt wie ich',
    midiProgram: 28, // a45
    drumProgram: 111,
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

