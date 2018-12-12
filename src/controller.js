export default ({
    keyMap = {
        a: 'left',
        d: 'right',
        w: 'up',
        s: 'down',
    },
} = {}) => {

    const keysOn = {};

    const press   = e => {
        if (e.key in keyMap) keysOn[keyMap[e.key]] = true;
    };
    const release = e => {
        if (e.key in keyMap) keysOn[keyMap[e.key]] = false;
    };

    document.addEventListener('keydown', press);
    document.addEventListener('keyup', release);

    return {
        keysOn,
        destroy() {
            document.removeEventListener('keydown', press);
            document.removeEventListener('keyup', release);
        },
    };
};