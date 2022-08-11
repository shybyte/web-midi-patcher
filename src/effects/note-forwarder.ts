import {MidiEvent} from '../midi-event';
import {MidiMessage, U7} from '../midi-message';
import {MidiOut} from '../midi-out';
import {Effect} from '../patch';
import {MidiFilter} from "../midi-filter";

export class NoteForwarder implements Effect {
  constructor(
    private inputFilter: MidiFilter,
    private outputPort: string,
    private messageMapper: (message: MidiMessage) => MidiMessage
  ) {
  }

  onMidiEvent(midiEvent: MidiEvent, midiOut: MidiOut) {
    if (this.inputFilter(midiEvent)) {
      midiOut.send(this.outputPort, this.messageMapper(midiEvent.message));
    }
  }
}
