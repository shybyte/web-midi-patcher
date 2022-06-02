import {MidiMessage, RawMidiMessage, U7} from './midi-message';

type MIDIOutputMap = WebMidi.MIDIOutputMap;

export class MidiOut {
  private midiOutputs: WebMidi.MIDIOutput[];

  constructor(midiOutputMap: MIDIOutputMap) {
    this.midiOutputs = [...midiOutputMap.values()];
  }

  public send(portName: string, message: [number, number] | [number, number, number] | Uint8Array | MidiMessage) {
    const port = this.midiOutputs.find(it => it.name?.includes(portName));
    if (!port) {
      console.warn(`Can't find port name "${portName}"`);
      return;
    }

    port.send('length' in message ? message : MidiMessage.toRaw(message));
  }

  public noteOn(portName: string, note: U7, velocity = 127, channel = 0) {
    this.send(portName, [0x90 + channel, note, velocity]);
  }

  public noteOff(portName: string, note: U7, velocity = 127, channel = 0) {
    this.send(portName, [0x80 + channel, note, velocity]);
  }

  public programChange(portName: string, programNumber: U7, channel = 0) {
    this.send(portName, [0xC0 + channel, programNumber]);
  }

  public controlChange(portName: string, control: U7, value: U7, channel = 0) {
    this.send(portName, [0xB0 + channel, control, value]);
  }

  public pitchBendChange(portName: string, value: U7, channel = 0) {
    this.send(portName, [0xE0 + channel, value >> 8, value & 0xff]);
  }

  public allSoundsOff() {
    for (const midiOutput of this.midiOutputs) {
      this.controlChange(midiOutput.name!, 120, 0); // All Sounds off
      this.controlChange(midiOutput.name!, 123, 0); // All Notes off
      console.log('allSoundsOff', midiOutput.name);
    }
  }
}

