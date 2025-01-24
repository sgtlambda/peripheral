import OpenAI from "openai";

import {NPC} from "../NPC";

export async function processPrompt(npc: NPC, input: string) {

  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

  const openai = new OpenAI({
    apiKey:                  OPENAI_API_KEY!,
    dangerouslyAllowBrowser: true,
  });

  const interactionLog = npc.interactionLog;

  interactionLog.addQuestion(input);

  const prompt = interactionLog.getFullPrompt();

  const gptResponse = await openai.chat.completions.create({
    model:             'gpt-4o',
    messages:          [{role: 'system', content: prompt}],
    max_tokens:        100,
    temperature:       0.9,
    top_p:             1,
    presence_penalty:  0,
    frequency_penalty: 0,
    n:                 1,
    stream:            false,
  });

  const answer = gptResponse.choices[0].message.content ?? "I'm sorry, I don't understand.";

  console.log(gptResponse);

  const processed = npc.processIncomingMessage?.(answer);

  if (processed) {
    interactionLog.addAnswer(processed.message, processed.systemEvent);
  } else {
    interactionLog.addAnswer(answer);
  }
}