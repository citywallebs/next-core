import { bindListeners } from "@easyops/brick-utils";
import { BrickNode, RuntimeBrick } from "./BrickNode";

jest.mock("@easyops/brick-utils");
const spyOnBindListeners = bindListeners as jest.Mock;

describe("BrickNode", () => {
  it("should mount simple brick", () => {
    const runtimeBrick: RuntimeBrick = {
      type: "div",
      properties: {
        title: "good"
      },
      events: {
        click: () => {}
      }
    };
    const brickNode = new BrickNode(runtimeBrick);
    const node = brickNode.mount();
    expect(node.nodeName).toBe("DIV");
    expect(node.getAttribute("slot")).toBe(null);
    // expect(node.title).toBe("good");
    expect(node.childNodes.length).toBe(0);
    const callArgs = spyOnBindListeners.mock.calls[0];
    expect(callArgs[0]).toBe(node);
    expect(callArgs[1]).toBe(runtimeBrick.events);
  });

  it("should mount slotted brick", () => {
    const runtimeBrick: RuntimeBrick = {
      type: "div",
      properties: {},
      events: {},
      children: [
        {
          type: "p",
          properties: {
            title: "better"
          },
          events: {},
          children: [],
          slotId: "content"
        }
      ]
    };
    const brickNode = new BrickNode(runtimeBrick);
    const node = brickNode.mount();
    expect(node.getAttribute("slot")).toBe(null);
    expect(node.childNodes.length).toBe(1);
    expect(node.firstChild.nodeName).toBe("P");
    // expect((node.firstChild as HTMLElement).title).toBe("better");
    expect((node.firstChild as HTMLElement).getAttribute("slot")).toBe(
      "content"
    );
  });

  it("should unmount", () => {
    const runtimeBrick: RuntimeBrick = {
      type: "div",
      properties: {},
      events: {},
      children: [
        {
          type: "p",
          properties: {
            title: "better"
          },
          events: {},
          children: [],
          slotId: "content"
        }
      ]
    };
    const brickNode = new BrickNode(runtimeBrick);
    const node = brickNode.mount();
    expect(node.childNodes.length).toBe(1);
    brickNode.unmount();
    // Currently nothing happened.
    expect(node.childNodes.length).toBe(1);
  });
});
