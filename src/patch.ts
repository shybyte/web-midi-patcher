import {MidiEvent} from './midi-event';
import {MidiOut} from './midi-out';

export interface Effect {
  onMidiEvent(midiMessage: MidiEvent, midiOut: MidiOut): void;
}

export interface Patch extends Effect {
  name: string;
}

