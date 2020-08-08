import {BeatDurationTracker} from '../beat-duration-tracker';
import {ControlForwarder} from '../effects/control-forwarder';
import {ControlSequencer} from '../effects/control-sequencer';

import {CUTOFF, MOD, OSC2_SEMITONE} from '../microkorg';
import {MidiEvent} from '../midi-event';
import {filterBy, filterNoteOnByPort} from '../midi-filter';
import {MidiOut} from '../midi-out';
import {EXPRESS_PEDAL, HAND_SONIC, THROUGH_PORT, MICRO_KORG} from '../midi-ports';
import {applyEffects, Patch} from '../patch';

export function diktator(): Patch {
  const defaultBeatDuration = 2000;
  let korgModValue = 0;

  const calcStepDuration = (beatDuration: number) => beatDuration / 16;

  const commonControlSequencer = {step_duration: calcStepDuration(defaultBeatDuration)};

  const beatTracker = new BeatDurationTracker({
    filter: filterNoteOnByPort(MICRO_KORG),
    defaultBeatDuration: defaultBeatDuration
  });

  const handSonicBaseDrum = filterBy(HAND_SONIC, 71);

  const controlSequencerKorg = new ControlSequencer({
    ...commonControlSequencer,
    outputPortName: MICRO_KORG,
    trigger: handSonicBaseDrum,
    control: OSC2_SEMITONE,
    values: [126, 114, 96, 78, 126, 126, 114, 114, 64]
  });

  const controlSequencerThroughPort = new ControlSequencer({
    ...commonControlSequencer,
    outputPortName: THROUGH_PORT,
    trigger: handSonicBaseDrum,
    control: MOD,
    values: [126, 114, 96, 78, 0],
    outputValueMapper: (x) => x * korgModValue
  });

  const effects = [
    controlSequencerKorg,
    controlSequencerThroughPort,
    new ControlForwarder(EXPRESS_PEDAL, MICRO_KORG, CUTOFF)
  ];

  return {
    name: 'Diktator',
    midiProgram: 43, // A64
    onMidiEvent(midiEvent: MidiEvent, midiOut: MidiOut) {
      if (midiEvent.comesFrom(MICRO_KORG) &&
        midiEvent.message.type === 'ControlChange' && midiEvent.message.control == MOD
      ) {
        korgModValue = midiEvent.message.value;
      }

      beatTracker.onMidiEvent(midiEvent);
      controlSequencerKorg.stepDuration = calcStepDuration(beatTracker.beatDuration);
      controlSequencerThroughPort.stepDuration = calcStepDuration(beatTracker.beatDuration);

      applyEffects(midiEvent, midiOut, effects);
    }
  }
}
