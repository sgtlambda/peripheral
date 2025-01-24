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
    id:                     1, name: 'Outer Guard', stage, x: 300, y: 0,
    additionalNpcContext:   "This NPC is somewhat grumpy but once the player engages with him in an empathic manner, he will reveal that he is about to retire, but only if pushed to have some chit-chat. The player also needs to provide some (fake) credentials and talk with full confidence, to be allowed entrance to the building. The NPC, until convinced, talks in short industry sentences and doesn't let on too many hints. The NPC can choose to include [accept] (allow the player in once sufficiently \"proven\" themselves), [hold] (needs some more persuasion), or [deny] (fails the test and the level - red flags were raised) in his response.",
    processIncomingMessage: (message: string) => {
      if (message.includes('[accept]')) {
        return {
          message:     message.replace('[accept]', ''),
          systemEvent: 'The guard allows you into the building.'
        }
      }
      if (message.includes('[hold]')) {
        return {
          message:     message.replace('[hold]', ''),
          systemEvent: 'The guard is suspicious of your intentions.'
        }
      }
      if (message.includes('[deny]')) {
        return {
          message:     message.replace('[deny]', ''),
          systemEvent: 'The guard denies you access to the building.'
        }
      }
    }
  }));
  stage.addNPC(new NPC({
    id:                   2, name: 'Inner Guard', stage, x: 600, y: 0,
    additionalNpcContext: ""
  }));
  return stage;
};