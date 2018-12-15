import {find} from 'lodash';

class ItemType {

    constructor({name, color, availableIntents = []}) {
        this.name             = name;
        this.color            = color;
        this.availableIntents = availableIntents;
    }

    getBuildIntent() {
        return find(this.availableIntents, {name: 'build'});
    }
}

export default ItemType;