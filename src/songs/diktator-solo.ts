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
  H3, MidiNote
} from '../midi_notes';
import {applyEffects, Patch, PatchProps} from '../patch';
import {rangeMapper} from '../utils';
import {MOD} from "../microkorg";
import {
  MidiSequence,
  MidiSequenceDrum,
  MidiSequenceDrumHarmony,
  MidiSequenceStep,
  msHarmony
} from "../effects/midi-sequence-drum";
import {ArpeggioProps} from "../music-utils";
import {isRealNote, isRealNoteOn, isRealNoteOnBelow, isRealNoteOnNote} from "../midi-message";
import {DRUM_IN, KEYBOARD_IN} from "../config";
import {NoteForwarder} from "../effects/note-forwarder";

const OUT_DEVICE = THROUGH_PORT;
const DRUM_INPUT_DEVICE = HAND_SONIC;


const keyLeftChannel = 1;
const keyRightChannel = 2;


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
  const defaultBeatDuration = 500;
  const bassChannel = 0;

  function bassNote(note: MidiNote, ticks = 1): MidiSequenceStep[] {
    return [
      {type: 'NoteOn', note: note, channel: bassChannel, velocity: 100},
      {ticks: ticks},
      {type: 'NoteOff', note: note, channel: bassChannel, velocity: 100},
    ]
  }

  function droneSeq(note: MidiNote): MidiSequence {
    return [
      {type: 'NoteOn', note: note, channel: 1, velocity: 100},
    ]
  }

  function drumHarmony(trigger: number, baseNote: MidiNote, drone = true) {
    return msHarmony(
      (event) =>
        (isRealNoteOnNote(event.message, trigger) && event.comesFrom(DRUM_IN))
        || (isRealNoteOnNote(event.message, baseNote + 12) && event.comesFrom(KEYBOARD_IN)),
      {sequences: [bassNote(baseNote)]},
      {},
      drone ? droneSeq(baseNote) : undefined
    );
  }

  const harmonies: MidiSequenceDrumHarmony[] = [
    drumHarmony(62, Fis3),
    drumHarmony(63, H3),
    drumHarmony(64, A2, false),
    // Left
    drumHarmony(65, C3),
    drumHarmony(66, D3),
    drumHarmony(67, E3),
    drumHarmony(68, F3),
    // Right
    drumHarmony(69, G3),
    drumHarmony(70, Gis3),
    drumHarmony(71, A3),
    drumHarmony(72, B3),
  ];


  const sequenceDrum = new MidiSequenceDrum({
    harmonyNoteTriggerDevice: DRUM_IN,
    triggerFilter: (midiEvent: MidiEvent) => midiEvent.comesFrom(DRUM_IN) ||
      (midiEvent.comesFrom(KEYBOARD_IN) && isRealNoteOnBelow(midiEvent.message, C5)),
    lastHarmonyTriggerFilter: (midiEvent: MidiEvent) =>
      midiEvent.comesFrom(DRUM_IN) && isRealNoteOn(midiEvent.message) && midiEvent.message.note === 74,
    outputDevice: THROUGH_PORT,
    harmonies,
    tickDuration: defaultBeatDuration / 2,
  });

  const controlForwarder = new ControlForwarder(KEYBOARD_IN, THROUGH_PORT, MOD, rangeMapper([0, 127], [10, 127]), 3);

  const noteForwarder = new NoteForwarder((event) =>
      event.comesFrom(KEYBOARD_IN) && isRealNote(event.message) && event.message.note > C5
    , THROUGH_PORT,
    (message) => ({
      ...message,
      note: message.note - 12,
      channel: keyRightChannel
    })
  );


  const effects = [
    new ControlForwarder(EXPRESS_PEDAL, OUT_DEVICE, MOD,
      rangeMapper([0, 127], [0, 127])
    ),
    sequenceDrum,
    controlForwarder,
    noteForwarder
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
      // if (isRealNoteOn(midiEvent.message) && midiEvent.comesFrom(KEYBOARD_IN) && midiEvent.message.note < C5) {
      //   sequenceDrum.stopDrone(midiOut);
      // }
      applyEffects(midiEvent, midiOut, effects);
    }
  }
}

