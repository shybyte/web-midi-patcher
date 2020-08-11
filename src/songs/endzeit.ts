import {ControlForwarder} from '../effects/control-forwarder';
import {HarmonyDrum} from '../effects/harmony-drum';
import {CUTOFF} from '../microkorg';
import {MidiEvent} from '../midi-event';
import {filterByNote, filterByNoteOnInRange, filterNoteOnByPort} from '../midi-filter';
import {MidiOut} from '../midi-out';
import {EXPRESS_PEDAL, HAND_SONIC, MICRO_KORG, THROUGH_PORT,} from '../midi-ports';
import {C2, C4} from '../midi_notes';
import {applyEffects, Patch} from '../patch';

export function endzeit(): Patch {
  const effects = [
    new HarmonyDrum({
      baseNoteInputFilter: filterNoteOnByPort(MICRO_KORG),
      resetDuration: 10_0000,
      noteDuration: 100,
      outputPortName: MICRO_KORG,
      // trigger: filterByNote(HAND_SONIC, 64), // Middle
      trigger: filterByNote(HAND_SONIC, 74), // Bass
      noteOffsets: [7, 12, 19]
    }),
    new ControlForwarder(EXPRESS_PEDAL, MICRO_KORG, CUTOFF),
  ];

  return {
    name: 'Endzeit',
    midiProgram: 115, // b74
    onMidiEvent(midiEvent: MidiEvent, midiOut: MidiOut) {
      applyEffects(midiEvent, midiOut, effects);
    }
  }
}
