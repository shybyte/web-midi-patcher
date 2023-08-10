import {ControlForwarder} from '../effects/control-forwarder';
import {MOD} from '../microkorg';
import {MidiEvent} from '../midi-event';
import {filterByRealNoteOn} from '../midi-filter';
import {MidiOut} from '../midi-out';
import {EXPRESS_PEDAL, THROUGH_PORT} from '../midi-ports';
import {A4, A5, A6, C5, C7, D4, D5, D6, E6, F4, F5, F6, Gis4, Gis5, H5, MidiNote} from '../midi_notes';
import {applyEffects, Patch} from '../patch';
import {rangeMapper} from '../utils';
import {NoteForwarder} from "../effects/note-forwarder";
import {DRUM_IN, DRUM_OUT, KEYBOARD_IN} from "../config";
import {repeatSequence} from "../effects/sequence-drum";
import {MidiSequenceDrum, MidiSequenceDrumHarmony, MidiSequenceStep, msHarmony} from "../effects/midi-sequence-drum";
import {isRealNoteOn, isRealNoteOnBelow, isRealNoteOnNote} from "../midi-message";
import {BeatDurationTracker} from "../beat-duration-tracker";

const soloChannel = 0;
const bassChannel = 1;


export function system(): Patch {

  const defaultBeatDuration = 400;

  const beatTracker = new BeatDurationTracker({
    filter: ev =>
      isRealNoteOn(ev.message) && ev.comesFrom(DRUM_IN) && [Gis5].includes(ev.message.note)
      || isRealNoteOnNote(ev.message, Gis4) && ev.comesFrom(KEYBOARD_IN),
    defaultBeatDuration: defaultBeatDuration,
    minDuration: 100,
    maxDuration: 1000
  });

  const noteForwarder = new NoteForwarder((event) =>
      (event.message.type === 'NoteOn' || event.message.type === 'NoteOff') &&
      event.comesFrom(KEYBOARD_IN) && event.message.note >= C5
    , THROUGH_PORT,
    (message) => ({...message, channel: soloChannel})
  );

  const BD = 2;
  const SNARE = 1;

  function bassNoteFullSeq(note: MidiNote, highNote1: MidiNote, highNote2: MidiNote): MidiSequenceStep[] {
    return [
      {type: 'NoteOn', note: note, channel: bassChannel, velocity: 100},
      {type: 'NoteOn', note: BD, channel: 0, velocity: 127, outputDevice: DRUM_OUT},
      {type: 'NoteOff', note: BD, channel: 0, velocity: 0, outputDevice: DRUM_OUT},
      {ticks: 0.25},
      {type: 'NoteOff', note: note, channel: bassChannel, velocity: 100},
      {ticks: 0.75},
      {type: 'NoteOn', note: note, channel: bassChannel, velocity: 100},
      {type: 'NoteOn', note: BD, channel: 0, velocity: 100, outputDevice: DRUM_OUT},
      {type: 'NoteOff', note: BD, channel: 0, velocity: 0, outputDevice: DRUM_OUT},
      {ticks: 0.25},
      {type: 'NoteOff', note: note, channel: bassChannel, velocity: 100},
      {ticks: 0.75},
      {type: 'NoteOn', note: highNote1, channel: bassChannel, velocity: 100},
      {type: 'NoteOn', note: SNARE, channel: 0, velocity: 117, outputDevice: DRUM_OUT},
      {type: 'NoteOff', note: SNARE, channel: 0, velocity: 0, outputDevice: DRUM_OUT},
      {ticks: 0.25},
      {type: 'NoteOff', note: highNote1, channel: bassChannel, velocity: 100},
      {ticks: 0.75},
      {type: 'NoteOn', note: highNote2, channel: bassChannel, velocity: 100},
      {type: 'NoteOn', note: SNARE, channel: 0, velocity: 100, outputDevice: DRUM_OUT},
      {type: 'NoteOff', note: SNARE, channel: 0, velocity: 0, outputDevice: DRUM_OUT},
      {ticks: 0.9},
      {type: 'NoteOff', note: highNote2, channel: bassChannel, velocity: 100},
      {ticks: 0.1},
    ]
  }

  function bassNote(note: MidiNote, ticks = 0.1): MidiSequenceStep[] {
    return [
      {type: 'NoteOn', note: note, channel: bassChannel, velocity: 100},
      {ticks: ticks},
      {type: 'NoteOff', note: note, channel: bassChannel, velocity: 100},
    ]
  }

  function drumHarmony(baseNote: MidiNote) {
    return msHarmony(
      (event) => isRealNoteOnNote(event.message, baseNote) && event.comesFrom(DRUM_IN),
      {sequences: [bassNote(baseNote)]},
      {
        1: {sequences: [bassNote(baseNote + 12, 0.2), bassNote(baseNote + 19, 0.5)]},
        5: {sequences: [bassNote(baseNote + 19, 0.5)]}
      }
    );
  }

  const harmonies: MidiSequenceDrumHarmony[] = [
    // Drum
    drumHarmony(Gis5),
    drumHarmony(A4),
    drumHarmony(D5),
    drumHarmony(F5),

    // Keyboard
    msHarmony(
      (event) => isRealNoteOnNote(event.message, A4) && event.comesFrom(KEYBOARD_IN),
      {sequences: [bassNoteFullSeq(A4, A5, E6)]},
    ),
    msHarmony(
      (event) => isRealNoteOnNote(event.message, D4) && event.comesFrom(KEYBOARD_IN),
      {sequences: [repeatSequence(bassNoteFullSeq(D5, D6, A6), 2)]},
    ),
    msHarmony(
      (event) => isRealNoteOnNote(event.message, F4) && event.comesFrom(KEYBOARD_IN),
      {sequences: [repeatSequence(bassNoteFullSeq(F5, F6, C7), 2)]},
    ),
    msHarmony(
      (event) => isRealNoteOnNote(event.message, Gis4) && event.comesFrom(KEYBOARD_IN),
      {sequences: [repeatSequence(bassNoteFullSeq(Gis5, H5, E6), 2)]},
    ),
  ];

  const sequenceDrum = new MidiSequenceDrum({
    harmonyNoteTriggerDevice: DRUM_IN,
    triggerFilter: (midiEvent: MidiEvent) => midiEvent.comesFrom(DRUM_IN) || (midiEvent.comesFrom(KEYBOARD_IN) && isRealNoteOnBelow(midiEvent.message, C5)),
    lastHarmonyTriggerFilter: (midiEvent: MidiEvent) =>
      false,
    outputDevice: THROUGH_PORT,
    harmonies,
    tickDuration: defaultBeatDuration / 2,
  });

  const noteForwarderPitchWheel = new NoteForwarder((event) =>
      (event.message.type === 'PitchBend') && event.comesFrom(KEYBOARD_IN)
    , THROUGH_PORT,
    (message) => ({...message, channel: 2})
  );

  const effects = [
    new ControlForwarder(EXPRESS_PEDAL, THROUGH_PORT, MOD, rangeMapper([0, 127], [0, 127]), soloChannel),
    new ControlForwarder(EXPRESS_PEDAL, THROUGH_PORT, MOD, rangeMapper([0, 127], [0, 127]), bassChannel),
    noteForwarder,
    sequenceDrum,
    noteForwarderPitchWheel
  ];

  return {
    name: 'System',
    midiProgram: 51, // A74
    drumProgram: 120,
    onMidiEvent(midiEvent: MidiEvent, midiOut: MidiOut) {
      beatTracker.onMidiEvent(midiEvent);
      sequenceDrum.tickDuration = beatTracker.beatDuration / 2;
      applyEffects(midiEvent, midiOut, effects);
      console.log('midiEvent:', midiEvent)
      // console.log('beatTracker:', beatTracker.beatDuration);
    }
  }
}
