import {BeatDurationTracker} from '../beat-duration-tracker';
import {ControlForwarder} from '../effects/control-forwarder';
import {harmony, Harmony, octaveUpSequence, repeatSequence, SequenceDrum} from '../effects/sequence-drum';
import {MidiEvent} from '../midi-event';
import {filterByNoteOn, filterByRealNoteOn, filterNoteOnByPort} from '../midi-filter';
import {MidiOut} from '../midi-out';
import {EXPRESS_PEDAL, HAND_SONIC, MICRO_KORG, NTS, THROUGH_PORT, VMPK,} from '../midi-ports';
import {
  A2,
  A3,
  A4, A5, A6,
  B3,
  B4,
  C3,
  C4,
  C5, C7,
  Cis3,
  D3,
  D4,
  D5, D6,
  Dis3,
  E3, E4,
  E5, E6,
  F3,
  F4,
  F5, F6,
  Fis3,
  G3, G4,
  Gis5,
  H3, MidiNote
} from '../midi_notes';
import {applyEffects, Patch, PatchProps} from '../patch';
import {rangeMapper, repeat} from '../utils';
import {MOD} from "../microkorg";
import {MidiSequenceDrum, MidiSequenceDrumHarmony, MidiSequenceStep, msHarmony} from "../effects/midi-sequence-drum";
import {DRUM_IN, KEYBOARD_IN} from "../config";
import {isRealNoteOn, isRealNoteOnBelow, isRealNoteOnBetween, isRealNoteOnNote} from "../midi-message";
import {ArpeggioProps, arpeggioUp, arpeggioUpDown} from "../music-utils";

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
  const defaultBeatDuration = 500;

  const beatTracker = new BeatDurationTracker({
      filter: (midiEvent => midiEvent.comesFrom(DRUM_IN) && isRealNoteOnBetween(midiEvent.message, 66, 74)),
    defaultBeatDuration: defaultBeatDuration,
    minDuration: 300,
    maxDuration: 1500
  });

  const bassChannel = 0;

  function bassNote(note: MidiNote, ticks = 1): MidiSequenceStep[] {
    return [
      {type: 'NoteOn', note: note, channel: bassChannel, velocity: 100},
      {ticks: ticks},
      {type: 'NoteOff', note: note, channel: bassChannel, velocity: 100},
    ]
  }

  const arpeggioProps: ArpeggioProps = {
    durationTicks: 0.5,
    channel: 2,
    delayTicks: 0
  }

  function drumHarmony(trigger: number, baseNote: MidiNote, highNote1: MidiNote) {
    return msHarmony(
      (event) => isRealNoteOnNote(event.message, trigger) && event.comesFrom(DRUM_IN),
      {sequences: [bassNote(baseNote)]},
      {
        60: {sequences: [bassNote(highNote1, 0.2)]},
        64: {sequences: [bassNote(highNote1, 0.2)]},
        65: {sequences: [bassNote(highNote1, 0.2)]},
      },
      repeat(arpeggioUp([baseNote, highNote1], 4, arpeggioProps), 4)
    );
  }

  const harmonies: MidiSequenceDrumHarmony[] = [
    drumHarmony(66, C3, G4),
    drumHarmony(67, Cis3, F4),
    drumHarmony(68, D3, F4),
    // Drum
    drumHarmony(69, F3, A4),
    drumHarmony(70, G3, B4),
    drumHarmony(71, A3, E5),
    drumHarmony(72, B3, F4),
  ];

  const sequenceDrum = new MidiSequenceDrum({
    harmonyNoteTriggerDevice: DRUM_IN,
    triggerFilter: (midiEvent: MidiEvent) => midiEvent.comesFrom(DRUM_IN) || (midiEvent.comesFrom(KEYBOARD_IN) && isRealNoteOnBelow(midiEvent.message, C5)),
    lastHarmonyTriggerFilter: (midiEvent: MidiEvent) =>
      midiEvent.comesFrom(DRUM_IN) && isRealNoteOn(midiEvent.message) && midiEvent.message.note === 74,
    outputDevice: THROUGH_PORT,
    harmonies,
    tickDuration: defaultBeatDuration / 2,
  });

  const effects = [
    new ControlForwarder(EXPRESS_PEDAL, OUT_DEVICE, MOD,
      rangeMapper([0, 127], [0, 127]),
      2
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
      beatTracker.onMidiEvent(midiEvent);
      sequenceDrum.tickDuration = beatTracker.beatDuration / 2;
      applyEffects(midiEvent, midiOut, effects);
    }
  }
}

