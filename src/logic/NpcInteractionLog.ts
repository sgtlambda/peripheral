export class NpcInteractionLog {

  messages: { isPlayer: boolean; text: string; systemMessage?: string }[];

  getNpcContext: () => string;

  constructor(
    getNpcContext: () => string,
  ) {
    this.messages = [];
    this.getNpcContext = getNpcContext;
  }

  public getOpenAIMessages(): { role: 'system' | 'user' | 'assistant'; content: string }[] {
    const messages: { role: 'system' | 'user' | 'assistant'; content: string }[] = [
      { role: 'system', content: `This is an in-game interaction between a player and an NPC. ${this.getNpcContext()}` }
    ];

    for (const msg of this.messages) {
      messages.push({
        role: msg.isPlayer ? 'user' : 'assistant',
        content: msg.text
      });
      if (msg.systemMessage) {
        messages.push({ role: 'system', content: msg.systemMessage });
      }
    }

    return messages;
  }

  public addQuestion(question: string) {
    this.messages.push({ isPlayer: true, text: question });
  }

  public addAnswer(answer: string, systemMessage?: string) {
    this.messages.push({ isPlayer: false, text: answer, systemMessage });
  }
}