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
            showShadows:         false,
            showVertexNumbers:   false,
            showConvexHulls:     false,
            showInternalEdges:   false,
            showMousePosition:   false,

            // wireframes:          true,
            // showBounds:          true,
            // showVelocity:        true,
            // showCollisions:      true,
            // showSeparations:     true,
            // showAxes:            true,
            // showPositions:       true,
            // showConvexHulls:     true,
            // showInternalEdges:   true,
        }
    });
};