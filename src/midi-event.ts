import {MidiMessage} from './midi-message';

export class MidiEvent {
  constructor(
    public readonly message: MidiMessage,
    public readonly receivedTime: number,
    public readonly portName: string
  ) {
  }
}
