import {find} from 'lodash';

import {ItemIntent} from "./ItemIntent";

class ItemType {

  public readonly name: string;
  public readonly color: string;
  public readonly availableIntents: ItemIntent<any>[];
  public readonly droppable: boolean;

  constructor({name, color, availableIntents = [], droppable = true}: {
    name: string;
    color: string;
    availableIntents?: any[];
    droppable?: boolean;
  }) {
    this.name             = name;
    this.color            = color;
    this.availableIntents = availableIntents;
    this.droppable        = droppable;
  }

  getIntentByType<IntentOptions>(type: Symbol): ItemIntent<IntentOptions> | undefined {
    return find(this.availableIntents, {type});
  }

  getPrimaryIntent() {
    return find(this.availableIntents, {primary: true});
  }
}

export default ItemType;