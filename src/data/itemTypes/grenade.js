import ItemType from '../../logic/ItemType';

import throwIntent from '../intents/throwIntent';

import armedGrenade from '../throwables/grenadeThrowable';

export default new ItemType({
    name:             'grenade',
    color:            '#666',
    availableIntents: [
        throwIntent({
            throwable: {
                name: 'grenade',
                make: armedGrenade,
            },
        }),
    ],
});