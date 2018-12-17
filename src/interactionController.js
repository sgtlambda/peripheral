export default ({
    mouseEmitter = window,
    emitter = document,
    interactionHandler,
    keyMap = {
        // The values here map to methods in the InteractionHandler class
        q: 'dropItem',
        b: 'buildItem',
        e: 'takeItem',
        t: 'throwItem',
    },
} = {}) => {

    const keysOn = {};

    const press = e => {
        const method = keyMap[e.key];
        if (method && interactionHandler[method])
            interactionHandler[method].call(interactionHandler);
    };

    let _triggerContinuous;

    const mouseDown = () => {
        interactionHandler.triggerPrimary();
        _triggerContinuous = setInterval(() => interactionHandler.triggerContinuous(), 200);
    };

    const mouseUp = () => {
        clearInterval(_triggerContinuous);
    };

    emitter.addEventListener('keydown', press);

    mouseEmitter.addEventListener('mousedown', mouseDown);
    mouseEmitter.addEventListener('mouseup', mouseUp);

    return {
        keysOn,
        destroy() {
            emitter.removeEventListener('keydown', press);
            mouseEmitter.removeEventListener('mousedown', mouseDown);
            mouseEmitter.removeEventListener('mouseup', mouseUp);
        },
    };
};