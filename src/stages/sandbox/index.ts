import Stage from "../../logic/Stage";
import Planet from "../../logic/Planet";
import {NPC} from "../../NPC";

export default () => {
  const stage = new Stage({x: 0, y: 0});
  stage.addPlanet(new Planet({
    vertices: [
      {x: -1000, y: 20},
      {x: 200, y: 20},
      {x: 200, y: -120},
      {x: 150, y: -120},
      {x: 150, y: -160},
      {x: 350, y: -160},
      {x: 350, y: -120},
      {x: 350, y: 20},
      {x: 1000, y: 20},
      {x: 1000, y: 2000},
      {x: -1000, y: 2000},
    ],
    name:     'sandbox-planet',
  }));
  stage.addNPC(new NPC({
    stage,
    x: -100,
    y: 0,
  }));
  return stage;
};