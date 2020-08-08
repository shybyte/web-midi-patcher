import {MidiEvent} from './midi-event';
import {U7} from './midi-message';

export type MidiFilter = (midiEvent: MidiEvent) => boolean;

export function filterNoteOnByPort(portName: string): MidiFilter {
  return (midiEvent) =>
    midiEvent.comesFrom(portName) &&
    midiEvent.message.type === 'NoteOn';
}

export function filterByNoteOn(portName: string, note: number): MidiFilter {
  return (midiEvent) =>
    midiEvent.comesFrom(portName) &&
    midiEvent.message.type === 'NoteOn' &&
    midiEvent.message.note === note;
}

export function filterByNoteOnInRange(portName: string, noteRange: [number, number]): MidiFilter {
  return (midiEvent) =>
    midiEvent.comesFrom(portName) &&
    midiEvent.message.type === 'NoteOn' &&
    noteRange[0] <= midiEvent.message.note && midiEvent.message.note <= noteRange[1];
}

export function filterByNoteInRange(portName: string, noteRange: [number, number]): MidiFilter {
  return (midiEvent) =>
    midiEvent.comesFrom(portName) &&
    (midiEvent.message.type === 'NoteOn' || midiEvent.message.type === 'NoteOff') &&
    noteRange[0] <= midiEvent.message.note && midiEvent.message.note <= noteRange[1];
}

export function filterByNote(portName: string, note: U7): MidiFilter {
  return (midiEvent) =>
    midiEvent.comesFrom(portName) &&
    (midiEvent.message.type === 'NoteOn' || midiEvent.message.type === 'NoteOff') &&
    midiEvent.message.note === note;
}
