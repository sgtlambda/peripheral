import ItemType from '../../logic/ItemType';

import buildIntent from '../intents/buildIntent';

import crate from './../buildables/crate';

export default new ItemType({
    name:             'log',
    color:            '#9c8051',
    availableIntents: [
        buildIntent({
            buildable: crate,
            requires:  2,
        }),
    ],
});