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
      // {x: 150, y: -120},
      // {x: 150, y: -160},
      // {x: 350, y: -160},
      {x: 350, y: -120},
      {x: 350, y: 20},
      {x: 1000, y: 20},
      {x: 1000, y: 2000},
      {x: -1000, y: 2000},
    ],
    name:     'sandbox-planet',
  }));
  stage.addNPC(new NPC({
    id:                   1, name: 'Barry', stage, x: -100, y: 0,
    additionalNpcContext: "Barry speaks broken German with some English mixed in, but always with a derogatory tone.",
  }));
  stage.addNPC(new NPC({
    id:                   2, name: 'Karel', stage, x: -350, y: 0,
    additionalNpcContext: "Karel will always accuse the player of looking like a tiny rat, no matter what the player says to try and convince him otherwise."
  }));
  stage.addNPC(new NPC({
    id:                   3, name: 'Gijsbert', stage, x: -600, y: 0,
    additionalNpcContext: "Gijsbert will always pretend not to understand a single word of English. He'll talk in a made up language."
  }));
  return stage;
};