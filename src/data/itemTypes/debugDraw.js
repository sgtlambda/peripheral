import ItemType from '../../logic/ItemType';

import debugDrawIntent from '../intents/debugDrawIntent';

export default new ItemType({
    name:             '~draw',
    color:            'black',
    droppable:        false,
    availableIntents: [
        debugDrawIntent(),
    ]
});