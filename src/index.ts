import { ActionTree } from "./framework/action";
import { App } from "./framework/controller";
import { View, h } from "./framework/view";

type State = typeof state;
type Actions = typeof actions;

const state = { count: 0 };
const actions: ActionTree<State> = {
  increment: (state) => state.count++,
  decrement: (state) => state.count--,
  reset: (state) => (state.count = 0),
  show: (state) => console.log(state),
};

const view: View<State, Actions> = (state, actions) => {
  return h(
    "div",
    {},
    h("h1", {}, "Virtual DOM framework"),
    h("p", {}, state.count),
    h(
      "div",
      {},
      h(
        "button",
        {
          style: "margin:3px",
          type: "button",
          onclick: () => actions.increment(state),
        },
        "count up"
      ),
      h(
        "button",
        {
          style: "margin:3px",
          type: "button",
          onclick: () => actions.decrement(state),
        },
        "count down"
      ),
      h(
        "button",
        {
          style: "margin:3px",
          type: "button",
          onclick: () => actions.reset(state),
        },
        "reset"
      )
    ),
    h(
      "div",
      {},
      h(
        "button",
        {
          style: "margin:3px",
          type: "button",
          onclick: () => actions.show(state),
        },
        "console log"
      )
    )
  );
};

new App<State, Actions>({ el: "#app", state, view, actions });
