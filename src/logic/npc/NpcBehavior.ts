import type {NPC} from '../../NPC';
import type {StepContext} from '../../types';

/**
 * One composable piece of NPC conduct — aiming, fidgeting, (later) patrolling,
 * fleeing, fighting… An NPC runs its behaviors in the order they were added,
 * once per engine step, so they stack: each nudges the NPC (its aim, its
 * body, its held item) and later ones can build on earlier ones.
 *
 * Behaviors are made by factories (`aimAtPlayer()`, `nervous()`, …) and most
 * keep per-NPC state, so give every NPC its own instances.
 *
 * Like all simulation code, behaviors must take randomness from `stage.rng`
 * and time from the step (`event.delta`), never `Math.random` or the wall
 * clock, so a session stays reproducible from its seed.
 */
export interface NpcBehavior {
  /** Short name, for debugging */
  readonly name: string;

  step(npc: NPC, ctx: StepContext): void;
}
