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

export function filterByNoteOnInRange(portName: string, noteRange: [number, number]): MidiFilter {
  return (midiEvent) =>
    midiEvent.portName === portName &&
    midiEvent.message.type === 'NoteOn' &&
    noteRange[0] <= midiEvent.message.note && midiEvent.message.note <= noteRange[1];
}

export function filterByNoteInRange(portName: string, noteRange: [number, number]): MidiFilter {
  return (midiEvent) =>
    midiEvent.portName === portName &&
    (midiEvent.message.type === 'NoteOn' || midiEvent.message.type === 'NoteOff') &&
    noteRange[0] <= midiEvent.message.note && midiEvent.message.note <= noteRange[1];
}

