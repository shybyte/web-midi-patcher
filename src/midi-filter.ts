import {MidiEvent} from './midi-event';

export type MidiFilter = (midiEvent: MidiEvent) => boolean;

export function filterByPort(portName: string): MidiFilter {
  return (midiEvent) =>
    midiEvent.portName === portName &&
    midiEvent.message.type === 'NoteOn';
}

export function filterBy(portName: string, note: number): MidiFilter {
  return (midiEvent) =>
    midiEvent.portName === portName &&
    midiEvent.message.type === 'NoteOn' &&
    midiEvent.message.note === note;
}
