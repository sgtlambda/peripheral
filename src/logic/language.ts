import OpenAI from "openai-api";

import {NPC} from "../NPC";

export async function processPrompt(npc: NPC, input: string) {

  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

  const openai = new OpenAI(OPENAI_API_KEY);

  const interactionLog = npc.interactionLog;

  interactionLog.addQuestion(input);

  const prompt = interactionLog.getFullPrompt();

  console.log('input prompt', prompt);

  const gptResponse = await openai.complete({
    engine:           'text-davinci-003',
    prompt:           prompt,
    maxTokens:        50,
    temperature:      0.9,
    topP:             1,
    presencePenalty:  0,
    frequencyPenalty: 0,
    bestOf:           1,
    n:                1,
    stream:           false,
  });

  const answer = gptResponse.data.choices[0].text.trim();

  console.log('answer: ', answer);

  interactionLog.addAnswer(answer);

  alert(answer);
}