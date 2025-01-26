import {Render} from 'matter-js';

export default ({element, engine}) => {

    return Render.create({
        element,
        engine:  engine,
        options: {
            width:               900,
            height:              600,
            pixelRatio:          2,
            background:          'transparent',
            wireframeBackground: '#fff',
            hasBounds:           true,
            enabled:             true,
            wireframes:          true,
            showSleeping:        true,
            showDebug:           false,
            showBroadphase:      false,
            showBounds:          true,
            showVelocity:        true,
            showCollisions:      true,
            showSeparations:     true,
            showAxes:            true,
            showPositions:       true,
            showAngleIndicator:  false,
            showIds:             false,
            showShadows:         false,
            showVertexNumbers:   false,
            showConvexHulls:     true,
            showInternalEdges:   true,
            showMousePosition:   false,
        }
    });
};