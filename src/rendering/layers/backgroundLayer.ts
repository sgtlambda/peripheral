import Layer from '../Layer';
import Camera from '../Camera';
import { Render } from 'matter-js';

/**
 * Background layer - renders the full space background programmatically.
 * Includes:
 * - Nebula gradients with subtle pulsing
 * - Parallax star field
 * - Shooting stars
 * - Subtle grid overlay
 * - Vignette effect
 */

// Debug settings for background layer - toggle via console: backgroundSettings.showWorldGrid = true
export const backgroundSettings = {
  showWorldGrid: false,    // Orange grid fixed to world 0,0
  showParallaxGrid: false, // Blue grid with parallax effect
  showStars: true,
  showNebula: true,
  showShootingStars: true,
  showVignette: true,
};

// Expose on window for easy console access
declare global {
  interface Window {
    backgroundSettings: typeof backgroundSettings;
  }
}
window.backgroundSettings = backgroundSettings;

type ShootingStar = {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  progress: number;
  speed: number;
};

let shootingStars: ShootingStar[] = [];
let lastShootingStarTime = 0;
let startTime = 0;
let lastFrameTime = 0;

export default () => new Layer({
  hud: true,
  over: true, // Render AFTER Matter.js + stage layers, use destination-over to draw behind
  render(context: CanvasRenderingContext2D, renderer: Render, _camera: Camera) {
    const canvas = renderer.canvas;
    const now = performance.now();
    
    // Use destination-over to draw BEHIND existing content (crates, player, etc.)
    const previousCompositeOp = context.globalCompositeOperation;
    context.globalCompositeOperation = 'destination-over';
    
    if (startTime === 0) startTime = now;
    const time = now - startTime;
    const deltaTime = lastFrameTime === 0 ? 16 : now - lastFrameTime;
    lastFrameTime = now;
    
    const cameraX = renderer.bounds.min.x + canvas.width / 2;
    const cameraY = renderer.bounds.min.y + canvas.height / 2;
    
    const width = canvas.width;
    const height = canvas.height;
    
    // With destination-over, first drawn = closest to game content, last drawn = furthest back
    // Order: Grids (closest) -> Shooting stars -> Stars -> Nebula (furthest back)
    
    // Draw world-fixed grid first (closest to game content)
    if (backgroundSettings.showWorldGrid) {
      drawWorldGrid(context, width, height, cameraX, cameraY);
    }
    
    // Draw parallax grid
    if (backgroundSettings.showParallaxGrid) {
      drawGrid(context, width, height, time, cameraX, cameraY);
    }
    
    // Draw shooting stars
    if (backgroundSettings.showShootingStars) {
      // Spawn new shooting star occasionally
      if (time - lastShootingStarTime > 5000 + Math.random() * 8000) {
        lastShootingStarTime = time;
        const startX = Math.random() * width * 0.7 + width * 0.1;
        const startY = Math.random() * height * 0.3;
        const angle = Math.PI * 0.18 + Math.random() * Math.PI * 0.12;
        const distance = 150 + Math.random() * 150;
        
        shootingStars.push({
          startX,
          startY,
          endX: startX + Math.cos(angle) * distance,
          endY: startY + Math.sin(angle) * distance,
          progress: 0,
          speed: 0.0015 + Math.random() * 0.001,
        });
      }
      
      // Update and draw shooting stars
      shootingStars = shootingStars.filter(star => {
        star.progress += star.speed * deltaTime;
        if (star.progress > 1) return false;
        
        const currentX = star.startX + (star.endX - star.startX) * star.progress;
        const currentY = star.startY + (star.endY - star.startY) * star.progress;
        const trailProgress = Math.max(0, star.progress - 0.2);
        const trailX = star.startX + (star.endX - star.startX) * trailProgress;
        const trailY = star.startY + (star.endY - star.startY) * trailProgress;
        
        const alpha = star.progress < 0.1 
          ? star.progress * 10 
          : star.progress > 0.85 
            ? (1 - star.progress) / 0.15 
            : 1;
        
        const gradient = context.createLinearGradient(trailX, trailY, currentX, currentY);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0)');
        gradient.addColorStop(0.7, `rgba(200, 220, 255, ${alpha * 0.5})`);
        gradient.addColorStop(1, `rgba(255, 255, 255, ${alpha})`);
        
        context.strokeStyle = gradient;
        context.lineWidth = 2;
        context.lineCap = 'round';
        context.beginPath();
        context.moveTo(trailX, trailY);
        context.lineTo(currentX, currentY);
        context.stroke();
        
        return true;
      });
    }
    
    // Draw parallax stars
    if (backgroundSettings.showStars) {
      drawStars(context, width, height, time, cameraX, cameraY);
    }
    
    // Draw nebula background (furthest back)
    if (backgroundSettings.showNebula) {
      drawNebulaBackground(context, width, height, time, cameraX, cameraY);
    }
    
    // Restore composite operation
    context.globalCompositeOperation = previousCompositeOp;
  }
});

// Separate layer for vignette that renders AFTER everything (on top)
export const vignetteLayer = () => new Layer({
  hud: true,
  over: true, // Render after Matter.js and all game content
  render(context: CanvasRenderingContext2D, renderer: Render, _camera: Camera) {
    const canvas = renderer.canvas;
    if (backgroundSettings.showVignette) {
      drawVignette(context, canvas.width, canvas.height);
    }
  }
});

// Simple pseudo-random function for procedural generation (deterministic based on input)
function hash(x: number, y: number): number {
  const n = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
  return n - Math.floor(n);
}

// Smooth noise interpolation
function smoothNoise(x: number, y: number): number {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const fx = x - ix;
  const fy = y - iy;
  
  // Smoothstep interpolation
  const sx = fx * fx * (3 - 2 * fx);
  const sy = fy * fy * (3 - 2 * fy);
  
  const n00 = hash(ix, iy);
  const n10 = hash(ix + 1, iy);
  const n01 = hash(ix, iy + 1);
  const n11 = hash(ix + 1, iy + 1);
  
  const nx0 = n00 * (1 - sx) + n10 * sx;
  const nx1 = n01 * (1 - sx) + n11 * sx;
  
  return nx0 * (1 - sy) + nx1 * sy;
}

function drawNebulaBackground(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  time: number,
  cameraX: number,
  cameraY: number
) {
  // Parallax factor for nebula movement (slower than camera)
  const nebulaParallax = 0.15;
  const offsetX = cameraX * nebulaParallax;
  const offsetY = cameraY * nebulaParallax;
  
  // Scale for the procedural noise (controls how often colors change)
  const noiseScale = 0.001;
  
  // Sample noise at camera position for color variation
  const colorShift = smoothNoise(offsetX * noiseScale * 2, offsetY * noiseScale * 2);

  // Pulsing brightness factor
  const pulse = 1 + Math.sin(time * 0.0008) * 0.1;

  // With destination-over, first drawn = in front, last drawn = behind
  // So we draw nebula blobs FIRST (in front), then base gradient (behind)
  
  // Generate procedural nebula blobs based on camera position
  const nebulaCount = 6;
  const nebulaSeed = 42; // Base seed for consistency
  
  for (let i = 0; i < nebulaCount; i++) {
    // Procedural base position
    const baseX = hash(i * 7 + nebulaSeed, i * 13);
    const baseY = hash(i * 11 + nebulaSeed, i * 17);
    
    // Add camera-based offset with different parallax per layer (depth effect)
    // Slower parallax = appears further away
    const layerParallax = 0.05 + (i / nebulaCount) * 0.1; // 0.05 to 0.15
    const nebulaOffsetX = (offsetX * layerParallax) / (width * 2);
    const nebulaOffsetY = (offsetY * layerParallax) / (height * 2);
    
    // Wrap positions to create seamless scrolling (-0.3 to 1.3 range for overflow)
    let x = ((baseX + nebulaOffsetX) % 1.6) - 0.3;
    let y = ((baseY + nebulaOffsetY) % 1.6) - 0.3;
    
    // Procedural radius - larger for more coverage
    const r = 0.4 + hash(i * 19, nebulaSeed) * 0.35;
    
    // Procedural color - vibrant purple/blue/pink spectrum
    const localNoise = smoothNoise(
      (x * width + offsetX) * noiseScale,
      (y * height + offsetY) * noiseScale
    );
    
    const hue = 260 + localNoise * 50 + i * 20; // Purples to magentas
    const saturation = 0.6 + hash(i * 23, nebulaSeed) * 0.25; // More saturated
    const lightness = 0.45 + hash(i * 29, nebulaSeed) * 0.15; // Brighter
    const alpha = (0.35 + hash(i * 31, nebulaSeed) * 0.3) * pulse; // More opaque
    
    const gradient = ctx.createRadialGradient(
      x * width,
      y * height,
      0,
      x * width,
      y * height,
      r * Math.max(width, height)
    );
    
    const [cr, cg, cb] = hslToRgbValues(hue, saturation, lightness);
    gradient.addColorStop(0, `rgba(${cr}, ${cg}, ${cb}, ${alpha})`);
    gradient.addColorStop(0.5, `rgba(${cr}, ${cg}, ${cb}, ${alpha * 0.4})`);
    gradient.addColorStop(1, 'transparent');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
  }
  
  // Base gradient - drawn LAST so it appears BEHIND nebula blobs
  // Shifts angle based on camera position
  const gradientAngle = (offsetX * 0.001 + offsetY * 0.0005) % (Math.PI * 2);
  const gx1 = width / 2 + Math.cos(gradientAngle) * width;
  const gy1 = height / 2 + Math.sin(gradientAngle) * height;
  const gx2 = width / 2 - Math.cos(gradientAngle) * width;
  const gy2 = height / 2 - Math.sin(gradientAngle) * height;
  
  const baseGradient = ctx.createLinearGradient(gx1, gy1, gx2, gy2);
  
  // Shift base colors slightly based on position
  const hueShift = colorShift * 20 - 10; // -10 to +10 degree shift
  baseGradient.addColorStop(0, hslToRgb(270 + hueShift, 0.3, 0.07));
  baseGradient.addColorStop(0.3, hslToRgb(265 + hueShift, 0.35, 0.1));
  baseGradient.addColorStop(0.6, hslToRgb(275 + hueShift, 0.3, 0.05));
  baseGradient.addColorStop(1, hslToRgb(280 + hueShift, 0.25, 0.04));
  ctx.fillStyle = baseGradient;
  ctx.fillRect(0, 0, width, height);
}

// Convert HSL to RGB string
function hslToRgb(h: number, s: number, l: number): string {
  const [r, g, b] = hslToRgbValues(h, s, l);
  return `rgb(${r}, ${g}, ${b})`;
}

// Convert HSL to RGB values
function hslToRgbValues(h: number, s: number, l: number): [number, number, number] {
  h = ((h % 360) + 360) % 360;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs((h / 60) % 2 - 1));
  const m = l - c / 2;
  
  let r = 0, g = 0, b = 0;
  if (h < 60) { r = c; g = x; b = 0; }
  else if (h < 120) { r = x; g = c; b = 0; }
  else if (h < 180) { r = 0; g = c; b = x; }
  else if (h < 240) { r = 0; g = x; b = c; }
  else if (h < 300) { r = x; g = 0; b = c; }
  else { r = c; g = 0; b = x; }
  
  return [
    Math.round((r + m) * 255),
    Math.round((g + m) * 255),
    Math.round((b + m) * 255)
  ];
}

function drawStars(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  time: number,
  cameraX: number,
  cameraY: number
) {
  // Seed-based star generation for consistency
  const starLayers = [
    { count: 50, sizeMin: 0.5, sizeMax: 1.5, parallax: 0.02, alpha: 0.6 },
    { count: 30, sizeMin: 1, sizeMax: 2.5, parallax: 0.05, alpha: 0.8 },
    { count: 15, sizeMin: 2, sizeMax: 3.5, parallax: 0.1, alpha: 1 },
  ];

  const twinkle = 0.7 + Math.sin(time * 0.003) * 0.3;

  for (const layer of starLayers) {
    // Use deterministic positions based on layer
    const seed = layer.count * 1000;
    for (let i = 0; i < layer.count; i++) {
      const pseudoRandX = ((seed + i * 7919) % 1000) / 1000;
      const pseudoRandY = ((seed + i * 104729) % 1000) / 1000;
      const pseudoRandSize = ((seed + i * 15485863) % 1000) / 1000;
      const pseudoRandBlink = ((seed + i * 32452843) % 1000) / 1000;

      let x = pseudoRandX * width + cameraX * layer.parallax;
      let y = pseudoRandY * height + cameraY * layer.parallax;

      // Wrap stars around the screen
      x = ((x % width) + width) % width;
      y = ((y % height) + height) % height;

      const size = layer.sizeMin + pseudoRandSize * (layer.sizeMax - layer.sizeMin);
      const blinkOffset = pseudoRandBlink * Math.PI * 2;
      const alpha = layer.alpha * (0.5 + 0.5 * Math.sin(time * 0.002 + blinkOffset)) * twinkle;

      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
      ctx.fill();
    }
  }
}

function drawWorldGrid(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  cameraX: number,
  cameraY: number
) {
  const gridSize = 100;
  // World-fixed grid: moves 1:1 with camera (stays fixed to world 0,0)
  const gridOffsetX = (-cameraX) % gridSize;
  const gridOffsetY = (-cameraY) % gridSize;
  
  const gridAlpha = 0.25;

  // Use a different color (orange/yellow) to distinguish from parallax grid
  ctx.strokeStyle = `rgba(255, 180, 80, ${gridAlpha})`;
  ctx.lineWidth = 1.5;

  for (let x = -gridSize + gridOffsetX; x < width + gridSize; x += gridSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }

  for (let y = -gridSize + gridOffsetY; y < height + gridSize; y += gridSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  // Grid intersection dots
  ctx.fillStyle = `rgba(255, 180, 80, ${gridAlpha * 2})`;
  for (let x = -gridSize + gridOffsetX; x < width + gridSize; x += gridSize) {
    for (let y = -gridSize + gridOffsetY; y < height + gridSize; y += gridSize) {
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

function drawGrid(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  time: number,
  cameraX: number,
  cameraY: number
) {
  const gridSize = 80;
  // Parallax factor - grid moves slower than camera for depth effect
  const parallaxFactor = 0.3;
  const gridOffsetX = (-cameraX * parallaxFactor) % gridSize;
  const gridOffsetY = (-cameraY * parallaxFactor) % gridSize;
  
  // More visible grid for testing parallax
  const gridAlpha = 0.15;

  ctx.strokeStyle = `rgba(140, 180, 255, ${gridAlpha})`;
  ctx.lineWidth = 1;

  for (let x = -gridSize + gridOffsetX; x < width + gridSize; x += gridSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }

  for (let y = -gridSize + gridOffsetY; y < height + gridSize; y += gridSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  // Grid intersection dots - more visible
  ctx.fillStyle = `rgba(140, 180, 255, ${gridAlpha * 2})`;
  for (let x = -gridSize + gridOffsetX; x < width + gridSize; x += gridSize) {
    for (let y = -gridSize + gridOffsetY; y < height + gridSize; y += gridSize) {
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

function drawVignette(ctx: CanvasRenderingContext2D, width: number, height: number) {
  const gradient = ctx.createRadialGradient(
    width / 2,
    height / 2,
    0,
    width / 2,
    height / 2,
    Math.max(width, height) * 0.7
  );
  gradient.addColorStop(0, 'transparent');
  gradient.addColorStop(0.5, 'transparent');
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0.4)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
}
