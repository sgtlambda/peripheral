import React, {useEffect, useMemo, useRef, useState} from "react";
import {FlameParams, flameDefaults, generateAnimatedFlame} from "../common/flame";
import {renderFlame} from "../common/renderFlame";
import {EasingName, easingNames} from "../common/easings";

/** A numeric flame parameter, with the range and granularity its slider uses. */
export type NumSpec = {key: keyof FlameParams; label: string; min: number; max: number; step: number};

/** Numeric parameters (everything a preset can set except the easings and `cullIslands`). */
export const NUM_SPECS: NumSpec[] = [
  {key: "speed",            label: "speed",            min: 0,   max: 3,    step: 0.05},
  {key: "loopPeriod",       label: "loopPeriod",       min: 1,   max: 30,   step: 1},
  {key: "bodyCount",        label: "bodyCount",        min: 1,   max: 80,   step: 1},
  {key: "bodyLengthRatio",  label: "bodyLengthRatio",  min: 0,   max: 0.5,  step: 0.005},
  {key: "lensAspect",       label: "lensAspect",       min: 0.2, max: 1.2,  step: 0.01},
  {key: "bodySizeVar",      label: "bodySizeVar",      min: 0,   max: 1.5,  step: 0.01},
  {key: "spread",           label: "spread",           min: 0,   max: 0.8,  step: 0.005},
  {key: "bodyTaperStart",   label: "bodyTaperStart",   min: 0,   max: 1,    step: 0.01},
  {key: "cutoffDist",       label: "cutoffDist",       min: 0.2, max: 1.5,  step: 0.01},
  {key: "cutoffWobbleAmp",  label: "cutoffWobbleAmp",  min: 0,   max: 0.3,  step: 0.005},
  {key: "cutoffWobbleFreq", label: "cutoffWobbleFreq", min: 0,   max: 8,    step: 0.1},
  {key: "cutoffWobbleSpeed",label: "cutoffWobbleSpeed",min: 0,   max: 5,    step: 0.1},
  {key: "bodySpeed",        label: "bodySpeed",        min: 0.1, max: 3,    step: 0.05},
  {key: "flickerRatio",     label: "flickerRatio",     min: 0,   max: 0.15, step: 0.002},
  {key: "flickerFreq",      label: "flickerFreq",      min: 0,   max: 8,    step: 0.1},
  {key: "holeCount",        label: "holeCount",        min: 0,   max: 24,   step: 1},
  {key: "holeSpanRatio",    label: "holeSpanRatio",    min: 0,   max: 0.5,  step: 0.005},
  {key: "holeThickness",    label: "holeThickness",    min: 0.1, max: 1.2,  step: 0.01},
  {key: "holeSizeVar",      label: "holeSizeVar",      min: 0,   max: 1,    step: 0.01},
  {key: "holeSpawnDist",    label: "holeSpawnDist",    min: 0,   max: 1,    step: 0.01},
  {key: "holeSpawnDistVar", label: "holeSpawnDistVar", min: 0,   max: 0.5,  step: 0.01},
  {key: "holeRiseDist",     label: "holeRiseDist",     min: 0,   max: 1,    step: 0.01},
  {key: "holeRiseDelay",    label: "holeRiseDelay",    min: 0,   max: 0.9,  step: 0.01},
  {key: "holeDriftDist",    label: "holeDriftDist",    min: 0,   max: 0.6,  step: 0.01},
  {key: "holeSpreadScale",  label: "holeSpreadScale",  min: 0,   max: 1.5,  step: 0.05},
  {key: "holeSpeed",        label: "holeSpeed",        min: 0.1, max: 3,    step: 0.05},
  {key: "holeRotStart",     label: "holeRotStart",     min: 0,   max: 3.14, step: 0.01},
  {key: "holeRotEnd",       label: "holeRotEnd",       min: 0,   max: 6.28, step: 0.01},
  {key: "islandSlopeStart", label: "islandSlopeStart", min: 0,   max: 1.5,  step: 0.01},
  {key: "islandSlopeEnd",   label: "islandSlopeEnd",   min: 0,   max: 1.5,  step: 0.01},
  {key: "islandCullArea",   label: "islandCullArea",   min: 0,   max: 0.1,  step: 0.001},
  {key: "lensResolution",   label: "lensResolution",   min: 2,   max: 10,   step: 1},
];

export const EASING_KEYS = ["bodyDistEasing", "holeSizeEasing", "holeDistEasing"] as const;

export type EasingKey = typeof EASING_KEYS[number];

/** Round a slider value to its step's precision (keeps presets from carrying float noise). */
function quantize(spec: NumSpec, value: number): number {
  const snapped = spec.min + Math.round((value - spec.min) / spec.step) * spec.step;
  const clamped = Math.min(spec.max, Math.max(spec.min, snapped));
  return spec.step >= 1 ? Math.round(clamped) : parseFloat(clamped.toFixed(4));
}

/**
 * Roll a new parameter set. `strength` interpolates between the current values
 * (0) and a uniform draw over each slider's full range (1), so the same button
 * can nudge a preset sideways or start from scratch. Easings are swapped with
 * probability `strength`, and the colour is only re-rolled at full strength.
 */
export function randomizeFlameParams(
  params: FlameParams,
  color: string,
  strength = 1,
): {params: FlameParams; color: string} {
  const next = {...params} as Record<string, number | boolean | EasingName>;

  NUM_SPECS.forEach(spec => {
    const target  = spec.min + Math.random() * (spec.max - spec.min);
    const current = params[spec.key] as number;
    next[spec.key] = quantize(spec, current + (target - current) * strength);
  });
  EASING_KEYS.forEach(key => {
    if (Math.random() < strength) next[key] = easingNames[Math.floor(Math.random() * easingNames.length)];
  });

  const channel  = () => Math.floor(120 + Math.random() * 135);
  const nextColor = strength >= 1 ? `rgb(${channel()},${channel()},${channel()})` : color;

  return {params: next as unknown as FlameParams, color: nextColor};
}

/**
 * Wall-clock driver for the preview: returns the current flame time in seconds
 * plus a setter, so a scrub slider can take over while paused.
 */
export function useFlameClock(isPlaying: boolean): [number, (time: number) => void] {
  const [time, setTime]   = useState(0);
  const frameRef          = useRef<number>();

  useEffect(() => {
    if (!isPlaying) return;
    let last = performance.now();
    const animate = (now: number) => {
      const delta = now - last;
      last        = now;
      setTime(prev => prev + delta / 1000);
      frameRef.current = requestAnimationFrame(animate);
    };
    frameRef.current = requestAnimationFrame(animate);
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [isPlaying]);

  return [time, setTime];
}

export type FlamePreviewProps = {
  params: FlameParams;
  color: string;
  /** Flame time in seconds (see `useFlameClock`) */
  time: number;
  /** How far the flame reaches, in pixels */
  reach: number;
  /** Emission direction in degrees (-90 = up) */
  direction: number;
  /** Draw lens outlines instead of filling */
  outline?: boolean;
  /** Mark each lens's centre — blue for body lenses, red for the subtracted holes */
  showCenters?: boolean;
  width?: number;
  height?: number;
};

/** Draw a small cross at each point, in the given colour. */
function markCenters(
  ctx: CanvasRenderingContext2D,
  points: {x: number; y: number}[],
  color: string,
  originX: number,
  originY: number,
): void {
  const arm = 3;
  ctx.strokeStyle = color;
  ctx.lineWidth   = 1;
  ctx.beginPath();
  for (const point of points) {
    const x = originX + point.x;
    const y = originY + point.y;
    ctx.moveTo(x - arm, y); ctx.lineTo(x + arm, y);
    ctx.moveTo(x, y - arm); ctx.lineTo(x, y + arm);
  }
  ctx.stroke();
}

/** The preview canvas: regenerates the flame whenever the params or the clock change. */
export const FlamePreview = (
  {
    params, color, time, reach, direction,
    outline = false, showCenters = false, width = 500, height = 500,
  }: FlamePreviewProps,
) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const generator = useMemo(
    () => generateAnimatedFlame({...params, reach, direction: (direction * Math.PI) / 180}),
    [params, reach, direction],
  );
  const shape = useMemo(() => generator.generate(time), [generator, time]);

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = "rgb(12,12,16)";
    ctx.fillRect(0, 0, width, height);
    const originX = width / 2;
    const originY = height - 70;
    renderFlame(ctx, shape, {color, originX, originY, stroke: outline});
    if (showCenters) {
      markCenters(ctx, shape.centers.body, "rgb(90,170,255)", originX, originY);
      markCenters(ctx, shape.centers.holes, "rgb(255,80,80)", originX, originY);
    }
  }, [shape, color, outline, showCenters, width, height]);

  return <canvas ref={canvasRef} width={width} height={height} style={{border: "1px solid black"}}/>;
};

/** Shared layout for one labelled control. */
export const controlCell: React.CSSProperties = {
  display: "flex", flexDirection: "column", fontSize: 11, width: 150,
};

export type SliderProps = {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  width?: number;
};

/** A labelled range input showing its current value. */
export const Slider = ({label, value, min, max, step, onChange, width}: SliderProps) => (
  <label style={width ? {...controlCell, width} : controlCell}>
    <span>{label}: {Number.isInteger(step) ? value : value.toFixed(3)}</span>
    <input type={"range"} min={min} max={max} step={step} value={value}
           onChange={e => onChange(parseFloat(e.target.value))}/>
  </label>
);

export type CheckboxProps = {label: string; checked: boolean; onChange: (checked: boolean) => void};

/** A small inline labelled checkbox, for the toggles above the preview. */
export const Checkbox = ({label, checked, onChange}: CheckboxProps) => (
  <label style={{fontSize: 11, display: "flex", gap: 4, alignItems: "center"}}>
    <input type={"checkbox"} checked={checked} onChange={e => onChange(e.target.checked)}/>{label}
  </label>
);

export type FlameParamControlsProps = {
  params: FlameParams;
  onChange: (params: FlameParams) => void;
};

/** Every flame parameter as a slider (or a select, for the easings). */
export const FlameParamControls = ({params, onChange}: FlameParamControlsProps) => {
  const setParam = (key: keyof FlameParams, value: number | boolean | EasingName) =>
    onChange({...params, [key]: value});

  return <>
    {EASING_KEYS.map(key => (
      <label key={key} style={controlCell}>
        <span>{key}</span>
        <select value={params[key]} onChange={e => setParam(key, e.target.value as EasingName)}>
          {easingNames.map(name => <option key={name} value={name}>{name}</option>)}
        </select>
      </label>
    ))}
    {NUM_SPECS.map(spec => (
      <Slider key={spec.key} label={spec.label} value={params[spec.key] as number}
              min={spec.min} max={spec.max} step={spec.step}
              onChange={value => setParam(spec.key, value)}/>
    ))}
  </>;
};

export type RandomizeButtonProps = {
  params: FlameParams;
  color: string;
  onChange: (next: {params: FlameParams; color: string}) => void;
};

/** Randomize button plus the strength slider that decides how far it jumps. */
export const RandomizeButton = ({params, color, onChange}: RandomizeButtonProps) => {
  const [strength, setStrength] = useState(1);
  return <span style={{display: "flex", gap: 6, alignItems: "center", fontSize: 11}}>
    <button onClick={() => onChange(randomizeFlameParams(params, color, strength))}>Randomize</button>
    <input type={"range"} min={0.05} max={1} step={0.05} value={strength} style={{width: 70}}
           onChange={e => setStrength(parseFloat(e.target.value))}
           title={"randomize strength"}/>
    <span>{strength.toFixed(2)}</span>
  </span>;
};

/** A fresh parameter set — every default, as a mutable copy. */
export const defaultFlameParams = (): FlameParams => ({...flameDefaults});
