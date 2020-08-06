import {Patch} from './patch';

type PatchSelectionHandler = (selectedPatch: Patch) => void;

export function renderInitialView(patches: Patch[]) {
  // Render initial view
  const appHtml =
    '<ul>' + (patches.map((patch, i) => (
        `<li class="patch" data-index="${i}"><a href="#${patch.name}">${patch.name}</a></li>`
      )).join('')
    ) + '</ul>'
  const appElement = document.getElementById('app')!;
  appElement.innerHTML = appHtml;

  document.addEventListener('keydown', (keyEvent) => {
    const patchEl = document.querySelector('.patch[aria-selected="true"]');
    const selectedPatchIndex = parseInt(patchEl!.getAttribute('data-index')!);
    if (keyEvent.key === 'ArrowUp') {
      switchPatch(patches[(selectedPatchIndex + patches.length - 1) % patches.length]);
    } else if (keyEvent.key === 'ArrowDown') {
      switchPatch(patches[(selectedPatchIndex + 1) % patches.length]);
    }
  });
}

export function switchPatch(patch: Patch) {
  location.hash = patch.name;
}

export function renderPatchSelection(selectedPatch: Patch) {
  const patchListItems = document.getElementsByClassName('patch');
  for (const patchEl of patchListItems) {
    patchEl.setAttribute('aria-selected',
      patchEl.textContent === selectedPatch.name ? 'true' : 'false');
  }
}
