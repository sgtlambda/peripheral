export const debugDrawGlobal = {path: []};
window.debugDrawGlobal       = debugDrawGlobal;

export const INTENT_DEBUG_DRAW = Symbol('INTENT_DEBUG_DRAW');

export default ({
    primary = true,
} = {}) => ({
    primary,
    type:        INTENT_DEBUG_DRAW,
    description: 'draw [lmb]',
    trigger(a) {
        const gameMouse = a.player.mouse;
        debugDrawGlobal.path.push({
            x: Math.round(gameMouse.x * 10) / 10,
            y: Math.round(gameMouse.y * 10) / 10,
        });
    }
});