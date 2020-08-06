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

export function filterByNoteOnRange(portName: string, noteRange: [number, number]): MidiFilter {
  return (midiEvent) =>
    midiEvent.portName === portName &&
    midiEvent.message.type === 'NoteOn' &&
    noteRange[0] <= midiEvent.message.note && midiEvent.message.note <= noteRange[1];
}
