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
import {Dictionary, rangeMapper} from '../utils';
import {MOD, OSC2_SEMITONE} from "../microkorg";
import {ControlSequenceStepper} from "../effects/control-sequence-stepper";
import {
  MidiSequence,
  MidiSequenceDrum,
  MidiSequenceDrumHarmony,
  MidiSequenceStep,
  msHarmony
} from "../effects/midi-sequence-drum";
import {isRealNoteOn, isRealNoteOnBelow, isRealNoteOnBetween, isRealNoteOnNote} from "../midi-message";
import {NoteForwarder} from "../effects/note-forwarder";
import {DRUM_IN, KEYBOARD_IN} from "../config";
import {arpeggioUp, arpeggioUpDown} from "../music-utils";

// const DRUM_INPUT_DEVICE = VMPK;
const OUT_DEVICE = THROUGH_PORT;
const DRUM_INPUT_DEVICE = HAND_SONIC;

// Plucks / Sync Pluck
// Leads/Formant Pulse

const DRONE_CHANNEL = 3;

export function sicherheitskopie(props: PatchProps): Patch {
  const defaultBeatDuration = 500;

  const beatTracker = new BeatDurationTracker({
    filter: (midiEvent => midiEvent.comesFrom(DRUM_IN) && isRealNoteOnBetween(midiEvent.message, 66, 74)),
    defaultBeatDuration: defaultBeatDuration,
    minDuration: 200,
    maxDuration: 1000
  });

  // Strophe: e D C
  // Bridge: h fis D E Cis
  // Refrain: fis E D
  // C Cis D , e E fis h

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


  function harmonyChord(notes: MidiNote[]): MidiSequence {
    return [
      ...notes.map((note): MidiSequenceStep => ({type: 'NoteOn', note: note, channel: 1, velocity: 100})),
      {ticks: 0.8},
      ...notes.map((note): MidiSequenceStep => ({type: 'NoteOff', note: note, channel: 1, velocity: 100})),
    ]
  }

  function droneSeq(note: MidiNote): MidiSequence {
    const ticks = 0.2;
    return repeatSequence(arpeggioUpDown([note, note + 7], 3, {channel: DRONE_CHANNEL, delayTicks: ticks, durationTicks: ticks}), 4);
  }

  const harmonies: MidiSequenceDrumHarmony[] = [
    msHarmony(66, {sequences: [bassNoteSeq(C4), bassNoteSeq(G4)]}, {62: harmonyChord([E5, G5])}, droneSeq(C4)),
    msHarmony(67, {sequences: [bassNoteSeq(Cis4), bassNoteSeq(Gis4)]}, {62: harmonyChord([F5, Gis5])}, droneSeq(Cis4)),
    msHarmony(68, {sequences: [bassNoteSeq(D4), bassNoteSeq(A4)]}, {62: harmonyChord([Fis5, A5])}, droneSeq(D4)),
    //
    msHarmony(69, {sequences: [bassNoteSeq(E4), bassNoteSeq(H3)]}, {62: harmonyChord([G5, H5])}, droneSeq(E4)),
    msHarmony(70, {sequences: [bassNoteSeq(E4), bassNoteSeq(H3)]}, {62: harmonyChord([Gis5, H5])}, droneSeq(E4)),
    msHarmony(71, {sequences: [bassNoteSeq(Fis4), bassNoteSeq(Cis5)]}, {62: harmonyChord([A5, Cis6])}, droneSeq(Fis4)),
    msHarmony(72, {sequences: [bassNoteSeq(H3), bassNoteSeq(Fis4)]}, {62: harmonyChord([D5, Fis5])}, droneSeq(H3)),
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
    harmonyNoteTriggerDevice: DRUM_INPUT_DEVICE,
    triggerFilter: (midiEvent: MidiEvent) => midiEvent.comesFrom(DRUM_INPUT_DEVICE) || (midiEvent.comesFrom(KEYBOARD_IN) && isRealNoteOnBelow(midiEvent.message, C5)),
    lastHarmonyTriggerFilter: (midiEvent: MidiEvent) =>
      midiEvent.comesFrom(DRUM_INPUT_DEVICE) && isRealNoteOn(midiEvent.message) && midiEvent.message.note === 74,
    outputDevice: OUT_DEVICE,
    harmonies,
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

  const controlForwarder = new ControlForwarder(EXPRESS_PEDAL, THROUGH_PORT, MOD, rangeMapper([0, 127], [10, 127]), DRONE_CHANNEL);

  const effects = [controlForwarder, sequenceDrum, noteForwarder, noteForwarderPitchWheel];

  return {
    name: 'Sicherheitskopie',
    midiProgram: 28, // a45
    drumProgram: 116, // WaSo
    onMidiEvent(midiEvent: MidiEvent, midiOut: MidiOut) {
      const midiMessage = midiEvent.message;
      console.log('midiMessage:', midiMessage)
      beatTracker.onMidiEvent(midiEvent);
      sequenceDrum.tickDuration = beatTracker.beatDuration / 2;
      applyEffects(midiEvent, midiOut, effects);
    }
  }
}

