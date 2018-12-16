import ItemIntent from './../../logic/ItemIntent';

export const debugDrawGlobal = {path: []};

window.debugDrawGlobal = debugDrawGlobal;

export default ({
    name = 'debugDraw',
    primary = true,
} = {}) => new ItemIntent({
    primary, name,
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