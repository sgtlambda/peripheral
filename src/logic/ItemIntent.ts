import {ActionContext} from "../types";

export type ItemIntent<TOptions = {}> = {
  readonly keyBind?: string;
  readonly primary?: boolean;
  readonly continuous?: boolean;
  readonly trigger?: (ctx: ActionContext) => void;
  readonly type?: Symbol;
  readonly description?: string;
  readonly options: TOptions;
};
