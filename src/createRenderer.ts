import {Engine, IRendererOptions, Render} from 'matter-js';

export default ({element, engine}: {
  element: HTMLElement;
  engine: Engine;
}): Render => {

  const options: IRendererOptions = {
    width:               900,
    height:              600,
    pixelRatio:          2,
    background:          'transparent',
    wireframeBackground: '#fff',
    hasBounds:           true,
    wireframes:          false,
    showSleeping:        true,
    showDebug:           false,
    showBroadphase:      false,
    showBounds:          false,
    showVelocity:        false,
    showCollisions:      false,
    showSeparations:     false,
    showAxes:            false,
    showPositions:       false,
    showAngleIndicator:  false,
    showIds:             false,
    showVertexNumbers:   false,
    showConvexHulls:     false,
    showInternalEdges:   false,
    showMousePosition:   false,
  };

  return Render.create({
    element,
    engine,
    options,
  });
};
