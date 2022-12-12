import {Render} from "matter-js";
import Camera from "./rendering/Camera";
import {Controller} from "./types";
import {resizeBoundsAroundCenter} from "./common/bounds";

/**
 * Scales the canvas to fit the browser window and match the device pixel ratio
 */
export const browserWindowController = ({render, camera}: {
  render: Render;
  camera: Camera;
}): Controller => {

  const updateRendererSize = () => {
    render.options = {
      ...render.options,
      width:  window.innerWidth,
      height: window.innerHeight,
    };
    render.bounds  = resizeBoundsAroundCenter(
      render.bounds,
      window.innerWidth,
      window.innerHeight
    );
    // `setPixelRatio` will have the renderer update the canvas, so this is a nice work-around
    Render.setPixelRatio(render, 1);
    camera.updateBounds();
  };

  updateRendererSize();

  window.addEventListener('resize', updateRendererSize);

  const destroy = () => {
    window.removeEventListener('resize', updateRendererSize);
  };

  return {
    destroy,
  };
}