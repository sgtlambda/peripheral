import ItemType from '../../logic/ItemType';

import debugDrawIntent from '../intents/debugDrawIntent';

export default new ItemType({
    name:      'debugDraw',
    color:     'black',
    droppable: false,
    availableIntents: [
        debugDrawIntent(),
    ]
});