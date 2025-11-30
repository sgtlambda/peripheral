import React, { useEffect, useRef, useState, useMemo } from "react";
import { ProceduralTerrain } from "../common/terrain";
import { BipedWalker, BipedState, FootState } from "../common/bipedWalker";

/**
 * Render terrain as a filled polygon.
 */
function renderTerrain(
  ctx: CanvasRenderingContext2D,
  terrain: ProceduralTerrain,
  worldOffset: number,
  canvasWidth: number,
  canvasHeight: number,
  groundY: number
): void {
  const resolution = 100;
  const startX = worldOffset;
  const endX = worldOffset + canvasWidth;
  
  const points = terrain.sample(startX, endX, resolution);
  
  // Create terrain gradient
  const gradient = ctx.createLinearGradient(0, groundY - 50, 0, canvasHeight);
  gradient.addColorStop(0, "#4a7c59");
  gradient.addColorStop(0.3, "#3d6b4f");
  gradient.addColorStop(1, "#2d4a3e");
  
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.moveTo(0, canvasHeight);
  
  for (const point of points) {
    const screenX = point.x - worldOffset;
    const screenY = groundY + point.y;
    ctx.lineTo(screenX, screenY);
  }
  
  ctx.lineTo(canvasWidth, canvasHeight);
  ctx.closePath();
  ctx.fill();
  
  // Add terrain outline
  ctx.strokeStyle = "#5a9c69";
  ctx.lineWidth = 2;
  ctx.beginPath();
  for (let i = 0; i < points.length; i++) {
    const screenX = points[i].x - worldOffset;
    const screenY = groundY + points[i].y;
    if (i === 0) {
      ctx.moveTo(screenX, screenY);
    } else {
      ctx.lineTo(screenX, screenY);
    }
  }
  ctx.stroke();
}

/**
 * Draw a half circle (semicircle) rotated to match terrain angle.
 * Flat side faces down (on the terrain).
 */
function drawHalfCircle(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  terrainAngle: number,
  fillColor: string,
  strokeColor: string,
  grounded: boolean
): void {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(terrainAngle);
  
  // Draw outline
  ctx.fillStyle = strokeColor;
  ctx.beginPath();
  // Semicircle: flat side on bottom (facing terrain)
  ctx.arc(0, 0, radius + 1.5, Math.PI, 0, false);
  ctx.closePath();
  ctx.fill();
  
  // Draw fill
  ctx.fillStyle = fillColor;
  ctx.beginPath();
  ctx.arc(0, 0, radius, Math.PI, 0, false);
  ctx.closePath();
  ctx.fill();
  
  // If grounded, add a small contact indicator
  if (grounded) {
    ctx.fillStyle = strokeColor;
    ctx.fillRect(-radius * 0.6, -2, radius * 1.2, 2);
  }
  
  ctx.restore();
}

/**
 * Draw a crosshair/axis marker at a position
 */
function drawCrosshair(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  color: string,
  label?: string
): void {
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  
  // Horizontal line
  ctx.beginPath();
  ctx.moveTo(x - size, y);
  ctx.lineTo(x + size, y);
  ctx.stroke();
  
  // Vertical line
  ctx.beginPath();
  ctx.moveTo(x, y - size);
  ctx.lineTo(x, y + size);
  ctx.stroke();
  
  // Center dot
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, 3, 0, Math.PI * 2);
  ctx.fill();
  
  // Label
  if (label) {
    ctx.font = "10px monospace";
    ctx.fillStyle = color;
    ctx.fillText(label, x + size + 4, y + 3);
  }
}

/**
 * Draw a target marker (diamond shape)
 */
function drawTargetMarker(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  color: string
): void {
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  
  ctx.beginPath();
  ctx.moveTo(x, y - size);
  ctx.lineTo(x + size, y);
  ctx.lineTo(x, y + size);
  ctx.lineTo(x - size, y);
  ctx.closePath();
  ctx.stroke();
}

/**
 * Render the simplified bipedal character
 */
function renderBiped(
  ctx: CanvasRenderingContext2D,
  state: BipedState,
  groundY: number,
  footRadius: number
): void {
  const offsetY = groundY;
  
  // Colors
  const bodyColor = "#e8d4b8";
  const outlineColor = "#5c4a3d";
  const footColor = "#d4a574";
  
  // Draw feet (back foot first based on walk phase)
  const backFoot = state.walkPhase < 0.25 || state.walkPhase > 0.75 
    ? state.rightFoot 
    : state.leftFoot;
  const frontFoot = backFoot === state.leftFoot 
    ? state.rightFoot 
    : state.leftFoot;
  
  // Back foot
  drawHalfCircle(
    ctx,
    backFoot.position.x,
    backFoot.position.y + offsetY,
    footRadius,
    backFoot.terrainAngle,
    footColor,
    outlineColor,
    backFoot.grounded
  );
  
  // Body (simple circle)
  const { bodyCenter } = state;
  ctx.fillStyle = outlineColor;
  ctx.beginPath();
  ctx.arc(bodyCenter.x, bodyCenter.y + offsetY, 20, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.fillStyle = bodyColor;
  ctx.beginPath();
  ctx.arc(bodyCenter.x, bodyCenter.y + offsetY, 18, 0, Math.PI * 2);
  ctx.fill();
  
  // Front foot
  drawHalfCircle(
    ctx,
    frontFoot.position.x,
    frontFoot.position.y + offsetY,
    footRadius,
    frontFoot.terrainAngle,
    footColor,
    outlineColor,
    frontFoot.grounded
  );
  
  // Head
  const { headCenter } = state;
  ctx.fillStyle = outlineColor;
  ctx.beginPath();
  ctx.arc(headCenter.x, headCenter.y + offsetY, 14, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.fillStyle = bodyColor;
  ctx.beginPath();
  ctx.arc(headCenter.x, headCenter.y + offsetY, 12, 0, Math.PI * 2);
  ctx.fill();
  
  // Simple face - eyes
  ctx.fillStyle = outlineColor;
  ctx.beginPath();
  ctx.arc(headCenter.x - 4, headCenter.y + offsetY - 2, 2, 0, Math.PI * 2);
  ctx.arc(headCenter.x + 4, headCenter.y + offsetY - 2, 2, 0, Math.PI * 2);
  ctx.fill();
  
  // Debug: Draw foot position crosshairs and target markers
  // Left foot - current position (cyan) and target (yellow diamond)
  drawCrosshair(
    ctx,
    state.leftFoot.position.x,
    state.leftFoot.position.y + offsetY,
    12,
    "#4ecdc4",
    "L"
  );
  drawTargetMarker(
    ctx,
    state.leftFoot.targetPosition.x,
    state.leftFoot.targetPosition.y + offsetY,
    8,
    "#f1c40f"
  );
  
  // Right foot - current position (magenta) and target (orange diamond)
  drawCrosshair(
    ctx,
    state.rightFoot.position.x,
    state.rightFoot.position.y + offsetY,
    12,
    "#e056fd",
    "R"
  );
  drawTargetMarker(
    ctx,
    state.rightFoot.targetPosition.x,
    state.rightFoot.targetPosition.y + offsetY,
    8,
    "#e67e22"
  );
}

/**
 * Draw background gradient sky
 */
function renderBackground(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
): void {
  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, "#1a1a2e");
  gradient.addColorStop(0.4, "#16213e");
  gradient.addColorStop(0.7, "#1f4068");
  gradient.addColorStop(1, "#2d6187");
  
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
  
  // Add some simple clouds/atmosphere
  ctx.fillStyle = "rgba(255, 255, 255, 0.03)";
  for (let i = 0; i < 5; i++) {
    const x = (i * 200 + 50) % width;
    const y = 50 + i * 30;
    ctx.beginPath();
    ctx.ellipse(x, y, 80, 30, 0, 0, Math.PI * 2);
    ctx.fill();
  }
}

export const Default: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();
  
  const [isPlaying, setIsPlaying] = useState(true);
  const [scrollSpeed, setScrollSpeed] = useState(80);
  
  // Jump state (using refs for smooth animation)
  const jumpVelocityRef = useRef(0);
  const jumpOffsetRef = useRef(0);
  const isJumpingRef = useRef(false);
  
  // Canvas dimensions
  const width = 900;
  const height = 500;
  const groundY = 350;
  
  // Jump constants
  const GRAVITY = 800;
  const JUMP_VELOCITY = -350;
  
  // Create terrain and walker instances
  const terrain = useMemo(() => new ProceduralTerrain({
    baseHeight: 0,
    amplitude: 40,
    frequency: 0.008,
    octaves: 3,
    persistence: 0.4,
    seed: 12345,
  }), []);
  
  const walker = useMemo(() => new BipedWalker(
    { x: width / 2, y: groundY - 50 },
    {
      footSpacing: 24,
      bodyHeight: 50,
      bodyRadius: 18,
      headRadius: 12,
      footRadius: 10,
      strideLength: 45,
      stepHeight: 25,
    }
  ), []);
  
  const footRadius = walker.getConfig().footRadius;
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    let lastTime = performance.now();
    
    const render = (currentTime: number) => {
      const deltaTime = (currentTime - lastTime) / 1000;
      lastTime = currentTime;
      
      // Update jump physics
      if (isJumpingRef.current || jumpOffsetRef.current < 0) {
        jumpVelocityRef.current += GRAVITY * deltaTime;
        jumpOffsetRef.current += jumpVelocityRef.current * deltaTime;
        
        // Land when reaching ground
        if (jumpOffsetRef.current >= 0) {
          jumpOffsetRef.current = 0;
          jumpVelocityRef.current = 0;
          isJumpingRef.current = false;
        }
      }
      
      // Apply jump offset to walker
      walker.setJumpOffset(jumpOffsetRef.current);
      
      // Update walker with terrain height and angle functions
      walker.update(
        deltaTime,
        (x: number) => terrain.getHeightAt(x),
        (x: number) => terrain.getSlopeAngle(x),
        scrollSpeed
      );
      
      // Clear and draw background
      renderBackground(ctx, width, height);
      
      // Draw terrain
      renderTerrain(ctx, terrain, walker.getWorldOffset(), width, height, groundY);
      
      // Draw character
      const bipedState = walker.getState();
      renderBiped(ctx, bipedState, groundY, footRadius);
      
      // Draw debug info
      ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
      ctx.font = "12px monospace";
      ctx.fillText(`World offset: ${Math.round(walker.getWorldOffset())}`, 10, 20);
      ctx.fillText(`Walk phase: ${bipedState.walkPhase.toFixed(2)}`, 10, 35);
      ctx.fillText(`Speed: ${scrollSpeed} px/s`, 10, 50);
      ctx.fillText(`Jump: ${Math.round(jumpOffsetRef.current)}px`, 10, 65);
      
      // Foot angles (in degrees for readability)
      const leftAngleDeg = (bipedState.leftFoot.terrainAngle * 180 / Math.PI).toFixed(1);
      const rightAngleDeg = (bipedState.rightFoot.terrainAngle * 180 / Math.PI).toFixed(1);
      ctx.fillText(`Foot angles: L=${leftAngleDeg}° R=${rightAngleDeg}°`, 10, 80);
      
      if (walker.getIsInAir()) {
        ctx.fillStyle = "#4ecdc4";
        ctx.fillText("IN AIR", 10, 95);
      } else if (walker.getIsLanding()) {
        ctx.fillStyle = "#f39c12";
        ctx.fillText("LANDING", 10, 95);
      }
      
      if (isPlaying) {
        animationFrameRef.current = requestAnimationFrame(render);
      }
    };
    
    animationFrameRef.current = requestAnimationFrame(render);
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, scrollSpeed, terrain, walker, footRadius]);
  
  const handleReset = () => {
    walker.reset({ x: width / 2, y: groundY - 50 });
    jumpOffsetRef.current = 0;
    jumpVelocityRef.current = 0;
    isJumpingRef.current = false;
  };
  
  const handleJump = () => {
    if (!isJumpingRef.current && jumpOffsetRef.current >= 0) {
      jumpVelocityRef.current = JUMP_VELOCITY;
      isJumpingRef.current = true;
    }
  };
  
  return (
    <div style={{ 
      padding: "20px", 
      fontFamily: "system-ui, sans-serif",
      background: "#0f0f1a",
      minHeight: "100vh",
    }}>
      <h3 style={{ color: "#fff", margin: "0 0 20px 0" }}>
        Bipedal Walker with Procedural Terrain
      </h3>
      
      <div style={{ 
        marginBottom: "20px", 
        display: "flex", 
        gap: "20px", 
        alignItems: "center",
        flexWrap: "wrap",
      }}>
        <button 
          onClick={() => setIsPlaying(!isPlaying)}
          style={{
            padding: "8px 16px",
            background: isPlaying ? "#e74c3c" : "#27ae60",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          {isPlaying ? "Pause" : "Play"}
        </button>
        
        <button 
          onClick={handleReset}
          style={{
            padding: "8px 16px",
            background: "#3498db",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Reset
        </button>
        
        <button 
          onClick={handleJump}
          style={{
            padding: "8px 16px",
            background: "#9b59b6",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          Jump!
        </button>
        
        <div style={{ color: "#ccc", display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          <label style={{ fontFamily: "monospace", minWidth: "130px", display: "inline-block" }}>
            Speed: {scrollSpeed.toString().padStart(4, '\u00A0')} px/s
          </label>
          <input
            type="range"
            min={-200}
            max={200}
            value={scrollSpeed}
            onInput={(e) => setScrollSpeed(parseInt((e.target as HTMLInputElement).value))}
            style={{ width: "150px" }}
          />
          <div style={{ display: "flex", gap: "4px" }}>
            {[-150, -80, 0, 80, 150].map((speed) => (
              <button
                key={speed}
                onClick={() => setScrollSpeed(speed)}
                style={{
                  padding: "4px 8px",
                  background: scrollSpeed === speed ? "#9b59b6" : "#555",
                  color: "white",
                  border: "none",
                  borderRadius: "3px",
                  cursor: "pointer",
                  fontSize: "12px",
                }}
              >
                {speed > 0 ? `+${speed}` : speed}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        style={{ 
          border: "2px solid #333", 
          borderRadius: "8px",
          display: "block",
        }}
      />
      
      <div style={{ 
        marginTop: "20px", 
        color: "#888", 
        fontSize: "14px",
        maxWidth: "600px",
      }}>
        <p style={{ margin: "0 0 10px 0" }}>
          <strong style={{ color: "#aaa" }}>Features:</strong>
        </p>
        <ul style={{ margin: 0, paddingLeft: "20px" }}>
          <li>Procedural terrain using simplex noise</li>
          <li>Feet rendered as half-circles matching terrain angle</li>
          <li>Terrain snapping when feet are close to ground</li>
          <li>Walking cycle with foot lift and ground contact</li>
        </ul>
      </div>
    </div>
  );
};
