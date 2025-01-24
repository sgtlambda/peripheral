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
    id:                   1, name: 'Outside Guard', stage, x: 300, y: 0,
    additionalNpcContext: "This NPC is somewhat grumpy but once the player engages with him in an empathic manner, he will reveal that he is about to retire, but only if pushed to have some chit-chat. The player also needs to provide some (fake) credentials and talk with full confidence, to be allowed entrance to the building. The NPC can choose to include [accept], [hold] (needs more persuasion), or [deny] (fails the test) in his response."
  }));
  stage.addNPC(new NPC({
    id:                   2, name: 'Inside Guard', stage, x: 600, y: 0,
    additionalNpcContext: ""
  }));
  return stage;
};