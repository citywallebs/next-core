import { uniqueId } from "lodash";
import { RuntimeBrick } from "../BrickNode";
import { StoryboardContextWrapper } from "../StoryboardContext";

const tplContextMap = new Map<string, CustomTemplateContext>();

export class CustomTemplateContext {
  private variables: Record<string, unknown>;
  readonly state: StoryboardContextWrapper;
  readonly id = uniqueId("tpl-ctx-");

  constructor(private brick: RuntimeBrick) {
    tplContextMap.set(this.id, this);
    this.state = new StoryboardContextWrapper(this.id);
    brick.tplContextId = this.id;
  }

  setVariables(variables: Record<string, unknown>): void {
    this.variables = variables;
    Object.freeze(variables);
  }

  getVariables(): Record<string, unknown> {
    const { element } = this.brick;
    if (element) {
      return Object.fromEntries(
        Object.keys(this.variables).map((prop) => [
          prop,
          (element as any)[prop],
        ])
      );
    }
    return this.variables;
  }

  getBrick(): RuntimeBrick {
    return this.brick;
  }
}

export function getCustomTemplateContext(
  tplContextId: string
): CustomTemplateContext {
  return tplContextMap.get(tplContextId);
}
