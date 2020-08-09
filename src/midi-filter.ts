import {MidiEvent} from './midi-event';
import {U7} from './midi-message';
import {isInRange, NumberRange} from './utils';

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

export function filterByNoteOff(portName: string, note: number): MidiFilter {
  return (midiEvent) =>
    midiEvent.comesFrom(portName) &&
    midiEvent.message.type === 'NoteOff' &&
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


export function isControlValueInRange(portName: string, control: U7, range: NumberRange): MidiFilter {
  let inRange = false;

  return (midiEvent: MidiEvent) => {
    if (
      midiEvent.comesFrom(portName) &&
      midiEvent.message.type === 'ControlChange' &&
      midiEvent.message.control === control
    ) {
      inRange = isInRange(midiEvent.message.value, range);
    }

    return inRange;
  };
}

export function and(filter1: MidiFilter, filter2: MidiFilter): MidiFilter {
  return (midiEvent: MidiEvent) => {
    const filter1Result = filter1(midiEvent);
    const filter2Result = filter2(midiEvent);
    return filter1Result && filter2Result;
  };
}

export function or(filter1: MidiFilter, filter2: MidiFilter): MidiFilter {
  return (midiEvent: MidiEvent) => {
    const filter1Result = filter1(midiEvent);
    const filter2Result = filter2(midiEvent);
    return filter1Result || filter2Result;
  };
}
