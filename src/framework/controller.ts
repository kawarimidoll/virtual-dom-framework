import { View, VNode, updateElement, createElement, isEmptyNode } from "./view";
import { ActionTree } from "./action";

interface AppConstructor<State, Actions extends ActionTree<State>> {
  el: HTMLElement | string;
  view: View<State, Actions>;
  state: State;
  actions: Actions;
}

export class App<State, Actions extends ActionTree<State>> {
  private readonly el: HTMLElement;
  private readonly view: AppConstructor<State, Actions>["view"];
  private readonly state: AppConstructor<State, Actions>["state"];
  private readonly actions: AppConstructor<State, Actions>["actions"];

  private oldNode!: VNode;
  private newNode!: VNode;
  private skipRender!: boolean;

  constructor(params: AppConstructor<State, Actions>) {
    if (typeof params.el === "string") {
      const el = document.querySelector<HTMLElement>(params.el);
      if (el == null) {
        throw new Error("target element not found");
      }
      this.el = el;
    } else {
      this.el = params.el;
    }
    this.view = params.view;
    this.state = params.state;
    this.actions = this.dispatchAction(params.actions);
    this.resolveNode();
  }

  private dispatchAction(actions: Actions): Actions {
    return Object.entries(actions).reduce((dispatched, [key, action]) => {
      dispatched[key] = (
        state: State,
        ...data: any
      ): ReturnType<typeof action> => {
        const ret = action(state, ...data);
        this.resolveNode();
        return ret;
      };
      return dispatched;
    }, {} as ActionTree<State>) as Actions;
  }

  private resolveNode(): void {
    this.newNode = this.view(this.state, this.actions);
    this.scheduleRender();
  }

  private scheduleRender(): void {
    if (!this.skipRender) {
      this.skipRender = true;
      setTimeout(this.render.bind(this));
    }
  }

  private render(): void {
    if (isEmptyNode(this.oldNode)) {
      this.el.appendChild(createElement(this.newNode));
    } else {
      updateElement(this.el, this.oldNode, this.newNode);
    }

    this.oldNode = this.newNode;
    this.skipRender = false;
  }
}
