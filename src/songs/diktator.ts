import {BeatDurationTracker} from '../beat-duration-tracker';
import {ControlForwarder} from '../effects/control-forwarder';
import {ControlSequencer} from '../effects/control-sequencer';

import {CUTOFF, OSC2_SEMITONE} from '../microkorg';
import {MidiEvent} from '../midi-event';
import {filterBy, filterNoteOnByPort} from '../midi-filter';
import {MidiOut} from '../midi-out';
import {EXPRESS_PEDAL, USB_MIDI_ADAPTER, VIRTUAL_KEYBOARD} from '../midi-ports';
import {applyEffects, Patch} from '../patch';

export function diktator(): Patch {
  const defaultBeatDuration = 2000;

  const calcStepDuration = (beatDuration: number) => beatDuration / 16;

  const commonControlSequencer = {
    outputPortName: USB_MIDI_ADAPTER,
    step_duration: calcStepDuration(defaultBeatDuration),
  };

  const beatTracker = new BeatDurationTracker({
    filter: filterNoteOnByPort(USB_MIDI_ADAPTER),
    defaultBeatDuration: defaultBeatDuration
  });

  const controlSequencer = new ControlSequencer({
    ...commonControlSequencer,
    trigger: filterBy(VIRTUAL_KEYBOARD, 71),
    control: OSC2_SEMITONE,
    values: [126, 114, 96, 78, 126, 126, 114, 114, 64]
  });

  const effects = [
    controlSequencer,
    new ControlForwarder(EXPRESS_PEDAL, USB_MIDI_ADAPTER, CUTOFF)
  ];

  return {
    name: 'Diktator',
    midiProgram: 43, // A64
    onMidiEvent(midiEvent: MidiEvent, midiOut: MidiOut) {
      beatTracker.onMidiEvent(midiEvent);
      controlSequencer.stepDuration = calcStepDuration(beatTracker.beatDuration);
      applyEffects(midiEvent, midiOut, effects);
    }
  }
}
