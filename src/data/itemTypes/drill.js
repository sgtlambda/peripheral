import ItemType from '../../logic/ItemType';

import throwIntent from '../intents/throwIntent';

import drillThrowable from '../throwables/drillThrowable';

export default new ItemType({
    name:             'drill',
    color:            '#b8866e',
    availableIntents: [
        throwIntent({
            continuous:           true,
            name:                 'drill',
            make:                 drillThrowable,
            throwableSpawnOffset: 20,
        }),
    ],
});