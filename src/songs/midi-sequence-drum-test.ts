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
  A4,
  B3,
  B4,
  C3,
  C4,
  C5,
  Cis3,
  D3,
  D4,
  D5, D6,
  Dis3,
  E3, E4,
  E5,
  F3,
  F4,
  F5,
  Fis3,
  G3, G4, G5,
  Gis3, Gis4,
  H3, H4, MidiNote
} from '../midi_notes';
import {applyEffects, Patch, PatchProps} from '../patch';
import {rangeMapper, repeat, times} from '../utils';
import {MOD, OSC2_SEMITONE} from "../microkorg";
import {ControlSequenceStepper} from "../effects/control-sequence-stepper";
import {
  MidiSequenceDrum,
  MidiSequenceDrumHarmony,
  MidiSequenceStep,
  msHarmony,
  MultiSequence
} from "../effects/midi-sequence-drum";
import {isRealNoteOn} from "../midi-message";
import {NoteForwarder} from "../effects/note-forwarder";
import {KEYBOARD_IN} from "../config";
import {ArpeggioProps, arpeggioUpDown} from "../music-utils";

// const DRUM_INPUT_DEVICE = VMPK;
const OUT_DEVICE = THROUGH_PORT;
const DRUM_INPUT_DEVICE = HAND_SONIC;

// const OUT_DEVICE = NTS;


export function midiSequenceDrumTest(props: PatchProps): Patch {
  const defaultBeatDuration = 500;

  const beatTracker = new BeatDurationTracker({
    filter: filterByRealNoteOn(DRUM_INPUT_DEVICE, 74),
    defaultBeatDuration: defaultBeatDuration
  });

  const hihat = 64;
  const hihatVelo = 80;

  const a4MultiSequence: MultiSequence = {
    sequences: [[
      {type: 'NoteOn', note: A3, channel: 0, velocity: 100},
      {ticks: 1},
      {type: 'NoteOff', note: A3, channel: 0, velocity: 100},
      {type: 'NoteOn', note: E4, channel: 0, velocity: 100},
      {type: 'NoteOn', note: 64, channel: 0, velocity: hihatVelo, outputDevice: HAND_SONIC},
      {type: 'NoteOff', note: 64, channel: 0, velocity: hihatVelo, outputDevice: HAND_SONIC},
      {ticks: 1},
      {type: 'NoteOff', note: E4, channel: 0, velocity: 100}
    ]]
  };


  const arpeggioProps: ArpeggioProps = {
    durationTicks: 0.5,
    channel: 1,
    delayTicks: 0
  }

  const harmonies: MidiSequenceDrumHarmony[] = [
    msHarmony(A4, a4MultiSequence, {},
      repeat(arpeggioUpDown([A4, C5, E5], 3, arpeggioProps), 3)
    ),
    msHarmony(F4, [
        {type: 'NoteOn', note: F3, channel: 0, velocity: 100},
        {ticks: 1},
        {type: 'NoteOff', note: F3, channel: 0, velocity: 100},
        {type: 'NoteOn', note: C4, channel: 0, velocity: 100},
        {type: 'NoteOn', note: 64, channel: 0, velocity: hihatVelo, outputDevice: HAND_SONIC},
        {type: 'NoteOff', note: 64, channel: 0, velocity: hihatVelo, outputDevice: HAND_SONIC},
        {ticks: 1},
        {type: 'NoteOff', note: C4, channel: 0, velocity: 100}
      ], {},
      repeat(arpeggioUpDown([F4, A4, C5], 3, arpeggioProps), 3)
    ),
    msHarmony(C5, [
        {type: 'NoteOn', note: C4, channel: 0, velocity: 100},
        {ticks: 1},
        {type: 'NoteOff', note: C4, channel: 0, velocity: 100},
        {type: 'NoteOn', note: G4, channel: 0, velocity: 100},
        {type: 'NoteOn', note: 64, channel: 0, velocity: hihatVelo, outputDevice: HAND_SONIC},
        {type: 'NoteOff', note: 64, channel: 0, velocity: hihatVelo, outputDevice: HAND_SONIC},
        {ticks: 1},
        {type: 'NoteOff', note: G4, channel: 0, velocity: 100}
      ], {},
      repeat(arpeggioUpDown([C5, E5, G5], 3, arpeggioProps), 3)
    ),
    msHarmony(G4, [
        {type: 'NoteOn', note: G3, channel: 0, velocity: 100},
        {ticks: 1},
        {type: 'NoteOff', note: G3, channel: 0, velocity: 100},
        {type: 'NoteOn', note: D4, channel: 0, velocity: 100},
        {type: 'NoteOn', note: 64, channel: 0, velocity: hihatVelo, outputDevice: HAND_SONIC},
        {type: 'NoteOff', note: 64, channel: 0, velocity: hihatVelo, outputDevice: HAND_SONIC},
        {ticks: 1},
        {type: 'NoteOff', note: D4, channel: 0, velocity: 100}
      ], {},
      repeat(arpeggioUpDown([G4, H4, D5, Gis4], 3, arpeggioProps), 3)
    ),
  ];

  const sequenceDrum = new MidiSequenceDrum({
    harmonyNoteTriggerDevice: DRUM_INPUT_DEVICE,
    triggerFilter: (midiEvent: MidiEvent) => midiEvent.comesFrom(KEYBOARD_IN),
    lastHarmonyTriggerFilter: (midiEvent: MidiEvent) =>
      midiEvent.comesFrom(HAND_SONIC) && isRealNoteOn(midiEvent.message) && midiEvent.message.note === 74,
    outputDevice: OUT_DEVICE,
    harmonies,
    tickDuration: defaultBeatDuration / 2,
  });

  const noteForwarder = new NoteForwarder((event) =>
      (event.message.type === 'NoteOn' || event.message.type === 'NoteOff') &&
      event.comesFrom(KEYBOARD_IN) && event.message.note > C5
    , THROUGH_PORT,
    (message) => ({...message, channel: 2})
  );

  const controlForwarder = new ControlForwarder(KEYBOARD_IN, THROUGH_PORT, MOD, (x) => x, arpeggioProps.channel, MOD);

  const effects = [sequenceDrum, noteForwarder, controlForwarder];

  return {
    name: 'Midi Player Drum Test',
    midiProgram: 28, // a45
    drumProgram: 107, // WaSo
    onMidiEvent(midiEvent: MidiEvent, midiOut: MidiOut) {
      const midiMessage = midiEvent.message;
      beatTracker.onMidiEvent(midiEvent);
      console.log('midiEvent', midiEvent, midiMessage);
      sequenceDrum.tickDuration = beatTracker.beatDuration / 2;
      applyEffects(midiEvent, midiOut, effects);
    }
  }
}

