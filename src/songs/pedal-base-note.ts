import {ControlForwarder} from '../effects/control-forwarder';
import {HarmonyDrum} from '../effects/harmony-drum';
import {NoteSequencer} from '../effects/note-sequencer';
import {CUTOFF} from '../microkorg';
import {MidiEvent} from '../midi-event';
import {filterByNote, filterByNoteOn, filterNoteOnByPort} from '../midi-filter';
import {MidiOut} from '../midi-out';
import {EXPRESS_PEDAL, HAND_SONIC, MICRO_KORG, NTS, THROUGH_PORT, VMPK,} from '../midi-ports';
import {
  A3,
  A4,
  A5,
  A6,
  B2,
  B3,
  B4,
  B5,
  C5,
  D3,
  D4,
  D5,
  F3,
  F4,
  G4,
  G5,
  MidiNote,
  midiNoteToString
} from '../midi_notes';
import {applyEffects, Patch, PatchProps} from '../patch';
import {rangeMapper} from '../utils';

const DRUM_INPUT_DEVICE = VMPK;
const PEDAL_INPUT_DEVICE = VMPK;
const OUT_DEVICE = THROUGH_PORT;
// const DRUM_INPUT_DEVICE = HAND_SONIC;
// const PEDAL_INPUT_DEVICE = EXPRESS_PEDAL;
// const OUT_DEVICE = NTS;

export function pedalBaseNote(props: PatchProps): Patch {
  let baseNoteFromPedal = A3;

  function getBaseNoteFromPedal(midiEvent: MidiEvent) {
    if (midiEvent.message.type === 'ControlChange' && midiEvent.comesFrom(PEDAL_INPUT_DEVICE)) {
      const newBaseNote = mapControlValueToNote(midiEvent.message.value, [A3, D4, F4, G4]);
      props.setStatusDisplayHtml(`BaseNote: <span style="font-size: 40px">${midiNoteToString(newBaseNote)}</span>  (${newBaseNote})`);
      return newBaseNote;
    } else {
      return undefined;
    }
  }

  const commonHarmonyDrum = {
    baseNoteInputFilter: filterNoteOnByPort(MICRO_KORG),
    getBaseNote: getBaseNoteFromPedal,
    resetDuration: 10_0000,
    noteDuration: 50,
    outputPortName: OUT_DEVICE
  };

  const effects = [
    new NoteSequencer({
      control: 1,
      step_duration: 200,
      note_duration: 100,
      notes: [A3, A4, A5, A6],
      trigger: filterByNoteOn(DRUM_INPUT_DEVICE, 62),
      noteMapper: (note) => note - A3 + baseNoteFromPedal,
      outputPortName: OUT_DEVICE
    }),
    new HarmonyDrum({
      ...commonHarmonyDrum,
      trigger: filterByNote(DRUM_INPUT_DEVICE, 61),
      noteOffsets: [0],
      noteDuration: 1000,
      // noteOffsets: [0, 12, 24, 36]
    }),
    new HarmonyDrum({
      ...commonHarmonyDrum,
      trigger: filterByNote(DRUM_INPUT_DEVICE, 60),
      noteOffsets: [7, 12],
    }),
    new HarmonyDrum({
      ...commonHarmonyDrum,
      trigger: filterByNote(DRUM_INPUT_DEVICE, 63),
      noteOffsets: [7, 12, 19]
    }),
    new ControlForwarder(EXPRESS_PEDAL, MICRO_KORG, CUTOFF, rangeMapper([0, 127], [10, 127])),
  ];

  return {
    name: 'Pedal-Base-Note',
    midiProgram: 28, // a45
    onMidiEvent(midiEvent: MidiEvent, midiOut: MidiOut) {
      const newBaseNoteFromPedal = getBaseNoteFromPedal(midiEvent);
      if (newBaseNoteFromPedal) {
        baseNoteFromPedal = newBaseNoteFromPedal;
      }
      console.log('midiEvent', midiEvent.message);
      applyEffects(midiEvent, midiOut, effects);

      if (midiEvent.comesFrom(EXPRESS_PEDAL) && midiEvent.message.type === 'ControlChange') {
        midiOut.pitchBendChange(THROUGH_PORT, midiEvent.message.value)
      }
    }
  }
}


const FIRST_MARGIN = 2;
const LAST_MARGIN = 1;

function mapControlValueToNote(controlValue: number, notes: MidiNote[]): MidiNote {
  if (notes.length < 2) {
    return notes[Math.floor(controlValue / 128 * notes.length)];
  } else {
    if (controlValue < FIRST_MARGIN) {
      return notes[0];
    } else if (controlValue >= 128 - LAST_MARGIN) {
      return notes[notes.length - 1];
    } else {
      const posInMiddleRange = controlValue - FIRST_MARGIN;
      const middleRange = 128 - (FIRST_MARGIN + LAST_MARGIN);
      const resultIndex = Math.floor(posInMiddleRange / middleRange * (notes.length - 2)) + 1;
      return notes[resultIndex];
    }
  }
}
