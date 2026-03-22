import { contextBridge } from "electron";
import { electronAPI } from "@electron-toolkit/preload";

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld("electron", electronAPI);
  } catch {
    // Context isolation failed — fallback for older Electron
  }
} else {
  // @ts-expect-error global augmentation
  window.electron = electronAPI;
}
