import {ControlForwarder} from '../effects/control-forwarder';
import {ControlSequenceStepper} from '../effects/control-sequence-stepper';
import {HarmonyDrum} from '../effects/harmony-drum';
import {CUTOFF, MOD, OSC2_SEMITONE} from '../microkorg';
import {MidiEvent} from '../midi-event';
import {filterBy, filterNoteOnByPort} from '../midi-filter';
import {MidiOut} from '../midi-out';
import {applyEffects, Patch} from '../patch';
import {EXPRESS_PEDAL, HAND_SONIC, THROUGH_PORT, USB_MIDI_ADAPTER, VMPK} from '../midi-ports';
import {rangeMapper} from '../utils';

export function wahrheit(): Patch {
  const effects = [
    new HarmonyDrum({
      baseNoteInputFilter: filterNoteOnByPort(VMPK),
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
    }),
    new ControlForwarder(EXPRESS_PEDAL, THROUGH_PORT, MOD),
    new ControlForwarder(EXPRESS_PEDAL, USB_MIDI_ADAPTER, MOD),
  ];

  return {
    name: 'Wahrheit',
    midiProgram: 48, // A71
    onMidiEvent(midiEvent: MidiEvent, midiOut: MidiOut) {
      applyEffects(midiEvent, midiOut, effects);
    }
  }
}
