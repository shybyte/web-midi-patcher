type Channel = number;
type U7 = number;

export type MIDIMessage =
  | NoteOff
  | NoteOn
  | ControlChange
  | ProgramChange
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

export type ProgramChange = {
  type: 'ProgramChange'
  channel: Channel
  number: U7
}

export type Unknown = {
  type: 'Unknown'
  data: Uint8Array;
}

type RawMidiMessage = { data: Uint8Array };

export const MidiMessage = {
  from(rawMidiMessage: RawMidiMessage): MIDIMessage {
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
      case 0xC:
        return {
          type: 'ProgramChange',
          channel,
          number: rawMidiMessage.data[1],
        };
      default:
        return {type: 'Unknown', data: rawMidiMessage.data}
    }
  }
}
