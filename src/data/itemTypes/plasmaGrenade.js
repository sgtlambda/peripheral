import ItemType from '../../logic/ItemType';

import throwIntent from '../intents/throwIntent';

import plasmaGrenadeThrowable from '../throwables/plasmaGrenadeThrowable';

export default new ItemType({
    name:             'plasma',
    color:            '#7597b8',
    availableIntents: [
        throwIntent({
            name: 'plasmaGrenade',
            make: plasmaGrenadeThrowable,
        }),
    ],
});