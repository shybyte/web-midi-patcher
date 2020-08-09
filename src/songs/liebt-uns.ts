import {ControlForwarder} from '../effects/control-forwarder';
import {HarmonyDrum} from '../effects/harmony-drum';
import {CUTOFF, VOLUME} from '../microkorg';
import {MidiEvent} from '../midi-event';
import {and, filterByNoteOff, filterByNoteOn, filterNoteOnByPort, isControlValueInRange, or} from '../midi-filter';
import {MidiOut} from '../midi-out';
import {EXPRESS_PEDAL, HAND_SONIC, MICRO_KORG} from '../midi-ports';
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
      trigger: or(
        and(isControlValueInRange(EXPRESS_PEDAL, VOLUME, [10, 128]), filterByNoteOn(HAND_SONIC, triggerNote)),
        filterByNoteOff(HAND_SONIC, triggerNote)
      ),
      noteOffsets: [noteOffset],
    });
  }

  const effects = [
    mapHandSonicToNoteOffset(74, 0),
    mapHandSonicToNoteOffset(60, 12),
    mapHandSonicToNoteOffset(64, 7),
    new ControlForwarder(EXPRESS_PEDAL, MICRO_KORG, CUTOFF),
  ];

  return {
    name: 'Liebt uns',
    midiProgram: 113, // b72
    onMidiEvent(midiEvent: MidiEvent, midiOut: MidiOut) {
      applyEffects(midiEvent, midiOut, effects);
    }
  }
}
