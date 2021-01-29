type NodeType = VNode | string | number;
type AttributeType = string | EventListener;
type Attributes = { [attr: string]: AttributeType };

export type VNode = {
  nodeName: keyof HTMLElementTagNameMap;
  attributes: Attributes;
  children: NodeType[];
};

const isVnode = (node: NodeType): node is VNode =>
  typeof node !== "string" && typeof node !== "number";

const isEventAttr = (attribute: string): boolean => /^on/.test(attribute);
const isEventListener = (
  attribute: string,
  value: AttributeType
): value is EventListener => isEventAttr(attribute) && value != "";

export interface View<State, Actions> {
  (state: State, actions: Actions): VNode;
}

export function h(
  nodeName: VNode["nodeName"],
  attributes: VNode["attributes"],
  ...children: VNode["children"]
): VNode {
  return { nodeName, attributes, children };
}

const setAttributes = (target: HTMLElement, attributes: Attributes): void => {
  Object.entries(attributes).forEach(([attr, value]) => {
    if (isEventListener(attr, value)) {
      // onxxxx -> xxxx
      const eventName = attr.slice(2);
      target.addEventListener(eventName, value);
    } else {
      target.setAttribute(attr, value);
    }
  });
};

const updateAttributes = (
  target: HTMLElement,
  oldAttrs: Attributes,
  newAttrs: Attributes
): void => {
  Object.keys(oldAttrs).forEach((attr) => {
    if (!isEventAttr(attr)) {
      target.removeAttribute(attr);
    }
  });
  Object.entries(newAttrs).forEach(([attr, value]) => {
    if (!isEventListener(attr, value)) {
      target.setAttribute(attr, value);
    }
  });
};

const updateValue = (target: HTMLInputElement, newValue: string): void => {
  target.value = newValue;
};

enum ChangedType {
  None,
  Type,
  Text,
  Node,
  Value,
  Attr,
}

const hasChanged = (a: NodeType, b: NodeType): ChangedType => {
  if (typeof a !== typeof b) {
    return ChangedType.Type;
  }

  if (!isVnode(a) && a !== b) {
    return ChangedType.Text;
  }

  if (isVnode(a) && isVnode(b)) {
    if (a.nodeName !== b.nodeName) {
      return ChangedType.Node;
    }

    if (a.attributes.value !== b.attributes.value) {
      return ChangedType.Value;
    }

    if (
      JSON.stringify(Object.entries(a.attributes).sort()) !==
      JSON.stringify(Object.entries(b.attributes).sort())
    ) {
      return ChangedType.Attr;
    }
  }

  return ChangedType.None;
};

export function createElement(node: NodeType): HTMLElement | Text {
  if (!isVnode(node)) {
    // string or number
    return document.createTextNode(node.toString());
  }

  const el = document.createElement(node.nodeName);
  setAttributes(el, node.attributes);
  node.children.forEach((child) => el.appendChild(createElement(child)));

  return el;
}

export function isEmptyNode(node: NodeType): boolean {
  return typeof node !== "number" && !node;
}

export function updateElement(
  parent: HTMLElement,
  oldNode: NodeType,
  newNode: NodeType,
  index = 0
): void {
  if (isEmptyNode(oldNode)) {
    parent.appendChild(createElement(newNode));
    return;
  }

  const target = parent.childNodes[index];
  if (isEmptyNode(newNode)) {
    parent.removeChild(target);
    return;
  }

  const changeType = hasChanged(oldNode, newNode);
  switch (changeType) {
    case ChangedType.Type:
    case ChangedType.Text:
    case ChangedType.Node:
      parent.replaceChild(createElement(newNode), target);
      return;
    case ChangedType.Value:
      updateValue(
        target as HTMLInputElement,
        (newNode as VNode).attributes.value as string
      );
      return;
    case ChangedType.Attr:
      updateAttributes(
        target as HTMLElement,
        (oldNode as VNode).attributes,
        (newNode as VNode).attributes
      );
      return;
  }

  if (isVnode(oldNode) && isVnode(newNode)) {
    for (
      let i = 0;
      i < newNode.children.length || i < oldNode.children.length;
      i++
    ) {
      updateElement(
        target as HTMLElement,
        oldNode.children[i],
        newNode.children[i],
        i
      );
    }
  }
}
