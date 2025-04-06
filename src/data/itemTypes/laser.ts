import {Vector} from "matter-js";

import ItemType from '../../logic/ItemType';
import applyIntent from "../intents/applyIntent";
import {nom} from "../../logic/effects/nom";
import {flash} from "../../logic/effects/flash";

export const createLaser = (depth: number = 100, width: number = 6, taperTo: number = 0, steps: number = 8, random: number = 30) => new ItemType({
  name:             'laser',
  color:            '#b8866e',
  availableIntents: [
    applyIntent({
      primary:          true,
      continuous:       true,
      applyActionLabel: 'fire laser',
      apply(player, stage) {

        const coords = [];

        for (let i = 0; i < steps; i++) {
          coords.push({
            x: 12 + (depth / steps) * i + (i === 0 ? 0 : (Math.random() - .5) * random),
            y: (i === 0 ? 0 : (Math.random() - .5) * random),
          });
        }

        const points: Vector[] = [];

        for (let i = 0; i < steps; i++) {
          // Calculate the width at this point based on `width` and `taperTo`
          const widthAtPoint = width - ((width - taperTo) / steps) * i;
          points.push({
            x: coords[i].x,
            y: coords[i].y - widthAtPoint,
          });
        }

        // traverse the coords in reverse order
        for (let i = steps - 1; i >= 0; i--) {
          const widthAtPoint = width - ((width - taperTo) / steps) * i;
          points.push({
            x: coords[i].x,
            y: coords[i].y + widthAtPoint,
          });
        }

        const shape: Vector[] = points.map(vector => {
          return Vector.add(
            {...player.position},
            Vector.rotate(vector, player.aimAngle),
          );
        });

        stage.cameraShakeStack.add({
          x: 8,
          y: 8,
          duration: 100,
        });

        flash(stage, {
          duration: 400,
          color:    '#fff58e',
          polygon:  shape,
        });

        nom(stage, shape)
      },
    })
  ],
})