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
  Gis3, Gis4,
  H3, MidiNote
} from '../midi_notes';
import {applyEffects, Patch, PatchProps} from '../patch';
import {range, rangeMapper, repeat} from '../utils';
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
import {divideTicks, mergeMidiSequences, replaceNotes, setOutputDevice} from "../midi-sequence-utils";
import {DRUM_AND_BASS_1A, DRUM_AND_BASS_2A, DRUM_AND_BASS_2B} from "../patterns/drum-and-bass-1";
import {gmRockKitToHandSonicStandard} from "../drum-mapping";
import {ControlTracker} from "../effects/control-tracker";
import {MY_NEW_ORLEANS_1A, MY_NEW_ORLEANS_1B, NEW_ORLEANS_1A} from "../patterns/new-orleans";
import {DRUM_ROLL_1} from "../patterns/drum-roll";

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
  const droneChannel = 1;
  let drumMode = 0;

  function bassNote(note: MidiNote, ticks = 1): MidiSequenceStep[] {
    return [
      {type: 'NoteOn', note: note, channel: bassChannel, velocity: 100},
      {ticks: ticks},
      {type: 'NoteOff', note: note, channel: bassChannel, velocity: 100},
    ];
  }

  function bassNotes(note: MidiNote, ticks = 0.5): MidiSequenceStep[] {
    return repeat([
      {type: 'NoteOn', note: note, channel: bassChannel, velocity: 100},
      {ticks: ticks},
      {type: 'NoteOff', note: note, channel: bassChannel, velocity: 100},
      {ticks: ticks},
    ], 8);
  }

  function droneSeq(note: MidiNote): MidiSequence {
    return [
      {type: 'NoteOn', note: note, channel: droneChannel, velocity: 100},
    ]
  }

  function drumHarmony(trigger: number, baseNote: MidiNote, drone = true) {
    return msHarmony(
      (event) =>
        (isRealNoteOnNote(event.message, trigger) && event.comesFrom(DRUM_IN)),
      {sequences: [bassNote(baseNote, 1.5)]},
      {},
      drone ? droneSeq(baseNote) : undefined
    );
  }

  const SPECIAL_DRUMS: { [note: MidiNote]: MidiSequenceStep[] } = {
    [C3]: DRUM_AND_BASS_2B,
    [G3]: DRUM_AND_BASS_2B,
    [Gis3]: DRUM_ROLL_1
  }

  const SPECIAL_DRUMS_ORLEANS: { [note: MidiNote]: MidiSequenceStep[] } = {
    [C3]: MY_NEW_ORLEANS_1B,
    [G3]: MY_NEW_ORLEANS_1B,
    [Gis3]: DRUM_ROLL_1,
  }

  function keyboardHarmony(baseNote: MidiNote): MidiSequenceDrumHarmony[] {
    return [
      msHarmony(
        (event) => (controlTracker.value < 100 && drumMode === 0 && isRealNoteOnNote(event.message, baseNote + 12) && event.comesFrom(KEYBOARD_IN)),
        {sequences: [mergeMidiSequences(drums(SPECIAL_DRUMS[baseNote] ?? DRUM_AND_BASS_2A), bassNotes(baseNote, 1))]},
        {},
        droneSeq(baseNote),
        (ev) => false
      ),
      msHarmony(
        (event) => (controlTracker.value < 100 && drumMode === 1 && isRealNoteOnNote(event.message, baseNote + 12) && event.comesFrom(KEYBOARD_IN)),
        {sequences: [repeatSequence(mergeMidiSequences(drums(SPECIAL_DRUMS_ORLEANS[baseNote] ?? MY_NEW_ORLEANS_1A), bassNotes(baseNote, 0.5)), 2)]},
        {},
        droneSeq(baseNote),
        (ev) => false
      ),
      msHarmony(
        (event) => (controlTracker.value >= 100 && isRealNoteOnNote(event.message, baseNote + 12) && event.comesFrom(KEYBOARD_IN)),
        {sequences: [bassNote(baseNote)]},
        {},
        droneSeq(baseNote),
        (ev) => false
      ),
    ];
  }

  function drums(pattern: MidiSequenceStep[]): MidiSequenceStep[] {
    return divideTicks(
      replaceNotes(setOutputDevice(pattern, HAND_SONIC), gmRockKitToHandSonicStandard),
      192 / 8
    );
  }

  const harmonies: MidiSequenceDrumHarmony[] = [
    ...range(C3, H3).flatMap(keyboardHarmony),
    // Drums
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

  const controlForwarderSolo = new ControlForwarder(EXPRESS_PEDAL, THROUGH_PORT, MOD, rangeMapper([60, 127], [0, 80]), keyRightChannel);

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
    controlForwarderSolo,
    noteForwarder
  ]

  const beatTracker = new BeatDurationTracker({
    filter: filterByNoteOn(DRUM_INPUT_DEVICE, 74),
    defaultBeatDuration: defaultBeatDuration,
    minDuration: defaultBeatDuration / 2,
    maxDuration: defaultBeatDuration * 2
  });

  const controlTracker = new ControlTracker(KEYBOARD_IN, MOD, (oldVal, newVal) => {
    if (oldVal >= 100 && newVal < 100) {
      beatTracker.reset();
      drumMode = 0;
      sequenceDrum.tickDuration = defaultBeatDuration;
    }
  });


  return {
    name: 'Diktator Solo',
    midiProgram: 28, // a45
    drumProgram: 113, // DikSolo
    onMidiEvent(midiEvent: MidiEvent, midiOut: MidiOut) {
      const midiMessage = midiEvent.message;
      controlTracker.onMidiEvent(midiEvent);
      // console.log('midiEvent', midiEvent, midiMessage);
      if (midiEvent.comesFrom(KEYBOARD_IN) && isRealNoteOnNote(midiMessage, Gis4)) {
        drumMode = (drumMode + 1) % 2;
      }
      beatTracker.onMidiEvent(midiEvent);
      // console.log('beatTracker.beatDuration', beatTracker.beatDuration);
      sequenceDrum.tickDuration = beatTracker.beatDuration / 2;
      applyEffects(midiEvent, midiOut, effects);
    }
  }
}

