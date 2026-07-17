import React, {useEffect, useMemo, useRef, useState} from "react";
import {generateAnimatedFlame, flameDefaults} from "../common/butaneFlame";
import {renderFlame} from "../common/renderFlame";
import {flameTemplates} from "../common/flameTemplates";
import {easingNames, EasingName} from "../common/easings";

const WIDTH  = 500;
const HEIGHT = 500;

type NumSpec = {key: keyof typeof flameDefaults; label: string; min: number; max: number; step: number};

// Numeric parameters (everything a template can set except the easings).
const NUM_SPECS: NumSpec[] = [
  {key: "bodyCount",        label: "bodyCount",        min: 1,   max: 80,   step: 1},
  {key: "bodyLengthRatio",  label: "bodyLengthRatio",  min: 0,   max: 0.5,  step: 0.005},
  {key: "lensAspect",       label: "lensAspect",       min: 0.2, max: 1.2,  step: 0.01},
  {key: "bodySizeVar",      label: "bodySizeVar",      min: 0,   max: 1.5,  step: 0.01},
  {key: "spread",           label: "spread",           min: 0,   max: 0.8,  step: 0.005},
  {key: "nozzleWidthRatio", label: "nozzleWidthRatio", min: 0,   max: 0.6,  step: 0.005},
  {key: "bodyTaperStart",   label: "bodyTaperStart",   min: 0,   max: 1,    step: 0.01},
  {key: "cutoffDist",       label: "cutoffDist",       min: 0.2, max: 1.5,  step: 0.01},
  {key: "bodySpeed",        label: "bodySpeed",        min: 0.1, max: 3,    step: 0.05},
  {key: "flickerRatio",     label: "flickerRatio",     min: 0,   max: 0.15, step: 0.002},
  {key: "flickerFreq",      label: "flickerFreq",      min: 0,   max: 8,    step: 0.1},
  {key: "holeCount",        label: "holeCount",        min: 0,   max: 24,   step: 1},
  {key: "holeSpanRatio",    label: "holeSpanRatio",    min: 0,   max: 0.5,  step: 0.005},
  {key: "holeThickness",    label: "holeThickness",    min: 0.1, max: 1.2,  step: 0.01},
  {key: "holeSizeVar",      label: "holeSizeVar",      min: 0,   max: 1,    step: 0.01},
  {key: "holeSpawnDist",    label: "holeSpawnDist",    min: 0,   max: 1,    step: 0.01},
  {key: "holeRiseDist",     label: "holeRiseDist",     min: 0,   max: 1,    step: 0.01},
  {key: "holeDriftDist",    label: "holeDriftDist",    min: 0,   max: 0.6,  step: 0.01},
  {key: "holeSpread",       label: "holeSpread",       min: 0,   max: 0.8,  step: 0.005},
  {key: "holeSpeed",        label: "holeSpeed",        min: 0.1, max: 3,    step: 0.05},
  {key: "lensResolution",   label: "lensResolution",   min: 2,   max: 10,   step: 1},
];

const EASING_KEYS = ["bodyDistEasing", "holeSizeEasing", "holeDistEasing"] as const;

type FlameParams = typeof flameDefaults;

/** Serialise the current params/colour as a template preset, keeping only the
 *  fields that differ from the defaults (so it reads like the entries in
 *  flameTemplates.ts). */
function serializePreset(params: FlameParams, color: string, name: string): string {
  const config: Record<string, unknown> = {};
  (Object.keys(params) as (keyof FlameParams)[]).forEach(k => {
    if (params[k] !== flameDefaults[k]) config[k] = params[k];
  });
  return JSON.stringify({name, color, config}, null, 2);
}

export const Default = () => {

  const canvasRef         = React.useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();

  const [time, setTime]           = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  const [templateIndex, setTemplateIndex] = useState(0);
  const [reach, setReach]                 = useState(240);
  const [direction, setDirection]         = useState(-90); // degrees; -90 = up
  const [outline, setOutline]             = useState(false);

  const [params, setParams] = useState<FlameParams>({...flameDefaults, ...flameTemplates[0].config});
  const [color, setColor]   = useState(flameTemplates[0].color);

  const [presetText, setPresetText] = useState("");
  const [presetError, setPresetError] = useState("");

  const directionRad = (direction * Math.PI) / 180;

  // Keep the preset text in sync with the current params (updates as sliders move).
  useEffect(() => {
    setPresetText(serializePreset(params, color, flameTemplates[templateIndex].name));
    setPresetError("");
  }, [params, color, templateIndex]);

  const applyPreset = () => {
    try {
      const parsed = JSON.parse(presetText);
      if (parsed.config) setParams({...flameDefaults, ...parsed.config});
      if (typeof parsed.color === "string") setColor(parsed.color);
      setPresetError("");
    } catch (e) {
      setPresetError(String(e));
    }
  };

  const applyTemplate = (index: number) => {
    setTemplateIndex(index);
    setParams({...flameDefaults, ...flameTemplates[index].config});
    setColor(flameTemplates[index].color);
  };

  const setParam = (key: keyof FlameParams, value: number | EasingName) => {
    setParams(prev => ({...prev, [key]: value}));
  };

  const flameGenerator = useMemo(() => {
    return generateAnimatedFlame({...params, reach, direction: directionRad});
  }, [params, reach, directionRad]);

  const flameShape = useMemo(() => flameGenerator.generate(time), [time, flameGenerator]);

  useEffect(() => {
    if (!isPlaying) return;
    let lastTime = performance.now();
    const animate = (currentTime: number) => {
      const deltaTime = currentTime - lastTime;
      lastTime        = currentTime;
      setTime(prev => prev + deltaTime / 1000);
      animationFrameRef.current = requestAnimationFrame(animate);
    };
    animationFrameRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [isPlaying]);

  useEffect(() => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, WIDTH, HEIGHT);
    ctx.fillStyle = 'rgb(12,12,16)';
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    renderFlame(ctx, flameShape, {color, originX: WIDTH / 2, originY: HEIGHT - 70, stroke: outline});
  }, [flameShape, outline, color]);

  const cell: React.CSSProperties = {display: 'flex', flexDirection: 'column', fontSize: 11, width: 150};

  const slider = (spec: NumSpec) => {
    const value = params[spec.key] as number;
    return <label key={spec.key} style={cell}>
      <span>{spec.label}: {Number.isInteger(spec.step) ? value : value.toFixed(3)}</span>
      <input
        type={"range"} min={spec.min} max={spec.max} step={spec.step} value={value}
        onChange={(e) => setParam(spec.key, parseFloat(e.target.value))}
      />
    </label>;
  };

  const easingSelect = (key: typeof EASING_KEYS[number]) => (
    <label key={key} style={cell}>
      <span>{key}</span>
      <select value={params[key]} onChange={(e) => setParam(key, e.target.value as EasingName)}>
        {easingNames.map(n => <option key={n} value={n}>{n}</option>)}
      </select>
    </label>
  );

  return <div style={{fontFamily: 'sans-serif'}}>
    <div style={{display: 'flex', gap: 20, alignItems: 'flex-start'}}>
      <div>
        <div style={{display: 'flex', gap: 8, marginBottom: 6, alignItems: 'center'}}>
          <button onClick={() => setIsPlaying(!isPlaying)}>{isPlaying ? 'Pause' : 'Play'}</button>
          <select value={templateIndex} onChange={(e) => applyTemplate(parseInt(e.target.value))}>
            {flameTemplates.map((tpl, i) => <option key={tpl.name} value={i}>{tpl.name}</option>)}
          </select>
          <label style={{fontSize: 11, display: 'flex', gap: 4, alignItems: 'center'}}>
            <input type={"checkbox"} checked={outline} onChange={(e) => setOutline(e.target.checked)}/>outline
          </label>
        </div>
        <canvas ref={canvasRef} width={WIDTH} height={HEIGHT} style={{border: '1px solid black'}}/>
        <div style={{display: 'flex', gap: 8, marginTop: 6}}>
          <label style={{...cell, width: 240}}>
            <span>time: {(time % 10).toFixed(2)}</span>
            <input type={"range"} min={0} max={10} step={0.01} value={time % 10}
                   onChange={(e) => {setIsPlaying(false); setTime(parseFloat(e.target.value));}}/>
          </label>
          <label style={cell}>
            <span>color</span>
            <input value={color} onChange={(e) => setColor(e.target.value)}/>
          </label>
        </div>
        <div style={{marginTop: 8, width: WIDTH}}>
          <div style={{display: 'flex', gap: 8, alignItems: 'center', fontSize: 11, marginBottom: 2}}>
            <span>preset (copy / paste)</span>
            <button onClick={applyPreset}>Apply</button>
            {presetError && <span style={{color: '#e66'}}>{presetError}</span>}
          </div>
          <textarea
            value={presetText}
            onChange={(e) => setPresetText(e.target.value)}
            spellCheck={false}
            style={{width: '100%', height: 150, fontFamily: 'monospace', fontSize: 11, boxSizing: 'border-box'}}
          />
        </div>
      </div>
      <div style={{display: 'flex', flexWrap: 'wrap', gap: '6px 12px', width: 340}}>
        <label style={cell}>
          <span>reach: {reach}</span>
          <input type={"range"} min={80} max={500} step={1} value={reach}
                 onChange={(e) => setReach(parseFloat(e.target.value))}/>
        </label>
        <label style={cell}>
          <span>direction: {direction}°</span>
          <input type={"range"} min={-180} max={0} step={1} value={direction}
                 onChange={(e) => setDirection(parseFloat(e.target.value))}/>
        </label>
        {EASING_KEYS.map(easingSelect)}
        {NUM_SPECS.map(slider)}
      </div>
    </div>
  </div>;
};
