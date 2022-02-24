import {MidiEvent} from '../midi-event';
import {MidiFilter} from '../midi-filter';
import {MidiOut} from '../midi-out';
import {Effect} from '../patch';
import {waitMs} from '../utils';

export interface NoteSequencerProps {
  readonly trigger: MidiFilter;
  readonly outputPortName: string;
  readonly control: number,
  readonly notes: number[];
  readonly step_duration: number;
  readonly note_duration: number;
  readonly noteMapper?: (value: number) => number;
}

export interface NoteSequencerPropsInternal extends NoteSequencerProps {
  readonly noteMapper: (value: number) => number;
}


export class NoteSequencer implements Effect {
  player?: NoteSequencePlayer;
  props: NoteSequencerPropsInternal;

  constructor(props: NoteSequencerProps) {
    this.props = {noteMapper: (x) => x, ...props};
  }

  set stepDuration(valueMs: number) {
    this.props = {...this.props, step_duration: valueMs}
  }

  onMidiEvent(midiEvent: MidiEvent, midiOut: MidiOut) {
    const props = this.props;

    if (!(props.trigger(midiEvent))) {
      return;
    }

    if (this.player) {
      this.player.stop();
    }

    this.player = new NoteSequencePlayer(this.props);
    this.player.start(midiOut);
  }
}

type  NoteSequencePlayerProps = Pick<NoteSequencerPropsInternal,
  'outputPortName' | 'control' | 'notes' | 'step_duration' | 'note_duration' | 'noteMapper'>


class NoteSequencePlayer {
  private noteIndex = 0;
  private stopped = false;

  constructor(private props: NoteSequencePlayerProps) {
  }

  async start(midiOut: MidiOut) {
    const {props} = this;
    while (this.noteIndex < props.notes.length && !this.stopped) {
      const note = this.props.noteMapper(props.notes[this.noteIndex]);
      // console.log('Send Note!', outputValue, note, this.noteIndex);
      this.noteIndex += 1;
      midiOut.noteOn(props.outputPortName, note);
      await waitMs(this.props.note_duration)
      midiOut.noteOff(props.outputPortName, note);
      if (this.noteIndex < props.notes.length) {
        await waitMs(this.props.step_duration - this.props.note_duration);
      }
    }
  }

  stop() {
    this.stopped = true;
  }
}
