export default ({
    emitter = document,
    interactionHandler,
    keyMap = {
        q: 'drop',
    },
} = {}) => {

    const keysOn = {};

    const press = e => {
        if (keyMap[e.key] === 'drop') {
            interactionHandler.dropItem();
        }
    };

    emitter.addEventListener('keydown', press);

    return {
        keysOn,
        destroy() {
            emitter.removeEventListener('keydown', press);
        },
    };
};