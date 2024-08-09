import {Engine} from "matter-js";

// TODO use native event type (?)
export type EngineStep = {
  timestamp: number;
  delta: number;
  source: Engine;
  name: string;
};