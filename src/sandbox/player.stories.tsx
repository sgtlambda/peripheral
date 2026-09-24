import React, {useEffect, useMemo, useRef, useState} from "react";
import {playerDesigns} from "../rendering/player/designs";
import {artsyPlayerDesigns, halftoneDesign, halftoneGridDesign, halftoneNoiseTrailDesign} from "../rendering/player/artsyDesigns";
import {PlayerDesign, PlayerRenderState} from "../rendering/player/types";
import {Checkbox, Slider} from "./flameControls";

const DEFAULT_SIZE = 280;
const RADIUS = 16;

/** Live input shared by every panel, kept in a ref so the render loop never re-renders React. */
type Input = {
  aimAngle: number;
  autoAim: boolean;
  thrustHeld: boolean;
  keys: {left: boolean; right: boolean; up: boolean};
  velocityX: number;
  thrust: number;
  /** World x of the player; the panels' camera follows it, so world-space detail scrolls past */
  posX: number;
};

type DesignFactory = () => PlayerDesign;

// Module-level so the lists keep their identity: the sandbox rebuilds its
// designs (and any state they hold, like the halftone afterglow) when they change.
const allDesigns: DesignFactory[]      = [...playerDesigns, ...artsyPlayerDesigns];
const halftoneDesigns: DesignFactory[] = [halftoneDesign, () => halftoneGridDesign(), () => halftoneNoiseTrailDesign()];

export const Designs = () => <PlayerSandbox factories={allDesigns}/>;

/** The halftone variants, bigger: body-locked dot screen vs. the two world-grid versions. */
export const Halftone = () => <PlayerSandbox factories={halftoneDesigns} size={400}/>;

/**
 * The player character in isolation: designs side by side, zoomed in, with a
 * 1× inset at real in-game size. The camera follows the player as it moves.
 * Aim with the mouse over any panel; hold W / ↑ / space to thrust and
 * A / D / ← / → to fly sideways.
 */
function PlayerSandbox({factories, size = DEFAULT_SIZE}: {factories: DesignFactory[]; size?: number}) {
  const designs = useMemo<PlayerDesign[]>(() => factories.map(create => create()), [factories]);
  const canvases = useRef<(HTMLCanvasElement | null)[]>([]);

  const [zoom, setZoom]             = useState(4);
  const [autoAim, setAutoAim]       = useState(false);
  const [thrustOn, setThrustOn]     = useState(false);
  const [velocity, setVelocity]     = useState(0);
  const [showHitbox, setShowHitbox] = useState(false);
  const [playing, setPlaying]       = useState(true);

  const input = useRef<Input>({
    aimAngle: -0.4, autoAim: false, thrustHeld: false,
    keys: {left: false, right: false, up: false}, velocityX: 0, thrust: 0, posX: 0,
  });
  input.current.autoAim    = autoAim;
  input.current.thrustHeld = thrustOn;

  // Keyboard, like the game's controls.
  useEffect(() => {
    const set = (e: KeyboardEvent, down: boolean) => {
      const k = input.current.keys;
      if (["a", "ArrowLeft"].includes(e.key)) k.left = down;
      else if (["d", "ArrowRight"].includes(e.key)) k.right = down;
      else if (["w", "ArrowUp", " "].includes(e.key)) k.up = down;
      else return;
      e.preventDefault();
    };
    const onDown = (e: KeyboardEvent) => set(e, true);
    const onUp   = (e: KeyboardEvent) => set(e, false);
    window.addEventListener("keydown", onDown);
    window.addEventListener("keyup", onUp);
    return () => {
      window.removeEventListener("keydown", onDown);
      window.removeEventListener("keyup", onUp);
    };
  }, []);

  const settings = useRef({zoom, velocity, showHitbox, playing});
  settings.current = {zoom, velocity, showHitbox, playing};

  useEffect(() => {
    let frame = 0;
    let last  = performance.now();
    let time  = 0;

    const loop = (now: number) => {
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      const {zoom, velocity, showHitbox, playing} = settings.current;
      const inp = input.current;

      if (playing) {
        time += dt;
        const steer  = (inp.keys.right ? 1 : 0) - (inp.keys.left ? 1 : 0);
        const target = steer !== 0 ? steer * 5 : velocity;
        inp.velocityX += (target - inp.velocityX) * Math.min(1, dt * 4);
        // Velocity is in px per physics step; the game steps at ~60 Hz.
        inp.posX += inp.velocityX * dt * 60;
        const wantThrust = inp.thrustHeld || inp.keys.up ? 1 : 0;
        inp.thrust += (wantThrust - inp.thrust) * Math.min(1, dt * 10);
        if (inp.autoAim) inp.aimAngle = time * 0.8;
      }

      designs.forEach((design, i) => {
        const canvas = canvases.current[i];
        const ctx    = canvas?.getContext("2d");
        if (!ctx) return;
        drawPanel(ctx, design, {
          x: inp.posX, y: 0, radius: RADIUS,
          aimAngle: inp.aimAngle,
          velocity: {x: inp.velocityX, y: 0},
          thrust:   inp.thrust,
          time,
        }, zoom, showHitbox);
      });
      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frame);
  }, [designs]);

  const aimAt = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (input.current.autoAim) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const {cx, cy} = panelCenter(size);
    input.current.aimAngle = Math.atan2(e.clientY - rect.top - cy, e.clientX - rect.left - cx);
  };

  return <div style={{fontFamily: "sans-serif"}}>
    <div style={{display: "flex", gap: 12, alignItems: "center", marginBottom: 10, flexWrap: "wrap"}}>
      <button onClick={() => setPlaying(!playing)}>{playing ? "Pause" : "Play"}</button>
      <Checkbox label={"thrust"} checked={thrustOn} onChange={setThrustOn}/>
      <Checkbox label={"auto aim"} checked={autoAim} onChange={setAutoAim}/>
      <Checkbox label={"hitbox"} checked={showHitbox} onChange={setShowHitbox}/>
      <Slider label={"velocity x"} value={velocity} min={-6} max={6} step={0.1} onChange={setVelocity}/>
      <Slider label={"zoom"} value={zoom} min={1} max={6} step={0.5} onChange={setZoom}/>
    </div>
    <div style={{display: "flex", gap: 12, flexWrap: "wrap"}}>
      {designs.map((design, i) => (
        <div key={design.name} data-design={design.name} style={{width: size}}>
          <canvas ref={el => { canvases.current[i] = el; }} width={size} height={size}
                  onMouseMove={aimAt} style={{display: "block", border: "1px solid #333"}}/>
          <div style={{fontSize: 13, fontWeight: 600, marginTop: 4, display: "flex", gap: 6, alignItems: "center"}}>
            {design.name}
            {design.palette.map(color => (
              <span key={color} title={color}
                    style={{width: 12, height: 12, background: color, border: "1px solid #999", display: "inline-block"}}/>
            ))}
          </div>
          <div style={{fontSize: 11, color: "#666"}}>{design.description}</div>
        </div>
      ))}
    </div>
  </div>;
}

/** Where the zoomed character sits in a panel (above the floor strip). */
const panelCenter = (size: number) => ({cx: size / 2, cy: size * 0.45});

function drawPanel(
  ctx: CanvasRenderingContext2D,
  design: PlayerDesign,
  state: PlayerRenderState,
  zoom: number,
  showHitbox: boolean,
): void {
  const SIZE = ctx.canvas.width;
  const {cx, cy} = panelCenter(SIZE);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = "rgb(0,0,0)";
  ctx.fillRect(0, 0, SIZE, SIZE);

  // Terrain strip, as in the game: flat white ground.
  const floorY = SIZE - 34;
  ctx.fillStyle = "rgb(255,255,255)";
  ctx.fillRect(0, floorY, SIZE, SIZE - floorY);

  // Camera follows the player, as in the game: the design draws at its world
  // position and the view is shifted so it lands at (x, y) on the panel.
  const drawAt = (x: number, y: number, scale: number) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);
    ctx.translate(-state.x, -state.y);
    design.draw(ctx, state);
    if (showHitbox) {
      ctx.strokeStyle = "rgba(255,0,0,0.8)";
      ctx.lineWidth   = 1 / scale;
      ctx.beginPath();
      ctx.arc(state.x, state.y, state.radius, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  };

  drawAt(cx, cy, zoom);

  // 1× inset at real size, standing on the terrain.
  ctx.fillStyle = "rgba(255,255,255,0.35)";
  ctx.font      = "10px monospace";
  ctx.fillText("1×", SIZE - 58, floorY - 30);
  drawAt(SIZE - 32, floorY - state.radius - 6, 1);
}
