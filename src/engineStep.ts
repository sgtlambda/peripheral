import {Engine, IEvent} from "matter-js";

export type EngineStep = {
  timestamp: number;
  delta: number;
  source: Engine;
  name: string;
};

/**
 * Matter's type definitions omit the `timestamp`/`delta` fields that engine
 * update events carry at runtime, so handlers taking an `EngineStep` need this
 * cast when registered via `Events.on`.
 */
export const asEngineCallback = (handler: (event: EngineStep) => void) =>
  handler as unknown as (e: IEvent<Engine>) => void;
