import {Patch} from "./patch";

export interface AppViewState{
  patches: Patch[]
  currentPatch: Patch
  controller: {
    setPatch: (patch: Patch) => void
  }
}