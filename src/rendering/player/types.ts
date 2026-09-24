import {Vector} from "matter-js";

/** Everything a player design needs to draw one frame, independent of the simulation. */
export type PlayerRenderState = {
  /** Centre of the collider, in world coordinates */
  x: number;
  y: number;
  /** Collider radius — designs should stay roughly within it */
  radius: number;
  /** Aim direction in radians (0 = +x), as `Player.aimAngle` */
  aimAngle: number;
  /** Current velocity, in px per step; drives tilt and dangling parts */
  velocity: Vector;
  /** Jetpack throttle, 0 (off) to 1 (full); eased by the caller so the flame grows/shrinks */
  thrust: number;
  /** Animation clock, in seconds */
  time: number;
};

export type PlayerDesign = {
  name: string;
  description: string;
  /** Every colour the character itself uses, flame included — the brief allows two at most */
  palette: string[];
  draw(ctx: CanvasRenderingContext2D, state: PlayerRenderState): void;
};
