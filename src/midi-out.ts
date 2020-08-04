type MIDIOutputMap = WebMidi.MIDIOutputMap;

export class MidiOut {
  private midiOutputs: WebMidi.MIDIOutput[];

  constructor(midiOutputMap: MIDIOutputMap) {
    this.midiOutputs = [...midiOutputMap.values()];
  }

  public send(portName: string, message: [number, number] | [number, number, number] | Uint8Array) {
    const port = this.midiOutputs.find(it => it.name === portName);
    if (!port) {
      console.warn(`Can't find port name "${portName}"`);
      return;
    }

    port.send(message);
  }

}

