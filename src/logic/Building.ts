import Matter from "matter-js";

import Buildable from "./Buildable";

export default class Building {

  public readonly buildable: Buildable;
  public readonly body: Matter.Body;

  constructor({buildable, body}: {
    buildable: Buildable,
    body: Matter.Body,
  }) {
    this.buildable = buildable;
    this.body      = body;
  }
}