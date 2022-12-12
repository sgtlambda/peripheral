export class NpcInteractionLog {

  static PlayerPrefix = 'Player: ';

  NpcPrefix = 'NPC: ';

  questions: string[] = [];
  answers: string[]   = [];

  getNpcContext: () => string;

  constructor(
    getNpcContext: () => string,
    npcPrefix?: string,
  ) {
    this.questions     = [];
    this.answers       = [];
    this.getNpcContext = getNpcContext;
    if (npcPrefix) this.NpcPrefix = npcPrefix;
  }

  public getFullPrompt(): string {
    const lines = [
      `This is an in-game interaction between a player and an NPC. ${this.getNpcContext()}`,
      ...this.questions.map((question, i) => `${NpcInteractionLog.PlayerPrefix}${question}`),
      ...this.answers.map((answer, i) => `${this.NpcPrefix}${answer}`),
      this.NpcPrefix,
    ];
    console.log(lines);
    return lines.join('\n');
  }

  public addQuestion(question: string) {
    this.questions.push(question);
  }

  public addAnswer(answer: string) {
    this.answers.push(answer);
  }
}