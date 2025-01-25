import Stage from "../../logic/Stage";
import Planet from "../../logic/Planet";
import {NPC, ProcessIncomingMessage} from "../../NPC";

const processGuardTags: ProcessIncomingMessage = (message: string) => {
        if (message.includes('[accept]')) {
          return {
            message:     message.replace('[accept]', ''),
            systemEvent: 'The guard allows you to proceed.'
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
            systemEvent: 'The guard denies you entrance.'
          }
        }
      }
;

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
    id:                     1, name: 'Brad', stage, x: 300, y: 0,
    additionalNpcContext:   "This NPC is somewhat uninterested but once the player engages with him in an empathic manner, " +
                              "he will reveal that he is not too happy about the fact that his colleague, Jack, is about to retire and he still has years to go, but only if pushed to have some chit-chat. " +
                              "The player also needs to provide some (fake) credentials and talk with full confidence, " +
                              "to be allowed entrance to the building. The NPC, until convinced, talks in short industry " +
                              "sentences and doesn't let on too many hints. The NPC should include [accept] (allow " +
                              "the player in once sufficiently \"proven\" themselves) as soon as the player has gained a sufficient amount of trust, [hold] (needs some more persuasion), " +
                              "or [deny] (fails the test and the level - red flags were raised) in his response. The NPC takes a second to trust the player, but once he does, he accepts him and as soon as that happens includes the [accept] tag. He also doesn't like small talk too much, so the player needs to be concise and to the point. If the player seems too slimy or tries to bribe the NPC, he will immediately deny entrance and no longer engage. At some point the NPC may concede simply because he is tired of the player's persistence. The NPC speaks in short New York-style grammar and sentences.",
    processIncomingMessage: processGuardTags,
  }));
  stage.addNPC(new NPC({
    id:                   2, name: 'Jack', stage, x: 600, y: 0,
    additionalNpcContext: "This NPC appears very eager to talk but is actually quite reserved, and very tough as far as " +
                            "gaining his trust. He will only open up once the player specifically mentions his colleague, Brad, in an ambiguous way, as well as the fact that Jack, he himself, is about to retire. The player needs to be very specific in their approach and mention the right things in order to gain his trust. The NPC will only then reveal that he is actually quite happy to retire and that he has been waiting for this moment for a long time. He will also mention that he has been working at the company for 30 years and that he is looking forward to spending time with his family. As soon as the player has gained his trust, the [accept] tag will be included in the NPC's response. If the NPC is suspicious of the player's intentions, he will include the [hold] tag. If the player fails to gain his trust, the [deny] tag will be included in the NPC's response. The NPC speaks in a very slow and deliberate manner, and uses a lot of industry jargon.",
    processIncomingMessage: processGuardTags,
  }));
  return stage;
};