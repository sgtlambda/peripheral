import ItemType from '../../logic/ItemType';
import applyIntent from "../intents/applyIntent";
import {nom} from "../../logic/effects/nom";
import {Vector} from "matter-js";

export const laser = new ItemType({
  name:             'laser',
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
          {x: 100, y: -15},
          {x: 100, y: 15},
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