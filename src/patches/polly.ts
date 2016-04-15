import {CUTOFF, MOD, OSC2_SEMITONE,CONTROL1, CONTROL2, NOISE_LEVEL} from '../instruments/microkorg';
import {SweepDown} from '../effects/sweep-down';
import {ControlSequencer} from '../effects/control-sequencer';
import {Patch} from '../patch';


const patch: Patch = {
  name: 'Polly',
  inputMidiName: 'SamplePad',
  instrumentNumber: 10,
  effectByNote: {
    51: new SweepDown(CUTOFF, 30),
    45: new SweepDown(CUTOFF, 30),
    49: new ControlSequencer([78, 96, 114, 126], 30, 2, OSC2_SEMITONE, 64),
    48: new ControlSequencer([78, 96, 114, 126], 30, 2, OSC2_SEMITONE, 64)
    //45: new NoteSequencer(AMAZON_SEQ, 60 / 140 * 1000 / 2, 2),
    //46: new NoteSequencer([45], 1, 1),
    //48: new SweepDown(MOD, 0),
    // 51: new SweepDown(RESONANCE, 50),
    //51: new ControlSequencer([78, 96, 114, 126], 30, 2, OSC2_SEMITONE, 64),
  }
}

export default patch;