import ItemType from '../../logic/ItemType';
import applyIntent from "../intents/applyIntent";
import {nom} from "../../logic/effects/nom";
import {Vector} from "matter-js";

export const createLaser = (depth: number = 100, width: number = 1) => new ItemType({
  name:             `laser`,
  color:            '#b8866e',
  availableIntents: [
    applyIntent({
      primary:          true,
      continuous:       false,
      applyActionLabel: 'fire laser',
      apply(player, stage) {

        const shape: Vector[] = [
          {x: 0, y: width / 2},
          {x: 0, y: -width / 2},
          {x: depth, y: -width / 2},
          {x: depth, y: width / 2},
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