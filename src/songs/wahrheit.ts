import {ControlSequenceStepper} from '../effects/control-sequence-stepper';
import {HarmonyDrum} from '../effects/harmony-drum';
import {CUTOFF, OSC2_SEMITONE} from '../microkorg';
import {MidiEvent} from '../midi-event';
import {filterBy, filterByPort} from '../midi-filter';
import {MidiMessageRaw} from '../midi-message';
import {MidiOut} from '../midi-out';
import {Patch} from '../patch';
import {mapRange} from '../utils';
import {HAND_SONIC, MidiThroughPort, USB_MIDI_ADAPTER, VMPK} from './midi-ports';

function createWahrheit(): Patch {
  const effects = [
    new HarmonyDrum({
      baseNoteInputFilter: filterByPort(VMPK),
      outputPortName: MidiThroughPort,
      trigger: filterBy(HAND_SONIC, 74),
      noteOffsets: [12]
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
    async onMidiEvent(midiEvent: MidiEvent, midiOut: MidiOut) {
      // console.log('onMidiEvent', midiEvent, midiEvent.message);
      for (const effect of effects) {
        effect.onMidiEvent(midiEvent, midiOut).then(r => {/*Ignore*/
        });
      }
      if (midiEvent.portName === VMPK && midiEvent.message.type === 'ControlChange') {
        midiOut.send(MidiThroughPort, MidiMessageRaw.pitchBendChange(midiEvent.message.value))
        const cutoffValue = mapRange([0, 127], [10, 127], midiEvent.message.value);
        midiOut.send(MidiThroughPort, MidiMessageRaw.controlChange(CUTOFF, cutoffValue))
      }
    }
  }
}

export const wahrheit = createWahrheit();
