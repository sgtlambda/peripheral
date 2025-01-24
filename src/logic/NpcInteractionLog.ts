export class NpcInteractionLog {

  static PlayerPrefix = 'Player: ';

  npcPrefix = 'NPC: ';

  systemPrefix = 'System: ';

  results: { prefix: string; text: string }[];

  getNpcContext: () => string;

  constructor(
    getNpcContext: () => string,
    npcPrefix?: string,
  ) {
    this.results       = [];
    this.getNpcContext = getNpcContext;
    if (npcPrefix) this.npcPrefix = npcPrefix;
  }

  public getFullPrompt(): string {
    const lines = [
      `This is an in-game interaction between a player and an NPC. ${this.getNpcContext()}`,
      ...this.results.map(result => `${result.prefix}${result.text}`),
      'What would the NPC say next? Exclude the prefix and don\'t continue the conversation past the NPC\'s next response.',
    ];
    console.log(lines);
    return lines.join('\n');
  }

  public addQuestion(question: string) {
    this.results.push({prefix: NpcInteractionLog.PlayerPrefix, text: question});
  }

  public addAnswer(answer: string, systemMessage?: string) {
    this.results.push({prefix: this.npcPrefix, text: answer});
    if (systemMessage) this.results.push({prefix: this.systemPrefix, text: systemMessage});
  }
}