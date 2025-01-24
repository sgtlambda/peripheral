import Stage from "../../logic/Stage";
import Planet from "../../logic/Planet";
import {NPC} from "../../NPC";

export default () => {
  const stage = new Stage({x: 0, y: 0});
  stage.addPlanet(new Planet({
    vertices: [
      {x: -2000, y: 20},
      {x: 1200, y: 20},
      {x: 1200, y: -120},
      {x: 1210, y: -420},
      {x: 1240, y: -420},
      {x: 1250, y: -120},
      {x: 1250, y: 20},
      {x: 12000, y: 20},
      {x: 12000, y: 2000},
      {x: -2000, y: 2000},
    ],
    name:     'sandbox-planet',
    color:    '#ffffff',
  }));
  stage.addNPC(new NPC({
    id:                   1, name: 'Guard', stage, x: 300, y: 0,
    additionalNpcContext: "Barry speaks broken German with some English mixed in, but always with a derogatory tone.",
  }));
  stage.addNPC(new NPC({
    id:                   2, name: 'Janitor', stage, x: 600, y: 0,
    additionalNpcContext: "Karel will always accuse the player of looking like a tiny rat, no matter what the player says to try and convince him otherwise."
  }));
  return stage;
};