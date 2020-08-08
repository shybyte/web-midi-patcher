import {ControlForwarder} from '../effects/control-forwarder';
import {HarmonyDrum} from '../effects/harmony-drum';
import {CUTOFF} from '../microkorg';
import {MidiEvent} from '../midi-event';
import {filterBy, filterByPort} from '../midi-filter';
import {MidiOut} from '../midi-out';
import {EXPRESS_PEDAL, THROUGH_PORT, USB_MIDI_ADAPTER, VIRTUAL_KEYBOARD, VMPK} from '../midi-ports';
import {applyEffects, Patch} from '../patch';
import {mapRange, rangeMapper} from '../utils';

export function young(): Patch {
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
    }),
    new ControlForwarder(EXPRESS_PEDAL, USB_MIDI_ADAPTER, CUTOFF, rangeMapper([0, 255], [10, 255])),
  ];

  return {
    name: 'Young',
    midiProgram: 28, // A45
    drumProgram: 106,
    onMidiEvent(midiEvent: MidiEvent, midiOut: MidiOut) {
      applyEffects(midiEvent, midiOut, effects);

      if (midiEvent.portName === EXPRESS_PEDAL && midiEvent.message.type === 'ControlChange') {
        midiOut.pitchBendChange(THROUGH_PORT, midiEvent.message.value)
      }
    }
  }
}
