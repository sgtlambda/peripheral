import Character, {CharacterConstructorProps} from "./Character";

export class NPC extends Character {

  public readonly name: string;

  constructor(
    {
      name,
      ...props
    }: CharacterConstructorProps & {
      name: string,
    }) {
    super(props);
    this.name = name;
  }
}