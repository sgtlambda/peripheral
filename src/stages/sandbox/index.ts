import Stage from "../../logic/Stage";
import Planet from "../../logic/Planet";
import {NPC, ProcessIncomingMessage} from "../../NPC";
import {CameraShakeStack} from "../../CameraShakeStack";

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
};

const hostageTakerPrompt = `This NPC is holding your son-in-law hostage. On the surface, he’s cold and in control, but beneath that,
he’s emotionally unstable — conflicted, volatile, and not entirely hardened. He’s not quick to say [terminate]; he wants
to be talked to, challenged, maybe even understood. If the player plays their cards right — showing empathy, cleverness,
or finding weak points in his logic or emotions — the NPC begins to crack. Once persuaded or emotionally disarmed, he may
respond with [release], freeing the hostage. If the player is close, but not quite there yet, he responds with [negotiate],
indicating continued interest or inner conflict.

The NPC is not swayed by empty threats or bravado. Attempts to bribe or manipulate too obviously will backfire and trigger
[terminate] — though it takes more to push him there now. He may lash out verbally if triggered, but also slip up emotionally
when pressed on the right topics — his past, his motivations, or personal guilt. The player can explore these through
careful, sharp dialogue, not small talk. Repeated emotional or moral appeals may wear him down over time, especially if the
player is persistent and nuanced.

The NPC wants to extract a large amount of money from the player (negotiator).

The NPC’s speech swings between cold control and frustrated bursts. Sometimes quiet and cutting, sometimes erratic and
rambling. He may contradict himself, or repeat things, especially under pressure. He doesn’t want to admit weakness, but
it’s there — and it can be reached.`;

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
      {x: 2000, y: 20},
      {x: 2000, y: 2000},
      {x: -2000, y: 2000},
    ],
    name:     'sandbox-planet',
    color:    '#ffffff',
  }));
  stage.addNPC(new NPC({
    id:                     1, name: 'The Crow', stage, x: 300, y: 0,
    additionalNpcContext:   hostageTakerPrompt,
    processIncomingMessage: processGuardTags,
  }));
  stage.addNPC(new NPC({
    id:                     2, name: 'Jack', stage, x: 600, y: 0,
    additionalNpcContext:   "This NPC appears very eager to talk but is actually quite reserved, and very tough as far as ",
    processIncomingMessage: processGuardTags,
  }));
  return stage;
};