export default ({
    mouseEmitter = window,
    emitter = document,
    interactionHandler,
    keyMap = {
        // The values here map to methods in the InteractionHandler class
        q: 'dropItem',
        b: 'buildItem',
    },
} = {}) => {

    const keysOn = {};

    const press = e => {
        const method = keyMap[e.key];
        if (method && interactionHandler[method])
            interactionHandler[method].call(interactionHandler);
    };

    const mouseDown = () => {
        interactionHandler.triggerPrimary();
    };

    emitter.addEventListener('keydown', press);

    mouseEmitter.addEventListener('mousedown', mouseDown);

    return {
        keysOn,
        destroy() {
            emitter.removeEventListener('keydown', press);
            mouseEmitter.removeEventListener('mousedown', mouseDown);
        },
    };
};