import {HarmonyDrum} from '../effects/harmony-drum';
import {MidiEvent} from '../midi-event';
import {filterBy, filterByNoteOnRange} from '../midi-filter';
import {MidiOut} from '../midi-out';
import {A4} from '../midi_notes';
import {applyEffects, Patch} from '../patch';
import {HAND_SONIC, THROUGH_PORT, VIRTUAL_KEYBOARD} from './midi-ports';

function createSystem(): Patch {
  const commonHarmonyDrum = {
    baseNoteInputFilter: filterByNoteOnRange(HAND_SONIC, [10, 127]),
    resetDuration: 2_000,
    outputPortName: THROUGH_PORT,
  };

  const effects = [
    new HarmonyDrum({
      ...commonHarmonyDrum,
      trigger: filterBy(HAND_SONIC, 1),
      noteOffsets: [12, 19],
      resetFilter: filterBy(HAND_SONIC, A4)
    }),
    new HarmonyDrum({
      ...commonHarmonyDrum,
      trigger: filterBy(HAND_SONIC, 5),
      noteOffsets: [19]
    })
  ];

  return {
    name: 'System',
    midi_program: 51, // A74
    onMidiEvent(midiEvent: MidiEvent, midiOut: MidiOut) {
      applyEffects(midiEvent, midiOut, effects);
    }
  }
}

export const system = createSystem();
