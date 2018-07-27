export default ({
    keyMap = {
        a: 'left',
        d: 'right',
        w: 'up',
    },
} = {}) => {

    const keysOn = {};

    const down = e => {
        if (e.key in keyMap) keysOn[keyMap[e.key]] = true;
    };
    const up   = e => {
        if (e.key in keyMap) keysOn[keyMap[e.key]] = false;
    };

    document.addEventListener('keydown', down);
    document.addEventListener('keyup', up);

    return {
        keysOn,
        destroy() {
            document.removeEventListener('keydown', down);
            document.removeEventListener('keyup', up);
        },
    };
};