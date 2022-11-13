import ItemType from '../../logic/ItemType';
import applyIntent from "../intents/applyIntent";
import {nom} from "../../logic/effects/nom";
import {Vector} from "matter-js";

export const createLaser = (depth: number = 100) => new ItemType({
  name:             `L:${depth})`,
  color:            '#b8866e',
  availableIntents: [
    applyIntent({
      primary:          true,
      continuous:       false,
      applyActionLabel: 'fire laser',
      apply(player, stage) {

        const shape: Vector[] = [
          {x: 0, y: 15},
          {x: 0, y: -15},
          {x: depth, y: -15},
          {x: depth, y: 15},
        ].map(vector => {
          return Vector.add(
            {...player.position},
            Vector.rotate(vector, player.aimAngle),
          );
        });

        nom(stage, shape)
      },
    })
  ],
})