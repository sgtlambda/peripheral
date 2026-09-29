import Character, {CharacterConstructorProps} from "./Character";
import {NpcInteractionLog} from "./logic/NpcInteractionLog";
import {getSceneContext} from "./sceneContext";
import {NpcBehavior} from "./logic/npc/NpcBehavior";
import {HasStep, StepContext} from "./types";

export type ProcessIncomingMessage = (message: string) => undefined | {
  message: string;
  systemEvent: string;
};

export class NPC extends Character implements HasStep {

  public readonly name: string;

  public readonly id: number;

  public readonly interactionLog: NpcInteractionLog;

  public readonly processIncomingMessage?: ProcessIncomingMessage;

  /** Stacked behaviors, run in order every step; see `NpcBehavior` */
  private behaviors: NpcBehavior[] = [];

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
      () => `The assistant represents an NPC interacting with the user (player). ${getSceneContext()}${additionalNpcContext ? ` ${additionalNpcContext}` : ''}`,
    );
    this.processIncomingMessage = processIncomingMessage;
  }

  /** Stack behaviors onto this NPC; they run after any it already has. */
  addBehaviors(...behaviors: NpcBehavior[]): this {
    this.behaviors.push(...behaviors);
    return this;
  }

  removeBehavior(behavior: NpcBehavior) {
    this.behaviors = this.behaviors.filter(b => b !== behavior);
  }

  step(ctx: StepContext) {
    for (const behavior of this.behaviors) behavior.step(this, ctx);
  }
}