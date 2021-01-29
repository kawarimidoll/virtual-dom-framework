// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ActionType<State> = (state: State, ...data: any) => void | any;

export interface ActionTree<State> {
  [action: string]: ActionType<State>;
}
