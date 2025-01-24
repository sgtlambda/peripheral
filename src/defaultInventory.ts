import {createLaser} from "./data/itemTypes/laser";
import debugDraw from "./data/itemTypes/debugDraw";
import drill from "./data/itemTypes/drill";
import grenade from './data/itemTypes/grenade';
import nuke from './data/itemTypes/nuke';
import crate from './data/itemTypes/crate';
import {createGun} from "./data/itemTypes/gun";
import ItemType from "./logic/ItemType";

export const defaultInventory: {
  itemType: ItemType;
  amount?: number;
  slot?: number;
}[] = [
  {itemType: createLaser(400, 3)},
  {itemType: createGun(1000, 10)},
  {itemType: grenade, amount: 99},
  {itemType: nuke, amount: 99},
  {itemType: drill, amount: 800},
  {itemType: crate, amount: 800},
  {itemType: debugDraw, slot: 7},
];