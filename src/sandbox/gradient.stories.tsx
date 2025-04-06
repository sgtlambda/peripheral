import React, { useState } from "react";
import { ColorStop, getGradientColor, colorTupleToRgba } from "../common/colorGradient";

export const Default: React.FC = () => {
  const [position, setPosition] = useState(0.5);
  
  // Define a gradient: green -> red -> semi-transparent black
  const gradient: ColorStop[] = [
    { color: [0, 255, 0, 1], position: 0 },     // Green
    { color: [255, 0, 0, 1], position: 0.5 },   // Red
    { color: [0, 0, 0, 0.5], position: 1 }      // Semi-transparent black
  ];
  
  // Get current color based on position
  const currentColor = getGradientColor(gradient, position);
  const rgbaColor = colorTupleToRgba(currentColor);
  
  // Canvas dimensions
  const width = 600;
  const height = 100;
  
  // Render the full gradient
  const renderGradient = () => {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      // For each pixel in the width, calculate the corresponding color
      for (let x = 0; x < width; x++) {
        const pos = x / width;
        const color = getGradientColor(gradient, pos);
        ctx.fillStyle = colorTupleToRgba(color);
        ctx.fillRect(x, 0, 1, height);
      }
    }
    
    return canvas.toDataURL();
  };
  
  const gradientImage = renderGradient();
  
  return (
    <div style={{ padding: "20px", fontFamily: "sans-serif" }}>
      <h3>Color Gradient Demo</h3>
      
      <div style={{ marginBottom: "20px" }}>
        <div style={{ 
          display: "flex", 
          alignItems: "center", 
          gap: "10px",
          marginBottom: "10px" 
        }}>
          <div>Position: {position.toFixed(2)}</div>
          <input 
            type="range" 
            min="0" 
            max="1" 
            step="0.01" 
            value={position} 
            onChange={(e) => setPosition(parseFloat(e.target.value))} 
            style={{ flexGrow: 1 }}
          />
        </div>
        
        <div style={{ 
          display: "flex", 
          gap: "20px", 
          alignItems: "center" 
        }}>
          <div>Current Color:</div>
          <div style={{ 
            width: "60px", 
            height: "60px", 
            background: rgbaColor, 
            border: "1px solid #ccc",
            borderRadius: "4px"
          }} />
          <div>
            <div>RGBA: {rgbaColor}</div>
            <div>Values: [{currentColor.map(v => v.toFixed(1)).join(", ")}]</div>
          </div>
        </div>
      </div>
      
      <div>
        <h4>Full Gradient</h4>
        <div style={{ position: "relative" }}>
          <img 
            src={gradientImage} 
            alt="Color gradient" 
            style={{ 
              width: "100%", 
              height: "50px", 
              borderRadius: "4px", 
              border: "1px solid #ccc" 
            }} 
          />
          <div style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            left: `${position * 100}%`,
            width: "2px",
            background: "white",
            border: "1px solid black"
          }} />
        </div>
      </div>
      
      <div style={{ marginTop: "30px" }}>
        <h4>Gradient Configuration</h4>
        <pre style={{ 
          background: "#f4f4f4", 
          padding: "10px", 
          borderRadius: "4px" 
        }}>
          {gradient.map(stop => (
            `{ color: [${stop.color.join(", ")}], position: ${stop.position} }`
          )).join(",\n")}
        </pre>
      </div>
    </div>
  );
}; 