import React, { useEffect, useRef, useState } from "react";

/**
 * Isolated test story for the background layer rendering.
 * This helps debug why the programmatic background isn't showing up.
 */
export const Default: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();
  const [isPlaying, setIsPlaying] = useState(true);
  const [cameraX, setCameraX] = useState(0);
  const [cameraY, setCameraY] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let startTime = performance.now();
    let lastShootingStarTime = 0;
    let shootingStars: {
      startX: number;
      startY: number;
      endX: number;
      endY: number;
      progress: number;
      speed: number;
    }[] = [];

    const render = () => {
      const now = performance.now();
      const time = now - startTime;
      const width = canvas.width;
      const height = canvas.height;

      // Clear canvas
      ctx.clearRect(0, 0, width, height);

      // Draw nebula background (mimic CSS gradients)
      drawNebulaBackground(ctx, width, height, time);

      // Draw stars
      drawStars(ctx, width, height, time, cameraX, cameraY);

      // Draw shooting stars
      if (time - lastShootingStarTime > 3000 + Math.random() * 5000) {
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

      shootingStars = shootingStars.filter((star) => {
        star.progress += star.speed * 16;
        if (star.progress > 1) return false;

        const currentX = star.startX + (star.endX - star.startX) * star.progress;
        const currentY = star.startY + (star.endY - star.startY) * star.progress;
        const trailProgress = Math.max(0, star.progress - 0.2);
        const trailX = star.startX + (star.endX - star.startX) * trailProgress;
        const trailY = star.startY + (star.endY - star.startY) * trailProgress;

        const alpha =
          star.progress < 0.1
            ? star.progress * 10
            : star.progress > 0.85
            ? (1 - star.progress) / 0.15
            : 1;

        const gradient = ctx.createLinearGradient(trailX, trailY, currentX, currentY);
        gradient.addColorStop(0, "rgba(255, 255, 255, 0)");
        gradient.addColorStop(0.7, `rgba(200, 220, 255, ${alpha * 0.5})`);
        gradient.addColorStop(1, `rgba(255, 255, 255, ${alpha})`);

        ctx.strokeStyle = gradient;
        ctx.lineWidth = 2;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(trailX, trailY);
        ctx.lineTo(currentX, currentY);
        ctx.stroke();

        return true;
      });

      // Draw grid overlay (parallax with camera)
      drawGrid(ctx, width, height, time, cameraX, cameraY);

      // Draw vignette
      drawVignette(ctx, width, height);

      if (isPlaying) {
        animationFrameRef.current = requestAnimationFrame(render);
      }
    };

    render();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, cameraX, cameraY]);

  return (
    <div style={{ padding: "20px", fontFamily: "sans-serif", background: "#1a1a2e" }}>
      <h3 style={{ color: "#fff" }}>Background Layer Test</h3>

      <div style={{ marginBottom: "20px", display: "flex", gap: "20px", color: "#ccc" }}>
        <button onClick={() => setIsPlaying(!isPlaying)}>
          {isPlaying ? "Pause" : "Play"}
        </button>
        <div>
          <label>Camera X: {cameraX}</label>
          <input
            type="range"
            min={-500}
            max={500}
            value={cameraX}
            onChange={(e) => setCameraX(parseInt(e.target.value))}
            style={{ marginLeft: "10px" }}
          />
        </div>
        <div>
          <label>Camera Y: {cameraY}</label>
          <input
            type="range"
            min={-500}
            max={500}
            value={cameraY}
            onChange={(e) => setCameraY(parseInt(e.target.value))}
            style={{ marginLeft: "10px" }}
          />
        </div>
      </div>

      <canvas
        ref={canvasRef}
        width={900}
        height={600}
        style={{ border: "1px solid #333", display: "block" }}
      />
    </div>
  );
};

function drawNebulaBackground(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  time: number
) {
  // Base gradient
  const baseGradient = ctx.createLinearGradient(0, 0, width, height);
  baseGradient.addColorStop(0, "#0e0a1a");
  baseGradient.addColorStop(0.3, "#150d2a");
  baseGradient.addColorStop(0.6, "#0d0820");
  baseGradient.addColorStop(1, "#080515");
  ctx.fillStyle = baseGradient;
  ctx.fillRect(0, 0, width, height);

  // Pulsing brightness factor
  const pulse = 1 + Math.sin(time * 0.0008) * 0.1;

  // Nebula blobs
  const nebulaColors = [
    { x: 0.25, y: 0.15, r: 0.45, color: [160, 80, 220, 0.55 * pulse] },
    { x: 0.75, y: 0.65, r: 0.5, color: [80, 120, 200, 0.45 * pulse] },
    { x: 0.5, y: 0.9, r: 0.45, color: [140, 60, 160, 0.4 * pulse] },
    { x: 0.9, y: 0.2, r: 0.4, color: [180, 100, 240, 0.35 * pulse] },
    { x: 0.1, y: 0.75, r: 0.35, color: [100, 80, 180, 0.3 * pulse] },
    { x: 0.6, y: 0.4, r: 0.5, color: [60, 80, 140, 0.2 * pulse] },
  ];

  for (const nebula of nebulaColors) {
    const gradient = ctx.createRadialGradient(
      nebula.x * width,
      nebula.y * height,
      0,
      nebula.x * width,
      nebula.y * height,
      nebula.r * Math.max(width, height)
    );
    const [r, g, b, a] = nebula.color;
    gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${a})`);
    gradient.addColorStop(1, "transparent");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
  }
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

      const size =
        layer.sizeMin + pseudoRandSize * (layer.sizeMax - layer.sizeMin);
      const blinkOffset = pseudoRandBlink * Math.PI * 2;
      const alpha =
        layer.alpha * (0.5 + 0.5 * Math.sin(time * 0.002 + blinkOffset)) * twinkle;

      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
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
  const gridSize = 120;
  const gridOffsetX = (cameraX * 0.08) % gridSize;
  const gridOffsetY = (cameraY * 0.08) % gridSize;
  const gridAlpha = 0.025 + Math.sin(time * 0.0006) * 0.008;

  ctx.strokeStyle = `rgba(140, 180, 255, ${gridAlpha})`;
  ctx.lineWidth = 0.5;

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
  ctx.fillStyle = `rgba(140, 180, 255, ${gridAlpha * 1.5})`;
  for (let x = -gridSize + gridOffsetX; x < width + gridSize; x += gridSize) {
    for (let y = -gridSize + gridOffsetY; y < height + gridSize; y += gridSize) {
      ctx.beginPath();
      ctx.arc(x, y, 1, 0, Math.PI * 2);
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
  gradient.addColorStop(0, "transparent");
  gradient.addColorStop(0.5, "transparent");
  gradient.addColorStop(1, "rgba(0, 0, 0, 0.4)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
}

