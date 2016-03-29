import * as _ from 'lodash';
import {Effect} from './effect'
import {SweepDown} from './effects/sweep-down'
import {ControlSequencer} from './effects/control-sequencer'
import {NoteSequencer} from './effects/note-sequencer'

import MIDIAccess = WebMidi.MIDIAccess;
import MIDIInput = WebMidi.MIDIInput;
import MIDIOutput = WebMidi.MIDIOutput;

const INPUT_MIDI_NAME = 'SamplePad';
// const INPUT_MIDI_NAME = 'USB MIDI';
const OUTPUT_MIDI_NAME = 'USB MIDI';

let output: MIDIOutput;


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

const effectByNote: {[k: number]: Effect} = {
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

let activeEffects: Effect[] = [];

if (navigator.requestMIDIAccess) {
  navigator.requestMIDIAccess().then(onMIDISuccess, onMIDIFailure);
} else {
  alert("No MIDI support in your browser.");
}

function repeat<T>(array: T[], repetitions: number): T[] {
  return _.range(repetitions).reduce((acc, i) => acc.concat(array), [])
}


function onMIDISuccess(midiAccess: WebMidi.MIDIAccess) {
  console.log('MIDI Access Object', midiAccess);
  midiAccess.inputs.forEach(input => {
    console.log("Input port [type:'" + input.type + "'] id:'" + input.id +
      "' manufacturer:'" + input.manufacture + "' name:'" + input.name +
      "' version:'" + input.version + "'");
  });
  midiAccess.outputs.forEach(output1 => {
    console.log("Output port [type:'" + output1.type + "'] id:'" + output1.id +
      "' manufacturer:'" + output1.manufacture + "' name:'" + output1.name +
      "' version:'" + output1.version + "'");
    if (_.includes(output1.name, OUTPUT_MIDI_NAME)) {
      output = output1 as WebMidi.MIDIOutput;
    }
  });
  startMainLoop(midiAccess);
}


function onMIDIFailure(e: Error) {
  console.log("No access to MIDI devices or your browser doesn't support WebMIDI API. Please use WebMIDIAPIShim " + e);
}


function startMainLoop(midiAccess: MIDIAccess) {
  midiAccess.inputs.forEach(function (entry) {
    entry.onmidimessage = (event) => {
      const dataString = event.data.join(' ');
      const hexDataString = _.map(event.data, (x: number) => '0x' + x.toString(16)).join(' ');
      console.log("MIDI message received at timestamp " + event.receivedTime + "[" + event.data.length + " bytes]: " + hexDataString + '/' + dataString);

      if (!_.includes(entry.name, INPUT_MIDI_NAME)) {
        return;
      }
      if ((event.data[0] & 0xf0) === 0x90 && event.data[2] > 0) {
        const effect = effectByNote[event.data[1]];
        if (effect) {
          activeEffects = [...activeEffects.filter(activeEffect =>
            _.intersection(activeEffect.monoGroups, effect.monoGroups).length === 0
          ), effect]
          effect.trigger(event.data[2], window.performance.now());
        } else {
          console.log('No effect!', event.data[1], effectByNote);
        }
      }
    };
  });

  setInterval(() => {
    activeEffects.forEach(effect => {
      effect.play(output, window.performance.now());
    });
    activeEffects = activeEffects.filter(effect => !effect.hasFinished());
  }, 10);
}


