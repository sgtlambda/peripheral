import {Vector, Vertices} from "matter-js";

import ItemType from "../../logic/ItemType";
import applyIntent from "../intents/applyIntent";
import {PLAYER_AIM_OFFSET} from "../constants";
import {flash} from "../../logic/effects/flash";
import circleVertices from "../../common/circleVertices";
import {nom} from "../../logic/effects/nom";

const {raycast} = require('../../common/ray');

const GUN_RAY_WIDTH = 1;
const GUN_PREVIEW_SIZE = 8;

// TODO add accuracy, etc. maybe ray 'width' as well.

export const createGun = (
  range: number  = 1000,
  damage: number = 10,
  spread: number = 5,
) => new ItemType({
  name:             'gun',
  color:            '#dd6363',
  renderPlayerInteractionPreview: (stage, context, x, y, angle) => {
    // TODO ray cast
    context.save();
    context.translate(x, y);
    context.rotate(angle);
    context.translate(PLAYER_AIM_OFFSET, 0);
    context.strokeStyle = 'rgba(255,255,255,0.5)';
    context.strokeRect(-GUN_PREVIEW_SIZE/2, -GUN_PREVIEW_SIZE/2, GUN_PREVIEW_SIZE, GUN_PREVIEW_SIZE);
    context.restore();
  },
  availableIntents: [
    applyIntent({
      primary:          true,
      continuous:       true,
      applyActionLabel: 'fire gun',
      apply(player, stage) {

        const angle = player.aimAngle + (Math.random() - 0.5) * (spread / 360 * Math.PI);

        const startPos = Vector.add(player.position, Vector.rotate({x: 16, y: 0}, player.aimAngle));
        const endPos   = Vector.add(startPos, Vector.rotate({x: PLAYER_AIM_OFFSET + range, y: 0}, angle));

        const bodies = stage.planets.map(planet => planet.body);

        const collisions = raycast(bodies, startPos, endPos);

        console.log(collisions);

        const endpoint = collisions.length ? collisions[0].point : endPos;

        const gunRayVertices = [
          Vector.add(startPos, Vector.rotate({x: 0, y: GUN_RAY_WIDTH / 2}, player.aimAngle)),
          Vector.add(endpoint, Vector.rotate({x: 0, y: GUN_RAY_WIDTH / 2}, player.aimAngle)),
          Vector.add(endpoint, Vector.rotate({x: 0, y: -GUN_RAY_WIDTH / 2}, player.aimAngle)),
          Vector.add(startPos, Vector.rotate({x: 0, y: -GUN_RAY_WIDTH / 2}, player.aimAngle)),
        ];

        flash(stage, {
          duration: 200,
          color:    '#ffffff',
          polygon:  gunRayVertices,
        });

        if (collisions.length) {
          const collisionPoint = collisions[0].point;
          const vertices       = Vertices.translate(circleVertices(10, 6, .5), collisionPoint, 1);
          nom(stage, vertices);
          flash(stage, {
            duration: 200,
            color:    '#ff7758',
            polygon:  vertices,
          });
        }
      },
    }),
  ],
});