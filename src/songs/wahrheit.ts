import {ControlSequenceStepper} from '../effects/control-sequence-stepper';
import {HarmonyDrum} from '../effects/harmony-drum';
import {MOD, OSC2_SEMITONE} from '../microkorg';
import {MidiEvent} from '../midi-event';
import {filterBy, filterByPort} from '../midi-filter';
import {MidiOut} from '../midi-out';
import {applyEffects, Patch} from '../patch';
import {EXPRESS_PEDAL, HAND_SONIC, THROUGH_PORT, USB_MIDI_ADAPTER, VMPK} from './midi-ports';

function createWahrheit(): Patch {
  const effects = [
    new HarmonyDrum({
      baseNoteInputFilter: filterByPort(VMPK),
      outputPortName: THROUGH_PORT,
      trigger: filterBy(HAND_SONIC, 74),
      noteOffsets: [12],
      noteDuration: 100
    }),
    new ControlSequenceStepper({
      trigger: filterBy(HAND_SONIC, 74),
      outputPortName: USB_MIDI_ADAPTER,
      control: OSC2_SEMITONE,
      values: [64, 95],
      resetFilter: filterBy(HAND_SONIC, 70)
    })
  ];

  return {
    name: 'Wahrheit',
    midiProgram: 48, // A71
    onMidiEvent(midiEvent: MidiEvent, midiOut: MidiOut) {
      applyEffects(midiEvent, midiOut, effects);

      if (midiEvent.portName === EXPRESS_PEDAL && midiEvent.message.type === 'ControlChange') {
        midiOut.controlChange(THROUGH_PORT, MOD, midiEvent.message.value);
        midiOut.controlChange(USB_MIDI_ADAPTER, MOD, midiEvent.message.value);
      }
    }
  }
}

export const wahrheit = createWahrheit();
