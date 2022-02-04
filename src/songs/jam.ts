import {ControlForwarder} from '../effects/control-forwarder';
import {MOD} from '../microkorg';
import {MidiEvent} from '../midi-event';
import {MidiOut} from '../midi-out';
import {EXPRESS_PEDAL, MICRO_KORG} from '../midi-ports';
import {applyEffects, Patch} from '../patch';

export function jam(): Patch {
  const effects = [
    new ControlForwarder(EXPRESS_PEDAL, MICRO_KORG, MOD),
  ];

  return {
    name: 'Jam',
    midiProgram: 1, // A71
    onMidiEvent(midiEvent: MidiEvent, midiOut: MidiOut) {
      applyEffects(midiEvent, midiOut, effects);
    }
  }
}
