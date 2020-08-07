import {MidiMessage, RawMidiMessage, U7} from './midi-message';

type MIDIOutputMap = WebMidi.MIDIOutputMap;

export class MidiOut {
  private midiOutputs: WebMidi.MIDIOutput[];

  constructor(midiOutputMap: MIDIOutputMap) {
    this.midiOutputs = [...midiOutputMap.values()];
  }

  public send(portName: string, message: [number, number] | [number, number, number] | Uint8Array | MidiMessage) {
    const port = this.midiOutputs.find(it => it.name === portName);
    if (!port) {
      console.warn(`Can't find port name "${portName}"`);
      return;
    }

    port.send( 'length' in message ? message : MidiMessage.toRaw(message));
  }

  public noteOn(portName: string, note: U7, velocity = 127, channel = 0) {
    this.send(portName, [9 << 4 + channel, note, velocity]);
  }

  public noteOff(portName: string, note: U7, velocity = 127, channel = 0) {
    this.send(portName, [8 << 4 + channel, note, velocity]);
  }

  public programChange(portName: string, programNumber: U7, channel = 0) {
    this.send(portName, [0xC << 4 + channel, programNumber]);
  }


  public controlChange(portName: string, control: U7, value: U7, channel = 0) {
    this.send(portName, [0xB << 4 + channel, control, value]);
  }

  public pitchBendChange(portName: string, value: U7, channel = 0) {
    this.send(portName, [0xE << 4 + channel, value >> 8, value & 0xff]);
  }
}

