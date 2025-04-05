import React, {useEffect, useMemo, useRef, useState} from "react";
import {generateAnimatedExplosion} from "../common/explosion";
import {renderExplosion} from "../common/renderExplosion";

export const Default = () => {

  const canvasRef         = React.useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();

  const [time, setTime]           = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const explosionGenerator = useMemo(() => {
    return generateAnimatedExplosion({
      radius:         100,
      resolution:     30,
      radiusRand:     0.25,
      gapCount:       12,
      swirlIntensity: 0.5 * Math.PI,
      swirlRadius:    100
    });
  }, []);

  const explosionVertices = useMemo(() => {
    return explosionGenerator.generate(time);
  }, [time, explosionGenerator]);

  useEffect(() => {
    if (!isPlaying) return;

    let lastTime         = performance.now();
    const animationSpeed = 0.5; // Hz
    const period         = 1000 / animationSpeed; // ms

    const animate = (currentTime: number) => {
      const deltaTime = currentTime - lastTime;
      lastTime        = currentTime;

      setTime(prevTime => (prevTime + deltaTime / period) % 1);

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying]);

  useEffect(() => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;

    // Clear and set background
    ctx.clearRect(0, 0, 500, 500);
    ctx.fillStyle = 'rgb(20,20,20)';
    ctx.fillRect(0, 0, 500, 500);

    // Render the explosion
    renderExplosion(ctx, explosionVertices, {
      fillStyle: 'white',
      centerX:   250,
      centerY:   250,
    });
  }, [explosionVertices]);

  return <div>
    <div style={{display: 'flex', gap: '10px', marginBottom: '10px'}}>
      <button onClick={() => setIsPlaying(!isPlaying)}>
        {isPlaying ? 'Pause' : 'Play'}
      </button>
      <input
        type={"range"}
        min={0}
        max={1}
        step={0.01}
        value={time}
        onChange={(e) => {
          setTime(parseFloat(e.target.value));
        }}
        style={{flex: 1}}
      />
    </div>
    <canvas
      ref={canvasRef}
      width={500}
      height={500}
      style={{border: '1px solid black'}}
    />
  </div>;
};