// TODO apply this type to all controllers
export type Controller<Objects extends object = {}> = {
  destroy?: () => void;
} & Objects;