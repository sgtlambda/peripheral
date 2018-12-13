export default ({
    emitter = document,
    keyMap = {
        a: 'left',
        d: 'right',
        w: 'up',
        s: 'down',
    },
} = {}) => {

    const keysOn = {};

    const press = e => {
        if (e.key in keyMap) keysOn[keyMap[e.key]] = true;
    };

    const release = e => {
        if (e.key in keyMap) keysOn[keyMap[e.key]] = false;
    };

    emitter.addEventListener('keydown', press);
    emitter.addEventListener('keyup', release);

    return {
        keysOn,
        destroy() {
            emitter.removeEventListener('keydown', press);
            emitter.removeEventListener('keyup', release);
        },
    };
};