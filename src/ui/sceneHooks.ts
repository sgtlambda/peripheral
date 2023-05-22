import {useState} from "react";

import {NPC} from "../NPC";

export type SceneUiNpcInfo = {
  x: number;
  y: number;
  npc: NPC;
  messages: number;
  proximity: number;
};

/**
 * Placeholder 'noop' function for the global NPCs state setter.
 */
export let _setNpcs = (updater: (value: Record<number, SceneUiNpcInfo>) => Record<number, SceneUiNpcInfo>) => {
  console.warn("setNpcs called before it was initialized");
};

export function useNpcs(): Record<number, SceneUiNpcInfo> {

  const [npcs, setNpcs] = useState<Record<number, SceneUiNpcInfo>>([]);

  _setNpcs = setNpcs;

  return npcs;
}