import {BeatDurationTracker} from '../beat-duration-tracker';
import {ControlForwarder} from '../effects/control-forwarder';
import {harmony, Harmony, octaveUpSequence, repeatSequence, SequenceDrum} from '../effects/sequence-drum';
import {MidiEvent} from '../midi-event';
import {filterByNoteOn, filterByRealNoteOn, filterNoteOnByPort} from '../midi-filter';
import {MidiOut} from '../midi-out';
import {EXPRESS_PEDAL, HAND_SONIC, MICRO_KORG, NTS, THROUGH_PORT, VMPK, YAMAHA_PSS_A50,} from '../midi-ports';
import {
  A2,
  A3,
  A4, A5,
  B3,
  B4,
  C3,
  C4,
  C5,
  Cis3, Cis4, Cis5, Cis6,
  D3,
  D4,
  D5, D6,
  Dis3,
  E3, E4,
  E5,
  F3,
  F4,
  F5,
  Fis3, Fis4, Fis5,
  G3, G4, G5,
  Gis3, Gis4, Gis5,
  H3, H5, MidiNote
} from '../midi_notes';
import {applyEffects, Patch, PatchProps} from '../patch';
import {rangeMapper} from '../utils';
import {MOD, OSC2_SEMITONE} from "../microkorg";
import {ControlSequenceStepper} from "../effects/control-sequence-stepper";
import {MidiSequenceDrum, MidiSequenceDrumHarmony, MidiSequenceStep, msHarmony} from "../effects/midi-sequence-drum";
import {isRealNoteOn, isRealNoteOnBelow, isRealNoteOnNote} from "../midi-message";
import {NoteForwarder} from "../effects/note-forwarder";
import {KEYBOARD_IN} from "../config";

// const DRUM_INPUT_DEVICE = VMPK;
const OUT_DEVICE = THROUGH_PORT;
const DRUM_INPUT_DEVICE = HAND_SONIC;

// const OUT_DEVICE = NTS;


export function sicherheitskopie(props: PatchProps): Patch {
  const defaultBeatDuration = 500;

  const beatTracker = new BeatDurationTracker({
    filter: filterByRealNoteOn(DRUM_INPUT_DEVICE, 74),
    defaultBeatDuration: defaultBeatDuration
  });


  // Strophe: e D C
  // Bridge: h fis D E Cis
  // Refrain: fis E D

  // C Cis D , e E fis h

  /*
   harmony(64, repeatSequence(octaveUpSequence(A3, 1), 1)),
    //
    harmony(65, repeatSequence(octaveUpSequence(C3, 1), 1), {}, C3),
    harmony(66, repeatSequence(octaveUpSequence(D3, 1), 1), {}, D3),
    harmony(67, repeatSequence(octaveUpSequence(E3, 1), 1), {}, E3),
    harmony(68, repeatSequence(octaveUpSequence(F3, 1), 1), {}, F3),
    //
    harmony(69, repeatSequence(octaveUpSequence(G3, 1), 1), {}, G3),
    harmony(70, repeatSequence(octaveUpSequence(Gis3, 1), 1), {}, Gis3),
    harmony(71, repeatSequence(octaveUpSequence(A3, 1), 1), {}, A3),
    harmony(72, repeatSequence(octaveUpSequence(B3, 1), 1), {}, B3),
  ];


  */

  function bassNoteSeq(note: MidiNote): MidiSequenceStep[] {
    return [
      {type: 'NoteOn', note: note, channel: 0, velocity: 100},
      {ticks: 0.8},
      {type: 'NoteOff', note: note, channel: 0, velocity: 100},
    ]
  }

  function bassNoteFullSeq(note: MidiNote, highNote1: MidiNote, highNote2: MidiNote): MidiSequenceStep[] {
    return [
      {type: 'NoteOn', note: note, channel: 0, velocity: 100},
      {ticks: 0.8},
      {type: 'NoteOff', note: note, channel: 0, velocity: 100},
      {type: 'NoteOn', note: highNote1, channel: 1, velocity: 100},
      {type: 'NoteOn', note: highNote2, channel: 1, velocity: 100},
      {ticks: 0.8},
      {type: 'NoteOff', note: highNote1, channel: 1, velocity: 100},
      {type: 'NoteOff', note: highNote2, channel: 1, velocity: 100},
    ]
  }

  const harmonies: MidiSequenceDrumHarmony[] = [
    msHarmony(66, {sequences: [bassNoteSeq(C4), bassNoteSeq(G4)]}, {62: [E5, G5]}),
    msHarmony(67, {sequences: [bassNoteSeq(Cis4), bassNoteSeq(Gis4)]}, {62: [F5, Gis5]}),
    msHarmony(68, {sequences: [bassNoteSeq(D4), bassNoteSeq(A4)]}, {62: [Fis5, A5]}),
    //
    msHarmony(69, {sequences: [bassNoteSeq(E4), bassNoteSeq(H3)]}, {62: [G5, H5]}),
    msHarmony(70, {sequences: [bassNoteSeq(E4), bassNoteSeq(H3)]}, {62: [Gis5, H5]}),
    msHarmony(71, {sequences: [bassNoteSeq(Fis4), bassNoteSeq(Cis5)]}, {62: [A5, Cis6]}),
    msHarmony(72, {sequences: [bassNoteSeq(H3), bassNoteSeq(Fis4)]}, {62: [D5, Fis5]}),
    // Keyboard
    msHarmony(
      (event) => isRealNoteOnNote(event.message, E4) && event.comesFrom(KEYBOARD_IN),
      {sequences: [bassNoteFullSeq(E4, G5, H5), bassNoteFullSeq(H3, G5, H5)]},
    ),
    msHarmony(
      (event) => isRealNoteOnNote(event.message, D4) && event.comesFrom(KEYBOARD_IN),
      {sequences: [bassNoteFullSeq(D4, Fis5, A5), bassNoteFullSeq(A4, Fis5, A5)]},
    ),
    msHarmony(
      (event) => isRealNoteOnNote(event.message, C4) && event.comesFrom(KEYBOARD_IN),
      {sequences: [bassNoteFullSeq(C4, E5, G5), bassNoteFullSeq(G4, E5, G5)]},
    ),
  ];

  const sequenceDrum = new MidiSequenceDrum({
    triggerFilter: (midiEvent: MidiEvent) => midiEvent.comesFrom(DRUM_INPUT_DEVICE) || (midiEvent.comesFrom(KEYBOARD_IN) && isRealNoteOnBelow(midiEvent.message, C5)),
    lastHarmonyTriggerFilter: (midiEvent: MidiEvent) =>
      midiEvent.comesFrom(DRUM_INPUT_DEVICE) && isRealNoteOn(midiEvent.message) && midiEvent.message.note === 74,
    outputDevice: OUT_DEVICE,
    harmonies,
    note_duration: 100,
    harmonyNoteDuration: 500,
    harmonyNoteChannel: 1,
    tickDuration: defaultBeatDuration / 2,
  });

  const noteForwarder = new NoteForwarder((event) =>
      (event.message.type === 'NoteOn' || event.message.type === 'NoteOff') &&
      event.comesFrom(KEYBOARD_IN) && event.message.note >= C5
    , THROUGH_PORT,
    (message) => ({...message, channel: 2})
  );

  const noteForwarderPitchWheel = new NoteForwarder((event) =>
      (event.message.type === 'PitchBend') && event.comesFrom(KEYBOARD_IN)
    , THROUGH_PORT,
    (message) => ({...message, channel: 2})
  );

  const effects = [sequenceDrum, noteForwarder, noteForwarderPitchWheel];

  return {
    name: 'Sicherheitskopie',
    midiProgram: 28, // a45
    drumProgram: 116, // WaSo
    onMidiEvent(midiEvent: MidiEvent, midiOut: MidiOut) {
      const midiMessage = midiEvent.message;
      beatTracker.onMidiEvent(midiEvent);
      console.log('midiEvent', midiEvent, midiMessage);
      sequenceDrum.tickDuration = beatTracker.beatDuration / 2;
      applyEffects(midiEvent, midiOut, effects);
    }
  }
}

