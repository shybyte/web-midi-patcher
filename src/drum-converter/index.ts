import {convertH2PatternToMidiSequence} from "./convert";
import {ONE_NOTE_H2, ONE_NOTE_WITH_POSITION_H2} from "./__test/data/one-note.h2";
import {SHORT_H2} from "./__test/data/short.h2";
import {ROCK_H2} from "./__test/data/rock.h2";


const inputArray = document.getElementById('input') as HTMLInputElement;
const outputArray = document.getElementById('output') as HTMLInputElement;

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

onInput();