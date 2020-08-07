import {HarmonyDrum} from '../effects/harmony-drum';
import {CUTOFF} from '../microkorg';
import {MidiEvent} from '../midi-event';
import {filterBy, filterByPort} from '../midi-filter';
import {MidiOut} from '../midi-out';
import {applyEffects, Patch} from '../patch';
import {mapRange} from '../utils';
import {THROUGH_PORT, VIRTUAL_KEYBOARD, VMPK} from './midi-ports';

function createYoung(): Patch {
  const commonHarmonyDrum = {
    baseNoteInputFilter: filterByPort(VMPK),
    resetDuration: 10_0000,
    noteDuration: 100,
    outputPortName: THROUGH_PORT,
  };

  const effects = [
    new HarmonyDrum({
      ...commonHarmonyDrum,
      trigger: filterBy(VIRTUAL_KEYBOARD, 71),
      noteOffsets: [0]
    }),
    new HarmonyDrum({
      ...commonHarmonyDrum,
      trigger: filterBy(VIRTUAL_KEYBOARD, 72),
      noteOffsets: [7, 12, 19]
    })
  ];

  return {
    name: 'Young',
    midiProgram: 28, // A45
    onMidiEvent(midiEvent: MidiEvent, midiOut: MidiOut) {
      applyEffects(midiEvent, midiOut, effects);

      if (midiEvent.portName === VMPK && midiEvent.message.type === 'ControlChange') {
        midiOut.pitchBendChange(THROUGH_PORT, midiEvent.message.value)
        const cutoffValue = mapRange([0, 127], [10, 127], midiEvent.message.value);
        midiOut.controlChange(THROUGH_PORT, CUTOFF, cutoffValue);
      }
    }
  }
}

export const young = createYoung();
