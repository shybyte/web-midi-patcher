import {MidiEvent} from '../midi-event';
import {U7} from '../midi-message';
import {MidiOut} from '../midi-out';
import {Effect} from '../patch';

export class ControlForwarder implements Effect {
  constructor(
    private inputPort: string,
    private outputPort: string,
    private outputControl: U7,
    private mapper: (value: U7) => U7 = (x) => x
  ) {
  }

  onMidiEvent(midiEvent: MidiEvent, midiOut: MidiOut) {
    if (midiEvent.portName === this.inputPort && midiEvent.message.type === 'ControlChange') {
      midiOut.controlChange(this.outputPort, this.outputControl, this.mapper(midiEvent.message.value));
    }
  }
}
