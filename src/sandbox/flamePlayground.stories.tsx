import React, {useEffect, useMemo, useState} from "react";
import {FlameParams, flameDefaults} from "../common/flame";
import {FlamePreset, PRESET_PARAM_KEYS} from "../common/flamePresets";
import {flameTemplates} from "../common/flameTemplates";
import {loadPresets, savePresets} from "./flamePresetStore";
import {
  FlameParamControls,
  FlamePreview,
  Checkbox,
  RandomizeButton,
  Slider,
  controlCell,
  defaultFlameParams,
  useFlameClock,
} from "./flameControls";

const WIDTH  = 500;
const HEIGHT = 500;

/** Presets are identified by name — one row per name in the CSV. */
const sameName = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase();

/** True when the working copy differs from the stored preset it came from. */
function isDirty(preset: FlamePreset | undefined, params: FlameParams, color: string): boolean {
  if (!preset) return true;
  if (preset.color !== color) return true;
  return PRESET_PARAM_KEYS.some(key => preset.config[key] !== params[key]);
}

/** The overrides-only JSON form, i.e. what a `flameTemplates.ts` entry looks like. */
function toTemplateJson(name: string, color: string, params: FlameParams): string {
  const config: Record<string, unknown> = {};
  PRESET_PARAM_KEYS.forEach(key => {
    if (params[key] !== flameDefaults[key]) config[key] = params[key];
  });
  return JSON.stringify({name, color, config}, null, 2);
}

export const Default = () => {

  const [isPlaying, setIsPlaying] = useState(true);
  const [time, setTime]           = useFlameClock(isPlaying);

  const [reach, setReach]         = useState(240);
  const [direction, setDirection] = useState(-90);
  const [outline, setOutline]         = useState(false);
  const [showCenters, setShowCenters] = useState(false);

  const [params, setParams] = useState<FlameParams>(defaultFlameParams);
  const [color, setColor]   = useState("rgb(255,124,66)");
  const [name, setName]     = useState("untitled");

  const [presets, setPresets]         = useState<FlamePreset[]>([]);
  const [selectedName, setSelected]   = useState<string | null>(null);
  const [status, setStatus]           = useState("loading presets…");
  const [error, setError]             = useState("");

  const [json, setJson]           = useState("");
  const [jsonError, setJsonError] = useState("");

  const selected = useMemo(
    () => presets.find(preset => selectedName !== null && sameName(preset.name, selectedName)),
    [presets, selectedName],
  );
  const dirty  = selected !== undefined && (isDirty(selected, params, color) || selected.name !== name);
  const exists = presets.some(preset => sameName(preset.name, name));

  const openPreset = (preset: FlamePreset) => {
    setParams({...preset.config});
    setColor(preset.color);
    setName(preset.name);
    setSelected(preset.name);
  };

  // Load the CSV database once, and open the first preset so there is something
  // on screen straight away.
  useEffect(() => {
    loadPresets()
      .then(loaded => {
        setPresets(loaded);
        setStatus(`${loaded.length} preset${loaded.length === 1 ? "" : "s"}`);
        if (loaded.length > 0) openPreset(loaded[0]);
      })
      .catch(err => {
        setError(`${err} — is the dev server running? (presets live in data/flamePresets.csv)`);
        setStatus("");
      });
  }, []);

  // Keep the JSON view in sync with the working copy.
  useEffect(() => {
    setJson(toTemplateJson(name, color, params));
    setJsonError("");
  }, [name, color, params]);

  /** Write the list to the CSV, reporting the outcome in the status line. */
  const persist = (next: FlamePreset[], message: string) => {
    setPresets(next);
    savePresets(next)
      .then(() => {setStatus(message); setError("");})
      .catch(err => setError(String(err)));
  };

  const save = () => {
    const trimmed = name.trim();
    if (trimmed === "") {setError("name the preset first"); return;}
    const preset: FlamePreset = {name: trimmed, color, config: {...params}};
    const index = presets.findIndex(p => sameName(p.name, trimmed));
    const next  = index >= 0
      ? presets.map((p, i) => (i === index ? preset : p))
      : [...presets, preset];
    setSelected(trimmed);
    persist(next, index >= 0 ? `updated "${trimmed}"` : `saved "${trimmed}"`);
  };

  const remove = () => {
    if (!selected) return;
    const next = presets.filter(preset => preset !== selected);
    setSelected(null);
    persist(next, `deleted "${selected.name}"`);
  };

  const applyJson = () => {
    try {
      const parsed = JSON.parse(json);
      setParams({...flameDefaults, ...(parsed.config ?? {})});
      if (typeof parsed.color === "string") setColor(parsed.color);
      if (typeof parsed.name === "string") setName(parsed.name);
      setJsonError("");
    } catch (err) {
      setJsonError(String(err));
    }
  };

  const button = (label: string, onClick: () => void, disabled = false) =>
    <button onClick={onClick} disabled={disabled}>{label}</button>;

  return <div style={{fontFamily: "sans-serif", display: "flex", gap: 16, alignItems: "flex-start"}}>

    {/* Preset database */}
    <div style={{width: 190, display: "flex", flexDirection: "column", gap: 6}}>
      <div style={{fontSize: 12, fontWeight: 600}}>presets</div>
      <div style={{border: "1px solid #ccc", height: 360, overflowY: "auto", fontSize: 12}}>
        {presets.map((preset, i) => (
          <div key={`${preset.name}-${i}`}
               onClick={() => openPreset(preset)}
               style={{
                 padding:         "3px 6px",
                 cursor:          "pointer",
                 display:         "flex",
                 alignItems:      "center",
                 gap:             6,
                 background:      preset === selected ? "#dbe9ff" : undefined,
                 fontWeight:      preset === selected ? 600 : 400,
               }}>
            <span style={{
              width: 10, height: 10, borderRadius: 5, flex: "0 0 auto", background: preset.color,
              border: "1px solid #999",
            }}/>
            <span style={{overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap"}}>{preset.name}</span>
          </div>
        ))}
        {presets.length === 0 && <div style={{padding: 6, color: "#888"}}>empty</div>}
      </div>

      <input value={name} onChange={e => setName(e.target.value)} placeholder={"preset name"}
             style={{fontSize: 12, padding: "2px 4px"}}/>
      <div style={{display: "flex", gap: 4, flexWrap: "wrap"}}>
        {button(exists ? "Update" : "Save", save)}
        {button("Delete", remove, !selected)}
        {button("Revert", () => selected && openPreset(selected), !selected || !dirty)}
        {button("New", () => {
          setParams(defaultFlameParams());
          setColor("rgb(255,124,66)");
          setName("untitled");
          setSelected(null);
        })}
      </div>

      <select style={{fontSize: 12}} value={""}
              onChange={e => {
                const template = flameTemplates[parseInt(e.target.value)];
                if (!template) return;
                setParams({...flameDefaults, ...template.config});
                setColor(template.color);
                setName(template.name);
                setSelected(null);
              }}>
        <option value={""}>load built-in template…</option>
        {flameTemplates.map((template, i) => <option key={template.name} value={i}>{template.name}</option>)}
      </select>

      <div style={{fontSize: 11, color: dirty ? "#b26a00" : "#666", minHeight: 15}}>
        {dirty ? "unsaved changes" : status}
      </div>
      {error && <div style={{fontSize: 11, color: "#c00"}}>{error}</div>}
    </div>

    {/* Preview */}
    <div>
      <div style={{display: "flex", gap: 8, marginBottom: 6, alignItems: "center"}}>
        <button onClick={() => setIsPlaying(!isPlaying)}>{isPlaying ? "Pause" : "Play"}</button>
        <RandomizeButton params={params} color={color} onChange={next => {
          setParams(next.params);
          setColor(next.color);
        }}/>
        <Checkbox label={"outline"} checked={outline} onChange={setOutline}/>
        <Checkbox label={"centers"} checked={showCenters} onChange={setShowCenters}/>
        <Checkbox label={"cull islands"} checked={params.cullIslands}
                  onChange={checked => setParams({...params, cullIslands: checked})}/>
      </div>

      <FlamePreview params={params} color={color} time={time} reach={reach} direction={direction}
                    outline={outline} showCenters={showCenters} width={WIDTH} height={HEIGHT}/>

      <div style={{display: "flex", gap: 8, marginTop: 6}}>
        <Slider label={"time"} value={time % 10} min={0} max={10} step={0.01} width={240}
                onChange={value => {setIsPlaying(false); setTime(value);}}/>
        <label style={controlCell}>
          <span>color</span>
          <input value={color} onChange={e => setColor(e.target.value)}/>
        </label>
      </div>

      <div style={{marginTop: 8, width: WIDTH}}>
        <div style={{display: "flex", gap: 8, alignItems: "center", fontSize: 11, marginBottom: 2}}>
          <span>template JSON (overrides only)</span>
          <button onClick={applyJson}>Apply</button>
          {jsonError && <span style={{color: "#e66"}}>{jsonError}</span>}
        </div>
        <textarea value={json} onChange={e => setJson(e.target.value)} spellCheck={false}
                  style={{width: "100%", height: 130, fontFamily: "monospace", fontSize: 11, boxSizing: "border-box"}}/>
      </div>
    </div>

    {/* Parameters */}
    <div style={{display: "flex", flexWrap: "wrap", gap: "6px 12px", width: 340}}>
      <Slider label={"reach"} value={reach} min={80} max={500} step={1} onChange={setReach}/>
      <Slider label={"direction°"} value={direction} min={-180} max={0} step={1} onChange={setDirection}/>
      <FlameParamControls params={params} onChange={setParams}/>
    </div>
  </div>;
};
