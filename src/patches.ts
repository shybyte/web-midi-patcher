import * as _ from 'lodash';

import {repeat} from './utils'
import {Effect} from './effect'
import {SweepDown} from './effects/sweep-down'
import {ControlSequencer} from './effects/control-sequencer'

const CUTOFF = 74;
const OSC2_SEMITONE = 18;
const MOD = 1;
const RESONANCE = 71;


const AMAZON_SEQ = _.concat(
  repeat([45, 57], 4),
  repeat([48, 60], 4),
  repeat([43, 55], 4),
  repeat([38, 50], 4)
);

const AMAZON_SEQ_2 = _.concat(
  repeat([45, 57], 3), [45, 55],
  repeat([48, 60], 3), [48, 59],
  repeat([43, 55], 3), [43, 56],
  repeat([38, 50], 2), [38, 52, 38, 53]
);

export const effectByNote: {[k: number]: Effect} = {
  51: new SweepDown(CUTOFF, 30),
  45: new SweepDown(CUTOFF, 30),
  49: new ControlSequencer([78, 96, 114, 126], 30, 2, OSC2_SEMITONE, 64),
  48: new ControlSequencer([78, 96, 114, 126], 30, 2, OSC2_SEMITONE, 64)
  //45: new NoteSequencer(AMAZON_SEQ, 60 / 140 * 1000 / 2, 2),
  //46: new NoteSequencer([45], 1, 1),
  //48: new SweepDown(MOD, 0),
  // 51: new SweepDown(RESONANCE, 50),
  //51: new ControlSequencer([78, 96, 114, 126], 30, 2, OSC2_SEMITONE, 64),
};
