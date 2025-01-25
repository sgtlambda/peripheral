import Character, {CharacterConstructorProps} from "./Character";
import {NpcInteractionLog} from "./logic/NpcInteractionLog";

export type ProcessIncomingMessage = (message: string) => undefined | {
  message: string;
  systemEvent: string;
};

export class NPC extends Character {

  public readonly name: string;

  public readonly id: number;

  public readonly interactionLog: NpcInteractionLog;

  public readonly processIncomingMessage?: ProcessIncomingMessage;

  constructor(
    {
      name,
      id,
      additionalNpcContext,
      processIncomingMessage,
      ...props
    }: CharacterConstructorProps & {
      name: string;
      id: number;
      additionalNpcContext?: string;
      processIncomingMessage?: ProcessIncomingMessage;
    }) {
    super(props);
    this.name                   = name;
    this.id                     = id;
    this.interactionLog         = new NpcInteractionLog(
      () => `This NPC is called ${this.name}.${additionalNpcContext ? ` ${additionalNpcContext}` : ''}`,
    );
    this.processIncomingMessage = processIncomingMessage;
  }
}