import {Effect} from './effect'

export interface Patch {
  name: string;
  inputMidiName: string;
  instrumentNumber: number,
  effectByNote: {[note: number]: Effect}
}