import React, {useState} from "react";
import {FlameParams, flameDefaults} from "../common/flame";
import {flameTemplates} from "../common/flameTemplates";
import {
  FlameParamControls,
  FlamePreview,
  Checkbox,
  RandomizeButton,
  Slider,
  controlCell,
  useFlameClock,
} from "./flameControls";

/**
 * Quick look at the built-in flame templates with live parameter sliders.
 * For naming, storing and comparing your own presets, use the Flame Playground
 * story — it drives the same controls against the CSV preset database.
 */
export const Default = () => {

  const [isPlaying, setIsPlaying] = useState(true);
  const [time, setTime]           = useFlameClock(isPlaying);

  const [templateIndex, setTemplateIndex] = useState(0);
  const [reach, setReach]                 = useState(240);
  const [direction, setDirection]         = useState(-90);
  const [outline, setOutline]             = useState(false);
  const [showCenters, setShowCenters]     = useState(false);

  const [params, setParams] = useState<FlameParams>({...flameDefaults, ...flameTemplates[0].config});
  const [color, setColor]   = useState(flameTemplates[0].color);

  const applyTemplate = (index: number) => {
    setTemplateIndex(index);
    setParams({...flameDefaults, ...flameTemplates[index].config});
    setColor(flameTemplates[index].color);
  };

  return <div style={{fontFamily: "sans-serif", display: "flex", gap: 20, alignItems: "flex-start"}}>
    <div>
      <div style={{display: "flex", gap: 8, marginBottom: 6, alignItems: "center"}}>
        <button onClick={() => setIsPlaying(!isPlaying)}>{isPlaying ? "Pause" : "Play"}</button>
        <select value={templateIndex} onChange={e => applyTemplate(parseInt(e.target.value))}>
          {flameTemplates.map((template, i) => <option key={template.name} value={i}>{template.name}</option>)}
        </select>
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
                    outline={outline} showCenters={showCenters}/>

      <div style={{display: "flex", gap: 8, marginTop: 6}}>
        <Slider label={"time"} value={time % 10} min={0} max={10} step={0.01} width={240}
                onChange={value => {setIsPlaying(false); setTime(value);}}/>
        <label style={controlCell}>
          <span>color</span>
          <input value={color} onChange={e => setColor(e.target.value)}/>
        </label>
      </div>
    </div>

    <div style={{display: "flex", flexWrap: "wrap", gap: "6px 12px", width: 340}}>
      <Slider label={"reach"} value={reach} min={80} max={500} step={1} onChange={setReach}/>
      <Slider label={"direction°"} value={direction} min={-180} max={0} step={1} onChange={setDirection}/>
      <FlameParamControls params={params} onChange={setParams}/>
    </div>
  </div>;
};
