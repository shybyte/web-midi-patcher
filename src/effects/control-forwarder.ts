import {MidiEvent} from '../midi-event';
import {U7} from '../midi-message';
import {MidiOut} from '../midi-out';
import {Effect} from '../patch';

export class ControlForwarder implements Effect {
  constructor(
    private inputPort: string,
    private outputPort: string,
    private outputControl: U7,
    private mapper: (value: U7) => U7 = (x) => x,
    private channel?: number,
    private inputControl?: number
  ) {
  }

  onMidiEvent(midiEvent: MidiEvent, midiOut: MidiOut) {
    if (midiEvent.comesFrom(this.inputPort) && midiEvent.message.type === 'ControlChange'
      && (!this.inputControl || midiEvent.message.control === this.inputControl)
    ) {
      const mappedValue = this.mapper(midiEvent.message.value);
      console.log('forward control value', midiEvent, midiEvent.message.value, mappedValue, this.outputControl, this.outputPort);
      midiOut.controlChange(this.outputPort, this.outputControl, mappedValue, this.channel ?? 0);
    }
  }
}
