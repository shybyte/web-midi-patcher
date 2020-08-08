import {ControlForwarder} from '../effects/control-forwarder';
import {ControlSequenceStepper} from '../effects/control-sequence-stepper';
import {HarmonyDrum} from '../effects/harmony-drum';
import {MOD, OSC2_SEMITONE} from '../microkorg';
import {MidiEvent} from '../midi-event';
import {filterByNoteOn, filterByNoteOnInRange} from '../midi-filter';
import {MidiOut} from '../midi-out';
import {EXPRESS_PEDAL, HAND_SONIC, MICRO_KORG, THROUGH_PORT} from '../midi-ports';
import {C2, C4} from '../midi_notes';
import {applyEffects, Patch} from '../patch';

export function wahrheit(): Patch {
  const effects = [
    new HarmonyDrum({
      baseNoteInputFilter: filterByNoteOnInRange(MICRO_KORG, [C2, C4]),
      outputPortName: THROUGH_PORT,
      trigger: filterByNoteOn(HAND_SONIC, 74),
      noteOffsets: [0],
      noteDuration: 100
    }),
    new ControlSequenceStepper({
      trigger: filterByNoteOn(HAND_SONIC, 74),
      outputPortName: MICRO_KORG,
      control: OSC2_SEMITONE,
      values: [64, 95],
      resetFilter: filterByNoteOn(HAND_SONIC, 70)
    }),
    new ControlForwarder(EXPRESS_PEDAL, THROUGH_PORT, MOD),
    new ControlForwarder(EXPRESS_PEDAL, MICRO_KORG, MOD),
  ];

  return {
    name: 'Wahrheit',
    midiProgram: 48, // A71
    onMidiEvent(midiEvent: MidiEvent, midiOut: MidiOut) {
      applyEffects(midiEvent, midiOut, effects);
    }
  }
}
