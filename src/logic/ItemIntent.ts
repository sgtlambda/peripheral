import InteractionHandler from "./InteractionHandler";

export type ItemIntent<TOptions = {}> = {
  readonly keyBind?: string;
  readonly primary?: boolean;
  readonly continuous?: boolean;
  readonly trigger?: (interactionHandler: InteractionHandler) => void;
  readonly type?: Symbol;
  readonly description?: string;
  readonly options: TOptions;
};
