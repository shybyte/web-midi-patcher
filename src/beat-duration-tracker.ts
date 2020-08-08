import {MidiEvent} from './midi-event';
import {MidiFilter} from './midi-filter';

export interface BeatDurationProps {
  filter: MidiFilter;
  defaultBeatDuration: number;
}

export class BeatDurationTracker {
  private lastTimeStamp = 0;
  #beatDuration = 0;

  constructor(private props: BeatDurationProps) {
    this.#beatDuration = props.defaultBeatDuration;
  }

  get beatDuration() {
    return this.#beatDuration;
  }

  onMidiEvent(midiEvent: MidiEvent) {
    const props = this.props;

    if (!props.filter(midiEvent)) {
      return;
    }

    let lastBeatDuration = Date.now() - this.lastTimeStamp;
    const minAcceptableDuration = props.defaultBeatDuration * 2 / 3;
    const maxAcceptableDuration = props.defaultBeatDuration * 3 / 2;
    if (minAcceptableDuration < lastBeatDuration && lastBeatDuration < maxAcceptableDuration) {
      this.#beatDuration = lastBeatDuration;
    }

    this.lastTimeStamp = Date.now();
  }
}
