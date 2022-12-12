import Character, {CharacterConstructorProps} from "./Character";
import {NpcInteractionLog} from "./logic/NpcInteractionLog";

export class NPC extends Character {

  public readonly name: string;

  public readonly interactionLog;

  constructor(
    {
      name,
      ...props
    }: CharacterConstructorProps & {
      name: string,
    }) {
    super(props);
    this.name           = name;
    this.interactionLog = new NpcInteractionLog(
      () => `This NPC is called ${this.name}.`,
      `NPC ${this.name}: `,
    );
  }
}