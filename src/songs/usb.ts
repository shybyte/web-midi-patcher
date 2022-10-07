import {MidiEvent} from '../midi-event';
import {MidiOut} from '../midi-out';
import {THROUGH_PORT,} from '../midi-ports';
import {E4, E5, MidiNote} from '../midi_notes';
import {Patch, PatchProps} from '../patch';
import {MOD} from "../microkorg";
import {DRUM_IN, KEYBOARD_IN} from "../config";
import {ControlTracker} from "../effects/control-tracker";
import {isRealNoteOn} from "../midi-message";

const BIT_ARP_CHANNEL = 2;

export function usbSong(props: PatchProps): Patch {
  const controlTracker = new ControlTracker(KEYBOARD_IN, MOD);
  let lastNote: MidiNote = E4;

  return {
    name: 'USB',
    midiProgram: 28, // a45
    drumProgram: 117, // Usb
    onMidiEvent(midiEvent: MidiEvent, midiOut: MidiOut) {
      controlTracker.onMidiEvent(midiEvent);
      if (midiEvent.comesFrom(DRUM_IN) && isRealNoteOn(midiEvent.message)) {
        midiOut.playNoteAndNoteOff(THROUGH_PORT, lastNote, 10, BIT_ARP_CHANNEL);
      }
      if (midiEvent.comesFrom(KEYBOARD_IN)) {
        switch (midiEvent.message.type) {
          case "NoteOn":
            lastNote = midiEvent.message.note;
            midiOut.send(THROUGH_PORT, {type: 'NoteOn', velocity: 127, channel: 0, note: midiEvent.message.note});
            if (controlTracker.value > 110 || controlTracker.value > 20 && midiEvent.message.note >= E5) {
              midiOut.send(THROUGH_PORT, {
                type: 'NoteOn',
                velocity: 127,
                channel: 1,
                note: midiEvent.message.note - 12
              });
            }
            break;
          case "NoteOff":
            midiOut.send(THROUGH_PORT, {type: 'NoteOff', velocity: 0, channel: 0, note: midiEvent.message.note});
            midiOut.send(THROUGH_PORT, {
              type: 'NoteOff',
              velocity: 127,
              channel: 1,
              note: midiEvent.message.note - 12
            });
            break;
        }
      }
      const midiMessage = midiEvent.message;
      console.log('midiMessage:', midiMessage)
    }
  }
}

