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
  C5,
  Cis3, Cis4,
  D3, D4,
  D5,
  Dis3,
  E3,
  E5,
  F3,
  F4,
  F5,
  Fis3,
  G3,
  G4, Gis3,
  H3, H4,
  MidiNote
} from '../midi_notes';
import {applyEffects, Patch, PatchProps} from '../patch';
import {range, rangeMapper, repeat} from '../utils';
import {NoteForwarder} from "../effects/note-forwarder";
import {DRUM_IN, FOOT_PEDAL, KEYBOARD_IN} from "../config";
import {isRealNote, isRealNoteOn, isRealNoteOnBelow, isRealNoteOnBetween, isRealNoteOnNote} from "../midi-message";
import {MOD} from "../microkorg";
import {MidiSequenceDrum, MidiSequenceDrumHarmony, MidiSequenceStep, msHarmony} from "../effects/midi-sequence-drum";
import {arpeggio, ArpeggioProps, arpeggioUp, arpeggioUpDown} from "../music-utils";
import {divideTicks, mergeMidiSequences, replaceNotes, setOutputDevice} from "../midi-sequence-utils";
import {DRUM_AND_BASS_1A} from "../patterns/drum-and-bass-1";
import {NEW_ORLEANS_1A} from "../patterns/new-orleans";
import {gmRockKitToHandSonicStandard} from "../drum-mapping";

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
export function sommer(props: PatchProps): Patch {
  const defaultBeatDuration = 450;

  const beatTracker = new BeatDurationTracker({
    // minDuration: 200,
    // maxDuration: 2000,
    filter: (midiEvent => midiEvent.comesFrom(DRUM_IN) && isRealNoteOnBetween(midiEvent.message, 66, 74)),
    defaultBeatDuration: defaultBeatDuration
  });

  const noteForwarder = new NoteForwarder((event) =>
      event.comesFrom(KEYBOARD_IN) && isRealNote(event.message) && event.message.note > C5
    , THROUGH_PORT,
    (message) => ({
      ...message,
      note: message.note + 12,
      channel: 3
    })
  );

  const arpeggioProps: ArpeggioProps = {
    durationTicks: 0.25,
    channel: 0,
    delayTicks: 0.25
  }

  function drumHarmony(trigger: number, baseNote: MidiNote, highNote1: MidiNote) {
    return msHarmony(
      (event) => isRealNoteOnNote(event.message, trigger) && event.comesFrom(DRUM_IN),
      // {sequences: [repeatSequence(arpeggioUp([baseNote], 3, arpeggioProps), 6)]},
      {sequences: [arpeggioUp([baseNote], 2, arpeggioProps)]},
      {
        60: arpeggio([highNote1 + 24, baseNote + 7 + 12], arpeggioProps),
        64: arpeggio([baseNote + 24, baseNote + 12], arpeggioProps), //hihat
        62: arpeggio([baseNote, baseNote + 7], arpeggioProps),
        63: arpeggio([highNote1 + 24, baseNote + 7 + 12], arpeggioProps),
        65: arpeggio([highNote1 + 24, baseNote + 7 + 12], arpeggioProps)
      },
    );
  }

  function drums(pattern: MidiSequenceStep[]): MidiSequenceStep[] {
    return divideTicks(
      replaceNotes(setOutputDevice(pattern, HAND_SONIC), gmRockKitToHandSonicStandard),
      192 / 8
    );
  }

  function keyboardHarmony(baseNote: MidiNote): MidiSequenceDrumHarmony[] {
    return [
      msHarmony(
        (event) => (isRealNoteOnNote(event.message, baseNote + 12) && event.comesFrom(KEYBOARD_IN)),
        {
          sequences: [
            mergeMidiSequences(
              drums(DRUM_AND_BASS_1A),
              repeatSequence(arpeggioUp([baseNote], 4, arpeggioProps), 4)
            )
          ]
        },
        {},
      ),
    ];
  }


  const harmonies: MidiSequenceDrumHarmony[] = [
    ...range(C3, H3).flatMap(keyboardHarmony),
    // Left Drum
    drumHarmony(67, E3, Gis3),
    drumHarmony(68, D3, Fis3),
    // Right Drum
    drumHarmony(69, Fis3, A4),
    drumHarmony(70, G4, H4),
    drumHarmony(71, A3, Cis4),
    drumHarmony(72, H3, D4,)
  ];

  const sequenceDrum = new MidiSequenceDrum({
    harmonyNoteTriggerDevice: DRUM_IN,
    triggerFilter: (midiEvent: MidiEvent) => midiEvent.comesFrom(DRUM_IN) || (midiEvent.comesFrom(KEYBOARD_IN) && isRealNoteOnBelow(midiEvent.message, C5)),
    // lastHarmonyTriggerFilter: (midiEvent: MidiEvent) =>
    //   midiEvent.comesFrom(DRUM_IN) && isRealNoteOn(midiEvent.message) && midiEvent.message.note === 74,
    outputDevice: THROUGH_PORT,
    harmonies,
    tickDuration: defaultBeatDuration / 2,
  });

  const controlForwarder = new ControlForwarder(FOOT_PEDAL, THROUGH_PORT, MOD, rangeMapper([0, 127], [10, 127]), 0);

  const effects = [
    new ControlForwarder(EXPRESS_PEDAL, OUT_DEVICE, MOD,
      rangeMapper([0, 127], [0, 127]), 3
    ),
    new ControlForwarder(HAND_SONIC, OUT_DEVICE, MOD,
      rangeMapper([0, 127], [0, 127]),
      0, 81
    ),
    sequenceDrum,
    noteForwarder,
    controlForwarder
  ]


  return {
    name: 'Sommer',
    midiProgram: 28, // a45
    drumProgram: 119,
    onMidiEvent(midiEvent: MidiEvent, midiOut: MidiOut) {
      const midiMessage = midiEvent.message;
      console.log('midiEvent', midiEvent, midiMessage);
      beatTracker.onMidiEvent(midiEvent);
      // console.log('beatTracker.beatDuration', beatTracker.beatDuration);
      sequenceDrum.tickDuration = beatTracker.beatDuration / 2;
      applyEffects(midiEvent, midiOut, effects);
    }
  }
}

