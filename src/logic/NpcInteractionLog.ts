export class NpcInteractionLog {

  static PlayerPrefix = 'Player: ';

  NpcPrefix = 'NPC: ';

  results: { prefix: string; text: string }[];

  getNpcContext: () => string;

  constructor(
    getNpcContext: () => string,
    npcPrefix?: string,
  ) {
    this.results       = [];
    this.getNpcContext = getNpcContext;
    if (npcPrefix) this.NpcPrefix = npcPrefix;
  }

  public getFullPrompt(): string {
    const lines = [
      `This is an in-game interaction between a player and an NPC. ${this.getNpcContext()}`,
      ...this.results.map(result => `${result.prefix}${result.text}`),
      this.NpcPrefix,
    ];
    console.log(lines);
    return lines.join('\n');
  }

  public addQuestion(question: string) {
    this.results.push({prefix: NpcInteractionLog.PlayerPrefix, text: question});
  }

  public addAnswer(answer: string) {
    this.results.push({prefix: this.NpcPrefix, text: answer});
  }
}