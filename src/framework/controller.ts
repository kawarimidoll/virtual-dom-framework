import { View, VNode, updateElement, createElement, isEmptyNode } from "./view";
import { ActionTree } from "./action";

interface AppConstructor<State, Actions extends ActionTree<State>> {
  el: Element | string;
  view: View<State, Actions>;
  state: State;
  actions: Actions;
}

export class App<State, Actions extends ActionTree<State>> {
  private readonly el: Element;
  private readonly view: AppConstructor<State, Actions>["view"];
  private readonly state: AppConstructor<State, Actions>["state"];
  private readonly actions: AppConstructor<State, Actions>["actions"];

  private oldNode!: VNode;
  private newNode!: VNode;
  private skipRender!: boolean;

  constructor(params: AppConstructor<State, Actions>) {
    this.el =
      typeof params.el === "string"
        ? document.querySelector(params.el)
        : params.el;
    this.view = params.view;
    this.state = params.state;
    this.actions = this.dispatchAction(params.actions);
    this.resolveNode();
  }

  private dispatchAction(actions: Actions): Actions {
    return Object.keys(actions).reduce((dispatched, key) => {
      dispatched[key] = (state: State, ...data: any): any => {
        const ret = actions[key](state, ...data);
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
      updateElement(this.el as HTMLElement, this.oldNode, this.newNode);
    }

    this.oldNode = this.newNode;
    this.skipRender = false;
  }
}
