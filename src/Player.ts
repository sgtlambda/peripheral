import {Body, Vector} from 'matter-js';
import {KeysOn} from "./types";
import Character, {CharacterConstructorProps} from "./Character";

class Player extends Character {

  public aimAngle: number;
  public keys: KeysOn;
  public mouse: Vector;

  public readonly moveForce: number;
  public readonly jetpackForce: number;
  public readonly frictionWhileMoving: number;

  constructor(
    {
      keys, mouse,
      moveForce = .001,
      jetpackForce = .003,
      frictionWhileMoving = .0015,
      ...props
    }: CharacterConstructorProps & {
      keys: KeysOn,
      mouse: Vector,
      moveForce?: number,
      jetpackForce?: number,
      frictionWhileMoving?: number,
    }) {

    super(props);

    this.aimAngle = 0;

    // globals
    this.keys  = keys;
    this.mouse = mouse;

    // configuration
    this.moveForce           = moveForce;
    this.jetpackForce        = jetpackForce;
    this.frictionWhileMoving = frictionWhileMoving;
  }

  beforeStep() {

    // TODO should applied force be based on engine step delta?

    const xForce = (this.keys.left ? -this.moveForce : 0) + (this.keys.right ? this.moveForce : 0);
    const yForce = this.keys.up ? -this.jetpackForce : 0;

    this.collider.friction = this.keys.left || this.keys.right ? this.frictionWhileMoving : this.friction;

    Body.applyForce(this.collider, this.collider.position, {x: xForce, y: yForce});
  }

  afterStep() {
    this.aimAngle = Vector.angle(this.position, this.mouse);
  }

  getAimVector(size: number) {
    return Vector.rotate({x: size, y: 0}, this.aimAngle);
  }

  getAimPosition(offset: number) {
    return Vector.add(this.position, this.getAimVector(offset));
  }
}

export default Player;