import {MidiOut} from './midi-out';
import {THROUGH_PORT} from './midi-ports';
import {Patch} from './patch';

type PatchSelectionHandler = (selectedPatch: Patch) => void;

function renderPatches(patches: Patch[]) {
  // Render initial view
  const patchesListHtml = (patches.map((patch, i) => (
      `<li class="patch" data-index="${i}"><a href="#${patch.name}">${patch.name}</a></li>`
    )).join('')
  );
  const patchesListElement = document.getElementById('patches')!;
  patchesListElement.innerHTML = patchesListHtml;

  document.addEventListener('keydown', (keyEvent) => {
    const patchEl = document.querySelector('.patch[aria-selected="true"]');
    const selectedPatchIndex = parseInt(patchEl!.getAttribute('data-index')!);
    if (keyEvent.key === 'ArrowUp') {
      switchPatchPage(patches[(selectedPatchIndex + patches.length - 1) % patches.length]);
    } else if (keyEvent.key === 'ArrowDown') {
      switchPatchPage(patches[(selectedPatchIndex + 1) % patches.length]);
    }
  });
}

export interface View {
  setCurrentPatchDisplay(html: string): void;
}

export function renderInitialView(patches: Patch[], handlePanicButton: () => void): View {
  const panicButton = document.getElementById('panicButton')!;
  panicButton.addEventListener('click', handlePanicButton);

  renderPatches(patches);

  const currentPatchStatusDisplay = document.getElementById('currentPatchStatusDisplay')!;
  return {
    setCurrentPatchDisplay(html: string) {
      currentPatchStatusDisplay.innerHTML = html;
    }
  }
}

export function switchPatchPage(patch: Patch) {
  location.hash = patch.name;
}

export function renderPatchSelection(selectedPatch: Patch) {
  const patchListItems = document.getElementsByClassName('patch');
  for (const patchEl of patchListItems) {
    patchEl.setAttribute('aria-selected',
      patchEl.textContent === selectedPatch.name ? 'true' : 'false');
  }
}

export function connectControls(midiOut: MidiOut) {
  const inputs = document.querySelectorAll<HTMLInputElement>('#controls input');
  for (const input of inputs) {
    input.addEventListener('input', (event) => {
      const controlIndex = parseInt(input.dataset['control']!);
      midiOut.controlChange(THROUGH_PORT, controlIndex, input.valueAsNumber);
    });
  }
}
