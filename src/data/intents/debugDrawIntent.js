import ItemIntent from './../../logic/ItemIntent';

export const debugDrawGlobal = window.debugDrawGlobal ? window.debugDrawGlobal : {path: []};
window.debugDrawGlobal       = debugDrawGlobal;

const element                 = document.createElement('textarea');

element.style.top             = '0px';
element.style.right           = '0px';
element.style.position        = 'absolute';
element.style.height          = '600px';
element.style.width           = '200px';
element.style.backgroundColor = 'transparent';
element.style.color           = 'white';
element.style.border          = 'none';
element.style.font            = '10px monospace';

setTimeout(() => {
    if (debugDrawGlobal.element)
        document.body.removeChild(debugDrawGlobal.element);
    debugDrawGlobal.element = element;
    document.body.appendChild(debugDrawGlobal.element);
    element.value = JSON.stringify(debugDrawGlobal.path);
}, 100);

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
        element.value = JSON.stringify(debugDrawGlobal.path);
    }
});