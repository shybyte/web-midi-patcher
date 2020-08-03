import {MidiEvent} from './midi-event';
import MIDIOutput = WebMidi.MIDIOutput;

export interface Patch {
  onMidiEvent(midiMessage: MidiEvent, midiOutputs: MIDIOutput[]): void;
}

