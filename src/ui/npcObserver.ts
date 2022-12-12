import Stage from "../logic/Stage";
import {Engine, Events, Vector} from "matter-js";
import {_setNpcs} from "./sceneHooks";
import Player from "../Player";

export function getProximity(npc: any, player: Player) {
  const distance = Math.round(Vector.magnitude(Vector.sub(npc.body.position, player.body.position)));
  return Math.min(
    Math.max(0, 1.5 - distance / 300),
    1,
  );
}

/**
 * Updates the React NPC state to reflect all NPC positions. This calls
 * the "singleton" react state setter function called `_setNpcs`,
 * but only when the rounded position of an NPC changes.
 */
export const npcObserver = (stage: Stage, player: Player) => {

  const update = () => {
    _setNpcs(existingNpcs => {
      let doUpdate  = false;
      const newNpcs = stage.npcs;
      for (const npc of newNpcs) {
        const proximity = getProximity(npc, player);
        if (
          existingNpcs[npc.id]?.x !== Math.round(npc.body.position.x)
          || existingNpcs[npc.id]?.y !== Math.round(npc.body.position.y)
          || existingNpcs[npc.id]?.messages !== npc.interactionLog.results.length
          || existingNpcs[npc.id]?.proximity !== proximity
        ) {
          doUpdate = true;
          break;
        }
      }
      if (doUpdate) {
        return newNpcs.reduce((acc, npc) => {
          return {
            ...acc,
            [npc.id]: {
              x:         Math.round(npc.body.position.x),
              y:         Math.round(npc.body.position.y),
              messages:  npc.interactionLog.results.length,
              proximity: getProximity(npc, player),
              npc,
            },
          };
        }, {});
      } else {
        return existingNpcs;
      }
    });
  }

  return {
    attach(engine: Engine) {
      Events.on(engine, 'beforeUpdate', update);
    },
    detach(engine: Engine) {
      Events.off(engine, 'beforeUpdate', update);
    }
  }
};