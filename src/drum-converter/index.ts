import {convertH2PatternToMidiSequence} from "./convert";
import {ROCK_H2} from "./__test/data/rock.h2";
import {MidiOut} from "../midi-out";
import {SingleMidiSequencePlayer} from "../effects/midi-sequence-drum";
import {THROUGH_PORT} from "../midi-ports";
import {replaceNotes} from "../midi-sequence-utils";
import {gmRockKitToFluidStandard} from "../drum-mapping";
import {HTMLInputElement} from "happy-dom";
import {repeatSequence} from "../effects/sequence-drum";
import {repeat} from "../utils";

const inputArray = document.getElementById('input') as HTMLTextAreaElement;
inputArray.value = ROCK_H2;
const outputArray = document.getElementById('output') as HTMLTextAreaElement;

function onInput() {
  const h2PatternXml = inputArray.value;
  if (h2PatternXml.trim().length>0) {
    outputArray.value = JSON.stringify(convertH2PatternToMidiSequence(h2PatternXml).midiSequence, null, 2);
  } else {
    outputArray.value = 'No input.'
  }
}

inputArray.addEventListener('input', () => {
  onInput();
});

async function startPlayer() {
  const midiAccess = await navigator.requestMIDIAccess({sysex: true});
  console.log('Inputs:', [...midiAccess.inputs.values()].map(it => it.name));
  console.log('Outputs:', [...midiAccess.outputs.values()].map(it => it.name));
  const midiOut = new MidiOut(midiAccess.outputs);
  const tickDurationInput = document.getElementById('tickDuration') as unknown as HTMLInputElement;
  const repetitionsInput = document.getElementById('repetitions') as unknown as HTMLInputElement;
  const playButton = document.getElementById('playButton') as HTMLButtonElement;
  playButton.addEventListener('click', () => {
    const notes = JSON.parse(outputArray.value);
    console.log('notes:', notes)
    const singleMidiSequencePlayer = new SingleMidiSequencePlayer({
      notes: repeat(replaceNotes(notes, gmRockKitToFluidStandard), parseInt(repetitionsInput.value)),
      outputPortName: THROUGH_PORT,
      tickDurationMs: parseFloat(tickDurationInput.value)
    });
    singleMidiSequencePlayer.start(midiOut);
  })
}

onInput();
startPlayer()