import {MIDIMessage} from './midi-message';
import MIDIOutput = WebMidi.MIDIOutput;

export interface Patch {
  onMidiEvent(midiMessage: MIDIMessage, midiOutputs: MIDIOutput[]): void;
}

