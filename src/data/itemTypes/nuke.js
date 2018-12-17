import ItemType from '../../logic/ItemType';

import throwIntent from '../intents/throwIntent';

import nukeThrowable from '../throwables/nukeThrowable';

export default new ItemType({
    name:             'nuke',
    color:            '#7597b8',
    availableIntents: [
        throwIntent({
            throwable: {
                name: 'nuke',
                make: nukeThrowable,
            },
        }),
    ],
});