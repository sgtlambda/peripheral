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
            showDebug:           true,
            showBroadphase:      false,
            showBounds:          true,
            showVelocity:        false,
            showCollisions:      false,
            showSeparations:     true,
            showAxes:            false,
            showPositions:       true,
            showAngleIndicator:  true,
            showIds:             true,
            showShadows:         false,
            showVertexNumbers:   false,
            showConvexHulls:     true,
            showInternalEdges:   true,
            showMousePosition:   false,
        }
    });
};