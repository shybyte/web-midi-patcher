import {ControlForwarder} from '../effects/control-forwarder';
import {harmony, Harmony, octaveUpSequence, repeatSequence, SequenceDrum} from '../effects/sequence-drum';
import {MidiEvent} from '../midi-event';
import {MidiOut} from '../midi-out';
import {EXPRESS_PEDAL, THROUGH_PORT, VMPK,} from '../midi-ports';
import {A2, C5, D3, D5, E5, F3, F5, G3} from '../midi_notes';
import {applyEffects, Patch, PatchProps} from '../patch';
import {rangeMapper} from '../utils';

const DRUM_INPUT_DEVICE = VMPK;
const OUT_DEVICE = THROUGH_PORT;
// const DRUM_INPUT_DEVICE = HAND_SONIC;
// const OUT_DEVICE = NTS;

const NTS_CONTROLL = {
  CUTOFF: 43,
  OSC_TYPE: 53,
  OSC_SHAPE: 54,
  OSC_ALT: 55,
}

export function sequenceDrums(props: PatchProps): Patch {


  const harmonies: Harmony[] = [
    harmony(C5, repeatSequence(octaveUpSequence(A2), 4)),
    harmony(D5, repeatSequence(octaveUpSequence(D3), 4)),
    harmony(E5, repeatSequence(octaveUpSequence(F3), 4)),
    harmony(F5, repeatSequence(octaveUpSequence(G3), 4)),
  ];

  const effects = [
    new ControlForwarder(EXPRESS_PEDAL, OUT_DEVICE, NTS_CONTROLL.OSC_ALT,
      rangeMapper([0, 127], [0, 127])
    ),
    new SequenceDrum({
      drumInputDevice: DRUM_INPUT_DEVICE,
      outputDevice: OUT_DEVICE,
      harmonies,
    })

  ]

  return {
    name: 'Sequence-Drums',
    midiProgram: 28, // a45
    drumProgram: 110,
    onMidiEvent(midiEvent: MidiEvent, midiOut: MidiOut) {
      const midiMessage = midiEvent.message;
      console.log('midiEvent', midiEvent, midiMessage);
      applyEffects(midiEvent, midiOut, effects);
    }
  }
}

