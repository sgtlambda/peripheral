import {find} from 'lodash';

class ItemType {

    constructor({name, color, availableIntents = [], droppable = true}) {
        this.name             = name;
        this.color            = color;
        this.availableIntents = availableIntents;
        this.droppable        = droppable;
    }

    getIntentByType(type) {
        return find(this.availableIntents, {type});
    }

    getPrimaryIntent() {
        return find(this.availableIntents, {primary: true});
    }
}

export default ItemType;