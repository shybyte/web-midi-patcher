import {ControlForwarder} from '../effects/control-forwarder';
import {HarmonyDrum} from '../effects/harmony-drum';
import {CUTOFF} from '../microkorg';
import {MidiEvent} from '../midi-event';
import {filterByNote, filterNoteOnByPort} from '../midi-filter';
import {MidiOut} from '../midi-out';
import {EXPRESS_PEDAL, HAND_SONIC, MICRO_KORG, THROUGH_PORT, VMPK,} from '../midi-ports';
import {B5, C5, D5, G5, MidiNote, midiNoteToString} from '../midi_notes';
import {applyEffects, Patch, PatchProps} from '../patch';
import {rangeMapper} from '../utils';

const DRUM_INPUT_DEVICE = VMPK;

export function pedalBaseNote(props: PatchProps): Patch {
  function getBaseNoteFromPedal(midiEvent: MidiEvent) {
    if (midiEvent.message.type === 'ControlChange' && midiEvent.portName === VMPK) {
      const newBaseNote = mapControlValueToNote(midiEvent.message.value, [G5, B5, D5]);
      props.setStatusDisplayHtml(`BaseNote: ${midiNoteToString(newBaseNote)}  (${newBaseNote})`);
      return newBaseNote;
    } else {
      return undefined;
    }
  }

  const commonHarmonyDrum = {
    baseNoteInputFilter: filterNoteOnByPort(MICRO_KORG),
    getBaseNote: getBaseNoteFromPedal,
    resetDuration: 10_0000,
    noteDuration: 100,
    outputPortName: THROUGH_PORT
  };

  const effects = [
    new HarmonyDrum({
      ...commonHarmonyDrum,
      trigger: filterByNote(DRUM_INPUT_DEVICE, 61),
      noteOffsets: [0]
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
      applyEffects(midiEvent, midiOut, effects);

      if (midiEvent.comesFrom(EXPRESS_PEDAL) && midiEvent.message.type === 'ControlChange') {
        midiOut.pitchBendChange(THROUGH_PORT, midiEvent.message.value)
      }
    }
  }
}


const FIRST_LAST_MARGIN = 5;

function mapControlValueToNote(controlValue: number, notes: MidiNote[]): MidiNote {
  return notes[Math.floor(controlValue / 128 * notes.length)];
}
