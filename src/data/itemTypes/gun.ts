import Matter, {Vector, Vertices} from "matter-js";

import ItemType from "../../logic/ItemType";
import applyIntent from "../intents/applyIntent";
import {PLAYER_AIM_OFFSET} from "../constants";
import {flash} from "../../logic/effects/flash";
import circleVertices from "../../common/circleVertices";
import {nom} from "../../logic/effects/nom";

// const {raycast} = require('../../common/ray');
import {raycast} from '../../common/ray';
import {clone, cloneDeep} from "lodash";
import {scanRay} from "../../common/scanRay";

const GUN_RAY_WIDTH    = 1;
const GUN_PREVIEW_SIZE = 8;

// TODO add accuracy, etc. maybe ray 'width' as well.

export const createGun = (
  range: number  = 1000,
  damage: number = 10,
  spread: number = 5,
) => new ItemType({
  name:                           'gun',
  color:                          '#dd6363',
  // renderPlayerInteractionPreview: (stage, context, x, y, angle) => {
  //   context.save();
  //   context.translate(x, y);
  //
  //   for(let i = 10; i < range; i += 10) {
  //
  //     const startPos   = Vector.create(x, y);
  //     const endPos     = Vector.add(startPos, Vector.rotate({x: i, y: 0}, angle));
  //     const bodies     = stage.planets.map(planet => planet.body);
  //     const collisions = raycast(
  //       bodies,
  //       startPos,
  //       endPos
  //     );
  //
  //     // New code to draw a circle around each collision point
  //     collisions.forEach((collision: any) => {
  //       context.beginPath();
  //       context.arc(collision.point.x - x, collision.point.y - y, 5, 0, 2 * Math.PI);
  //       context.strokeStyle = 'rgba(255, 0, 0, 0.5)'; // Red color for the circle
  //       context.stroke();
  //     });
  //
  //
  //     const kronk = [
  //       ...Matter.Query.ray(cloneDeep(bodies), startPos, endPos),
  //       ...Matter.Query.ray(bodies, endPos, startPos),
  //     ];
  //
  //     kronk.forEach((collision) => {
  //       context.beginPath();
  //       context.arc(collision.bodyA.position.x - x, collision.bodyA.position.y - y, 8 + i /10, 0, 2 * Math.PI);
  //       context.strokeStyle = 'rgba(0, 0, 255, 1)'; // Red color for the circle
  //       context.stroke();
  //
  //       context.beginPath();
  //       context.arc(collision.bodyB.position.x - x, collision.bodyB.position.y - y, 8 + i /10, 0, 2 * Math.PI);
  //       context.strokeStyle = 'rgba(0, 0, 255, 1)'; // Red color for the circle
  //       context.stroke();
  //     });
  //
  //     context.beginPath();
  //     context.moveTo(0, 0);
  //     context.lineTo(endPos.x -x, endPos.y - y);
  //     context.stroke();
  //   }
  //
  //
  //   context.restore();
  // },
  availableIntents:               [
    applyIntent({
      primary:          true,
      continuous:       true,
      applyActionLabel: 'fire gun',
      apply(player, stage) {

        // TODO in order for this to work, I think we need to incrementally increase the 'range'
        //  and check for collisions at each step.   edit: OR MAYBE NOT!?
        // TODO this still doesn't seem to work just yet...

        const angle = player.aimAngle + (Math.random() - 0.5) * (spread / 360 * Math.PI);

        const startPos = Vector.add(player.position, Vector.rotate({x: 16, y: 0}, angle));

        const endPos   = Vector.add(startPos, Vector.rotate({x: PLAYER_AIM_OFFSET + range, y: 0}, angle));

        const bodies = stage.planets.map(planet => planet.body);

        // 10 is the 'seek accuracy' of the raycast here... TODO look at?
        // TODO this doesn't actually seem to help the problem !
        const collision= scanRay(player.position, angle, PLAYER_AIM_OFFSET, range, 10, bodies);

        const endpoint = collision ? collision.point : endPos;

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

        if (collision) {
          const collisionPoint = collision.point;
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