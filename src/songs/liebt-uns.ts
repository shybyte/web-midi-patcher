import {ControlForwarder} from '../effects/control-forwarder';
import {HarmonyDrum} from '../effects/harmony-drum';
import {CUTOFF, MOD} from '../microkorg';
import {MidiEvent} from '../midi-event';
import {filterBy, filterByNoteInRange, filterByNoteOnInRange, filterNoteOnByPort} from '../midi-filter';
import {MidiOut} from '../midi-out';
import {EXPRESS_PEDAL, HAND_SONIC, THROUGH_PORT, MICRO_KORG} from '../midi-ports';
import {A4} from '../midi_notes';
import {applyEffects, Patch} from '../patch';

export function liebtUns(): Patch {
  const commonHarmonyDrum = {
    baseNoteInputFilter: filterNoteOnByPort(MICRO_KORG),
    resetDuration: 2_000,
    outputPortName: MICRO_KORG,
  };

  function mapHandSonicToNoteOffset(triggerNote: number, noteOffset: number) {
    return new HarmonyDrum({
      ...commonHarmonyDrum,
      trigger: filterBy(HAND_SONIC, triggerNote),
      noteOffsets: [noteOffset],
    });
  }

  const effects = [
    mapHandSonicToNoteOffset(74, 0),
    mapHandSonicToNoteOffset(60, 12),
    mapHandSonicToNoteOffset(67, 7),
    new ControlForwarder(EXPRESS_PEDAL, MICRO_KORG, CUTOFF),
  ];

  return {
    name: 'Liebt uns',
    midiProgram: 113, // b72
    drumProgram: 106,
    onMidiEvent(midiEvent: MidiEvent, midiOut: MidiOut) {
      applyEffects(midiEvent, midiOut, effects);
    }
  }
}
