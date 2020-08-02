import {MIDIMessage} from '../midi-message';
import {Patch} from '../patch';

export const young: Patch = {
  onMidiEvent(midiMessage: MIDIMessage, midiOutputs: WebMidi.MIDIOutput[]): void {
    console.log('onMidiEvent', midiMessage);
  }
};
