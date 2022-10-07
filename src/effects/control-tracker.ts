import {MidiEvent} from "../midi-event";

export class ControlTracker {
  #value: number = 0;

  get value() {
    return this.#value;
  }

  constructor(
    private readonly midiDev: string,
    private readonly control: number,
    private onChange?: (oldVal: number, newVal: number) => void
  ) {
  }

  onMidiEvent(midiEvent: MidiEvent,) {
    if (midiEvent.comesFrom(this.midiDev) &&
      midiEvent.message.type === 'ControlChange' && midiEvent.message.control === this.control) {
      if (this.onChange && midiEvent.message.value !== this.#value) {
        this.onChange(this.#value, midiEvent.message.value);
      }
      this.#value = midiEvent.message.value;
    }
  }
}