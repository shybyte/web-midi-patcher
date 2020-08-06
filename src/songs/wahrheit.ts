import {ControlSequenceStepper} from '../effects/control-sequence-stepper';
import {HarmonyDrum} from '../effects/harmony-drum';
import {CUTOFF, MOD, OSC2_SEMITONE} from '../microkorg';
import {MidiEvent} from '../midi-event';
import {filterBy, filterByPort} from '../midi-filter';
import {MidiMessageRaw} from '../midi-message';
import {MidiOut} from '../midi-out';
import {applyEffects, Patch} from '../patch';
import {mapRange} from '../utils';
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
    midi_program: 48, // A71
    onMidiEvent(midiEvent: MidiEvent, midiOut: MidiOut) {
      applyEffects(midiEvent, midiOut, effects);

      if (midiEvent.portName === EXPRESS_PEDAL && midiEvent.message.type === 'ControlChange') {
        midiOut.send(THROUGH_PORT, MidiMessageRaw.controlChange(MOD, midiEvent.message.value));
        midiOut.send(USB_MIDI_ADAPTER, MidiMessageRaw.controlChange(MOD, midiEvent.message.value));
      }
    }
  }
}

export const wahrheit = createWahrheit();
