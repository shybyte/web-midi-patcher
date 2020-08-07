import {ControlSequencer} from '../effects/control-sequencer';
import {CUTOFF, OSC2_SEMITONE} from '../microkorg';
import {MidiEvent} from '../midi-event';
import {filterBy} from '../midi-filter';
import {MidiOut} from '../midi-out';
import {applyEffects, Patch} from '../patch';
import {USB_MIDI_ADAPTER, VIRTUAL_KEYBOARD, VMPK} from './midi-ports';

export function diktator(): Patch {
  const commonControlSequencer = {
    outputPortName: USB_MIDI_ADAPTER,
    step_duration: 100,
  };

  const effects = [
    new ControlSequencer({
      ...commonControlSequencer,
      trigger: filterBy(VIRTUAL_KEYBOARD, 71),
      control: OSC2_SEMITONE,
      values: [126, 114, 96, 78, 126, 126, 114, 114, 64]
    }),
  ];

  return {
    name: 'Diktator',
    midiProgram: 43, // A64
    onMidiEvent(midiEvent: MidiEvent, midiOut: MidiOut) {
      applyEffects(midiEvent, midiOut, effects);

      if (midiEvent.portName === VMPK && midiEvent.message.type === 'ControlChange') {
        midiOut.controlChange(USB_MIDI_ADAPTER, CUTOFF, midiEvent.message.value);
      }
    }
  }
}
