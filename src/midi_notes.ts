export type MidiNote = number;

export const C2 = 24;

export const A2 = 33;
export const B2 = 34;
export const H2 = 35;

export const C3 = 36;
export const Cis3 = 37;
export const D3 = 38;
export const Dis3 = 39;
export const E3 = 40;
export const F3 = 41;
export const Fis3 = 42;
export const G3 = 43;
export const Gis3 = 44;
export const A3 = 45;
export const B3 = 46;
export const H3 = 47;

export const C4 = 48;
export const D4 = 50;
export const E4 = 52;
export const F4 = 53;
export const G4 = 55;
export const A4 = 57;
export const B4 = 58;
export const H4 = 58;

export const C5 = 60;
export const CIS5 = 61;
export const D5 = 62;
export const E5 = 64;
export const F5 = 65;
export const G5 = 67;
export const A5 = 69;
export const B5 = 70;

export const C6 = 72;
export const D6 = 74;
export const A6 = 81;
export const C7 = 84;

const NOTE_NAMES = ['C', 'Cis', 'D', 'Dis', 'E', 'F', 'Fis', 'G', 'Gis', 'A', 'B', 'H'];

export function midiNoteToString(note: MidiNote) {
  const octave = Math.floor(note / 12);
  const noteNameIndex = note % 12;
  return NOTE_NAMES[noteNameIndex] + octave;
}
