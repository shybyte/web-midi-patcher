import {MidiNote} from "./midi_notes";

export type Channel = number;
export type U7 = number;
export type U14 = number;

export type MidiMessage =
  | NoteOff
  | NoteOn
  | ControlChange
  | ProgramChange
  | PitchBend
  | Unknown

export type NoteOff = {
  type: 'NoteOff'
  channel: Channel
  note: U7
  velocity: U7
}

export type NoteOn = {
  type: 'NoteOn'
  channel: Channel
  note: U7
  velocity: U7
}

export type ControlChange = {
  type: 'ControlChange'
  channel: Channel
  control: U7
  value: U7
}

export type PitchBend = {
  type: 'PitchBend';
  channel: Channel;
  value: U14; // Default 8192
}


export type ProgramChange = {
  type: 'ProgramChange'
  channel: Channel
  number: U7
}

export type Unknown = {
  type: 'Unknown'
  data: Uint8Array;
}

type RawMidiMessageEvent = { data: Uint8Array };

export const MidiMessage = {
  from(rawMidiMessage: RawMidiMessageEvent): MidiMessage {
    const statusByte = rawMidiMessage.data[0];
    const status = statusByte >> 4;
    const channel = statusByte & 0b1111;
    switch (status) {
      case 8:
        return {
          type: 'NoteOff',
          channel,
          note: rawMidiMessage.data[1],
          velocity: rawMidiMessage.data[2]
        };
      case 9:
        return {
          type: 'NoteOn',
          channel,
          note: rawMidiMessage.data[1],
          velocity: rawMidiMessage.data[2]
        };
      case 0xB:
        return {
          type: 'ControlChange',
          channel,
          control: rawMidiMessage.data[1],
          value: rawMidiMessage.data[2]
        };
      case 0xE:
        return {
          type: 'PitchBend',
          channel,
          value: rawMidiMessage.data[2] * 128 + rawMidiMessage.data[1]
        };
      case 0xC:
        return {
          type: 'ProgramChange',
          channel,
          number: rawMidiMessage.data[1],
        };
      default:
        return {type: 'Unknown', data: rawMidiMessage.data}
    }
  },

  toRaw(midiMessage: MidiMessage): RawMidiMessage {
    switch (midiMessage.type) {
      case 'NoteOn':
        return [0x90 + midiMessage.channel, midiMessage.note, midiMessage.velocity];
      case 'NoteOff':
        return [0x80 + midiMessage.channel, midiMessage.note, midiMessage.velocity];
      case 'ControlChange':
        return [0xB0 + midiMessage.channel, midiMessage.control, midiMessage.value];
      case 'PitchBend':
        return [0xE0 + midiMessage.channel, midiMessage.value && 127, midiMessage.value >> 7];
      case 'ProgramChange':
        return [0xC0 + midiMessage.channel, midiMessage.number];
      case 'Unknown':
        return midiMessage.data;
    }
  }
}

export type RawMidiMessage = [number, number] | [number, number, number] | Uint8Array;

export function isRealNoteOn(midiMessage: MidiMessage): midiMessage is NoteOn {
  return midiMessage.type === 'NoteOn' && midiMessage.velocity > 0;
}

export function isRealNote(midiMessage: MidiMessage): midiMessage is NoteOn | NoteOff {
  return midiMessage.type === 'NoteOn' || midiMessage.type === 'NoteOff';
}

export function isRealNoteOnNote(midiMessage: MidiMessage, note: MidiNote): midiMessage is NoteOn {
  return midiMessage.type === 'NoteOn' && midiMessage.velocity > 0 && midiMessage.note === note;
}

export function isRealNoteOnBelow(midiMessage: MidiMessage, note: MidiNote): midiMessage is NoteOn {
  return midiMessage.type === 'NoteOn' && midiMessage.velocity > 0 && midiMessage.note < note;
}

export function isRealNoteOnBetween(midiMessage: MidiMessage, minNote: MidiNote, maxNote: MidiNote): midiMessage is NoteOn {
  return midiMessage.type === 'NoteOn' && midiMessage.velocity > 0 && midiMessage.note <= maxNote && midiMessage.note >= minNote;
}