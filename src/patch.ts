import {MidiEvent} from './midi-event';
import {MidiOut} from './midi-out';

export interface Effect {
  onMidiEvent(midiEvent: MidiEvent, midiOut: MidiOut): void;
}

export interface PatchProps {
  setStatusDisplayHtml(html: string): void;
}

export interface Patch extends Effect {
  name: string;
  drumProgram?: number;
  midiProgram: number;
}

export function applyEffects(midiEvent: MidiEvent, midiOut: MidiOut, effects: Effect[]) {
  for (const effect of effects) {
    effect.onMidiEvent(midiEvent, midiOut);
  }
}

