import {BeatDurationTracker} from '../beat-duration-tracker';
import {ControlForwarder} from '../effects/control-forwarder';
import {harmony, Harmony, octaveUpSequence, repeatSequence, SequenceDrum} from '../effects/sequence-drum';
import {MidiEvent} from '../midi-event';
import {filterByNoteOn, filterNoteOnByPort} from '../midi-filter';
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
  Cis3,
  D3,
  D4,
  D5, D6,
  Dis3,
  E3, E4,
  E5, E6,
  F3,
  F4,
  F5,
  Fis3,
  G3, G4,
  Gis3, Gis4,
  H3, MidiNote
} from '../midi_notes';
import {applyEffects, Patch, PatchProps} from '../patch';
import {rangeMapper, repeat} from '../utils';
import {MOD, OSC2_SEMITONE} from "../microkorg";
import {ControlSequenceStepper} from "../effects/control-sequence-stepper";
import {
  MidiSequence,
  MidiSequenceDrum,
  MidiSequenceDrumHarmony,
  MidiSequenceStep,
  msHarmony
} from "../effects/midi-sequence-drum";
import {ArpeggioProps, arpeggioUp} from "../music-utils";
import {isRealNoteOn, isRealNoteOnBelow, isRealNoteOnBetween, isRealNoteOnNote} from "../midi-message";
import {DRUM_IN, DRUM_OUT, KEYBOARD_IN} from "../config";
import {NoteForwarder} from "../effects/note-forwarder";
import {DRUM_AND_BASS_1A, DRUM_AND_BASS_2A, DRUM_AND_BASS_2B} from "../patterns/drum-and-bass-1";
import {divideTicks, mergeMidiSequences, replaceNotes, setOutputDevice} from "../midi-sequence-utils";
import {gmRockKitToHandSonicStandard} from "../drum-mapping";
import {DRUM_AND_BASS_1A_POLY, DRUM_AND_BASS_1B_POLY} from "../patterns/drum-and-bass-1-poly";
import {DRUM_ROLL_1} from "../patterns/drum-roll";

// const DRUM_INPUT_DEVICE = VMPK;
const OUT_DEVICE = THROUGH_PORT;
const DRUM_INPUT_DEVICE = HAND_SONIC;
// const OUT_DEVICE = NTS;


// C d e F G Gis a B
export function wahrheitSolo(props: PatchProps): Patch {
  const defaultBeatDuration = 500;

  const bassChannel = 0;

  const beatTracker = new BeatDurationTracker({
    filter: (midiEvent => midiEvent.comesFrom(DRUM_IN) && isRealNoteOnBetween(midiEvent.message, 74, 74)),
    defaultBeatDuration: defaultBeatDuration,
    minDuration: 300,
    maxDuration: 1500
  });

  function bassNote(note: MidiNote, ticks = 1): MidiSequenceStep[] {
    return [
      {type: 'NoteOn', note: note, channel: bassChannel, velocity: 100},
      {ticks: ticks},
      {type: 'NoteOff', note: note, channel: bassChannel, velocity: 100},
    ]
  }

  const arpeggioProps: ArpeggioProps = {
    durationTicks: 0.5,
    channel: 1,
    delayTicks: 0
  }

  function droneSeq(note: MidiNote): MidiSequence {
    return [
      {type: 'NoteOn', note: note, channel: 1, velocity: 100},
    ]
  }

  function drumHarmony(trigger: number, baseNote: MidiNote, drone = true) {
    return msHarmony(
      (event) => isRealNoteOnNote(event.message, trigger) && event.comesFrom(DRUM_IN),
      {sequences: [bassNote(baseNote)]},
      {},
      drone ? droneSeq(baseNote) : undefined
    );
  }

  const SPECIAL_DRUMS: { [note: MidiNote]: MidiSequenceStep[] } = {
    [C4]: DRUM_AND_BASS_1B_POLY,
    [D4]: DRUM_AND_BASS_1B_POLY,
    [G4]: DRUM_AND_BASS_1B_POLY,
    [E4]: DRUM_AND_BASS_1B_POLY,
  }

  function bassNoteFullSeq(note: MidiNote, highNote1: MidiNote, highNote2: MidiNote): MidiSequenceStep[] {
    return divideTicks(
      replaceNotes(setOutputDevice(SPECIAL_DRUMS[note] ?? DRUM_AND_BASS_1A_POLY, HAND_SONIC), gmRockKitToHandSonicStandard),
      192 / 8
    );
  }

  function bassNotes(note: MidiNote, ticks = 0.5): MidiSequenceStep[] {
    return repeat([
      {type: 'NoteOn', note: note, channel: bassChannel, velocity: 100},
      {ticks: ticks},
      {type: 'NoteOff', note: note, channel: bassChannel, velocity: 100},
      {ticks: ticks},
    ], 16);
  }

  function keyboardHarmony(note: MidiNote) {
    return msHarmony(
      (event) => isRealNoteOnNote(event.message, note) && event.comesFrom(KEYBOARD_IN),
      {
        sequences: [
          mergeMidiSequences(
            repeatSequence(bassNoteFullSeq(note, note + 7, note + 12), 1),
            bassNotes(note - 12, 0.25)
          )]
      },
    );
  }

  // C d e F G Gis a B
  const harmonies: MidiSequenceDrumHarmony[] = [
    drumHarmony(64, A3, false),
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
    // Keyboard
    keyboardHarmony(C4),
    keyboardHarmony(D4),
    keyboardHarmony(E4),
    keyboardHarmony(F4),
    keyboardHarmony(G4),
    keyboardHarmony(Gis4),
    keyboardHarmony(A4),
  ];

  const sequenceDrum = new MidiSequenceDrum({
    harmonyNoteTriggerDevice: DRUM_IN,
    triggerFilter: (midiEvent: MidiEvent) => midiEvent.comesFrom(DRUM_IN) || (midiEvent.comesFrom(KEYBOARD_IN) && isRealNoteOnBelow(midiEvent.message, C5)),
    lastHarmonyTriggerFilter: (midiEvent: MidiEvent) =>
      midiEvent.comesFrom(DRUM_IN) && isRealNoteOn(midiEvent.message) && midiEvent.message.note === 74,
    outputDevice: THROUGH_PORT,
    harmonies,
    tickDuration: defaultBeatDuration,
  });

  const noteForwarder = new NoteForwarder((event) =>
      (event.message.type === 'NoteOn' || event.message.type === 'NoteOff') &&
      event.comesFrom(KEYBOARD_IN)
    , THROUGH_PORT,
    (message) => ({
      ...message,
      note: message.note < C5 ? message.note - 12 : message.note,
      channel: 1
    })
  );


  const effects = [
    new ControlForwarder(HAND_SONIC, OUT_DEVICE, MOD,
      rangeMapper([0, 127], [0, 127]),
      1, 81
    ),
    new ControlForwarder(EXPRESS_PEDAL, OUT_DEVICE, MOD,
      rangeMapper([0, 127], [0, 127]),
      1
    ),
    new ControlForwarder(KEYBOARD_IN, OUT_DEVICE, MOD,
      rangeMapper([0, 127], [0, 127]),
      0
    ),
    new ControlSequenceStepper({
      trigger: filterByNoteOn(HAND_SONIC, 74),
      outputPortName: OUT_DEVICE,
      control: OSC2_SEMITONE,
      values: [0, 52],
      channel: 1,
      resetFilter: filterByNoteOn(YAMAHA_PSS_A50, A3),
      resetInstantly: true,
    }),
    sequenceDrum,
    noteForwarder
  ]

  return {
    name: 'Wahrheit Solo',
    midiProgram: 28, // a45
    drumProgram: 114, // WaSo
    onMidiEvent(midiEvent: MidiEvent, midiOut: MidiOut) {
      const midiMessage = midiEvent.message;
      console.log('midiEvent', midiEvent, midiMessage);

      // beatTracker.onMidiEvent(midiEvent);
      sequenceDrum.tickDuration = beatTracker.beatDuration / 2;

      if (midiEvent.comesFrom(KEYBOARD_IN) && isRealNoteOn(midiMessage) && (midiMessage.note < C5)
      ) {
        midiOut.send(THROUGH_PORT, {type: 'ControlChange', channel: 1, value: 0, control: OSC2_SEMITONE})
        console.log('stopDrone#)');
      }

      // beatTracker.onMidiEvent(midiEvent);
      // console.log('beatTracker.beatDuration', beatTracker.beatDuration);
      // sequenceDrum.stepDuration = beatTracker.beatDuration / 4
      applyEffects(midiEvent, midiOut, effects);
    }
  }
}

