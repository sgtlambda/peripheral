import React, {useEffect, useMemo, useState} from "react";
import {explosionTest} from "../common/explosionWorkInProgressStuff";

export const Default = () => {

  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  const [time, setTime] = useState(0);

  const generateExplosionVertices = useMemo(() => {
    return explosionTest();
  }, []);

  const explosionVertices = useMemo(() => {
    return generateExplosionVertices(time);
  }, [time, generateExplosionVertices]);


  useEffect(() => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;

    // Clear and set background
    ctx.clearRect(0, 0, 500, 500);
    ctx.fillStyle = 'rgb(20,20,20)';
    ctx.fillRect(0, 0, 500, 500);

    // Create a separate temporary canvas for our shape with holes
    const tempCanvas  = document.createElement('canvas');
    tempCanvas.width  = 500;
    tempCanvas.height = 500;
    const tempCtx     = tempCanvas.getContext('2d');

    if (!tempCtx) return;

    // Draw main shape (first path) on temp canvas
    if (explosionVertices.length > 0 && explosionVertices[0].length > 0) {
      const mainPath = explosionVertices[0];

      tempCtx.fillStyle = 'white';
      tempCtx.beginPath();
      tempCtx.moveTo(mainPath[0].x, mainPath[0].y);
      for (let i = 1; i < mainPath.length; i++) {
        tempCtx.lineTo(mainPath[i].x, mainPath[i].y);
      }
      tempCtx.closePath();
      tempCtx.fill();

      // Now cut holes with remaining paths
      tempCtx.globalCompositeOperation = "destination-out";

      for (let pathIndex = 1; pathIndex < explosionVertices.length; pathIndex++) {
        const path = explosionVertices[pathIndex];
        if (!path.length) continue;

        tempCtx.beginPath();
        tempCtx.moveTo(path[0].x, path[0].y);
        for (let i = 1; i < path.length; i++) {
          tempCtx.lineTo(path[i].x, path[i].y);
        }
        tempCtx.closePath();
        tempCtx.fill();
      }

      tempCtx.globalCompositeOperation = "source-over";

      ctx.drawImage(tempCanvas, 0, 0);

      // TODO figure out how to do this without the temp canvas
    }
  }, [explosionVertices]);

  return <div>
    <input
      type={"range"}
      min={0}
      max={2}
      step={0.01}
      value={time}
      onChange={(e) => {
        setTime(parseFloat(e.target.value));
      }}
      style={{display: 'block', width: 500}}
    />
    <canvas
      ref={canvasRef}
      width={500}
      height={500}
      style={{border: '1px solid black'}}
    />
  </div>;
};