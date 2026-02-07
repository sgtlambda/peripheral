import {Body, Vector} from 'matter-js';
import {KeysOn} from "./types";
import Character, {CharacterConstructorProps} from "./Character";
import getTotalPlanetaryForce from './common/getTotalPlanetaryForce';

class Player extends Character {

  public aimAngle: number;
  public keys: KeysOn;
  public mouse: Vector;

  private gravityForce: Vector;
  private lastSurfaceAngle: number;

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

    // Initialize gravity tracking
    this.gravityForce = {x: 0, y: 0};
    this.lastSurfaceAngle = -Math.PI / 2; // Default to "down"
  }

  get surfaceAngle() {
    // Calculate surface angle based on gravity direction
    if (this.gravityForce && Vector.magnitude(this.gravityForce) > 5e-4) {
      this.lastSurfaceAngle = Vector.angle(this.gravityForce, {x: 0, y: 0});
    }
    return this.lastSurfaceAngle;
  }

  rotateVectorToSurface(point: Vector): Vector {
    const angle = this.surfaceAngle + Math.PI / 2;
    return Vector.rotate(point, angle);
  }

  beforeStep() {

    // TODO should applied force be based on engine step delta?

    const xForce = (this.keys.left ? -this.moveForce : 0) + (this.keys.right ? this.moveForce : 0);
    const yForce = this.keys.up ? -this.jetpackForce : 0;

    this.collider.friction = this.keys.left || this.keys.right ? this.frictionWhileMoving : this.friction;

    // Apply force relative to surface orientation
    const force = this.rotateVectorToSurface({x: xForce, y: yForce});
    Body.applyForce(this.collider, this.collider.position, force);
  }

  afterStep() {
    this.aimAngle = Vector.angle(this.position, this.mouse);
    this.gravityForce = getTotalPlanetaryForce(this.stage.planets, this.collider);
  }

  getAimVector(size: number) {
    return Vector.rotate({x: size, y: 0}, this.aimAngle);
  }

  getAimPosition(offset: number) {
    return Vector.add(this.position, this.getAimVector(offset));
  }
}

export default Player;