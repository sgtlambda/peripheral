import ItemIntent from './../../logic/ItemIntent';

export const debugDrawGlobal = {path: []};
window.debugDrawGlobal       = debugDrawGlobal;

export const INTENT_DEBUG_DRAW = Symbol('INTENT_DEBUG_DRAW');

export default ({
    primary = true,
} = {}) => new ItemIntent({
    primary,
    type:        INTENT_DEBUG_DRAW,
    description: `draw [lmb]`,
    trigger({gameMouse}) {
        debugDrawGlobal.path.push({
            x: Math.round(gameMouse.x * 10) / 10,
            y: Math.round(gameMouse.y * 10) / 10,
        });
        console.log(JSON.stringify(debugDrawGlobal.path));
        // element.value = JSON.stringify(debugDrawGlobal.path);
    }
});