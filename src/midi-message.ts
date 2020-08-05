type Channel = number;
type U7 = number;

export type MidiMessage =
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
        return [9 << 4 + midiMessage.channel, midiMessage.note, midiMessage.velocity];
      case 'NoteOff':
        return [8 << 4 + midiMessage.channel, midiMessage.note, midiMessage.velocity];
      case 'ControlChange':
        return [0xB << 4 + midiMessage.channel, midiMessage.control, midiMessage.value];
      case 'ProgramChange':
        return [0xC << 4 + midiMessage.channel, midiMessage.number];
      case 'Unknown':
        return midiMessage.data;
    }
  }
}

export type RawMidiMessage = [number, number] | [number, number, number] | Uint8Array;

export const MidiMessageRaw = {
  noteOn: (note: U7, velocity = 127, channel = 0) => MidiMessage.toRaw({
    type: 'NoteOn',
    note, velocity, channel
  }),

  noteOff: (note: U7, velocity = 127, channel = 0) => MidiMessage.toRaw({
    type: 'NoteOff',
    note, velocity, channel
  }),

  controlChange: (control: U7, value: U7, channel = 0) => MidiMessage.toRaw({
    type: 'ControlChange',
    control, value, channel
  }),

  pitchBendChange: (value: U7, channel = 0): RawMidiMessage => [0xC << 4 + channel, value >> 8, value & 0xff],
}
