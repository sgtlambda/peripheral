import {Bodies, Vertices, World} from "matter-js";
import pendulum from "../parts/pendulum";
import testTerrain from "../shapes/testTerrain";

export default ({

    world,
    collisionCategory,

}) => {

    const vertices = testTerrain;
    const center   = Vertices.centre(vertices);

    const terrain = Bodies.fromVertices(center.x, center.y + 400, vertices, {
        isStatic:        true,
        render:          {
            fillStyle:   '#2e2b44',
            strokeStyle: '#2e2b44',
            lineWidth:   1
        },
        collisionFilter: {
            category: collisionCategory,
        }
    });

    const terrainBodies = [terrain];

    [0, 1, 2].forEach(i => {
        const x = i * 120 + 325;
        const p = pendulum({
            x, y: 360, width: 60, ropeSeparation: 20,
        });
        terrainBodies.push(p.body);
        World.add(world, p.constraints);
    });

    World.add(world, terrainBodies);

    return {world, terrainBodies};
}