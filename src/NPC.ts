import Character, {CharacterConstructorProps} from "./Character";
import {NpcInteractionLog} from "./logic/NpcInteractionLog";

export class NPC extends Character {

  public readonly name: string;

  public readonly id: number;

  public readonly interactionLog;

  constructor(
    {
      name,
      id,
      additionalNpcContext,
      ...props
    }: CharacterConstructorProps & {
      name: string;
      id: number;
      additionalNpcContext?: string;
    }) {
    super(props);
    this.name           = name;
    this.id             = id;
    this.interactionLog = new NpcInteractionLog(
      () => `This NPC is called ${this.name}.${additionalNpcContext ? ` ${additionalNpcContext}` : ''}`,
      `NPC ${this.name}: `,
    );
  }
}