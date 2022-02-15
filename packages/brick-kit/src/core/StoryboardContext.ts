import EventTarget from "@ungap/event-target";
import {
  BrickEventHandler,
  ContextConf,
  PluginRuntimeContext,
  StoryboardContextItem,
  StoryboardContextItemFreeVariable,
} from "@next-core/brick-types";
import {
  hasOwnProperty,
  isObject,
  resolveContextConcurrently,
  syncResolveContextConcurrently,
} from "@next-core/brick-utils";
import { looseCheckIf } from "../checkIf";
import { listenerFactory } from "../internal/bindListeners";
import { computeRealValue } from "../internal/setProperties";
import { RuntimeBrick, _internalApiGetResolver } from "./exports";

export class StoryboardContextWrapper {
  private readonly data = new Map<string, StoryboardContextItem>();
  readonly tplContextId: string;

  constructor(tplContextId?: string) {
    this.tplContextId = tplContextId;
  }

  set(name: string, item: StoryboardContextItem): void {
    if (this.data.has(name)) {
      // eslint-disable-next-line no-console
      console.warn(
        `Storyboard context "${name}" have already existed, it will be replaced.`
      );
    }
    this.data.set(name, item);
  }

  get(): Map<string, StoryboardContextItem> {
    return this.data;
  }

  /** Get value of free-variable only. */
  getValue(name: string): unknown {
    return (this.data.get(name) as StoryboardContextItemFreeVariable)?.value;
  }

  updateValue(
    name: string,
    value: unknown,
    method: "assign" | "replace"
  ): void {
    if (!this.data.has(name)) {
      if (this.tplContextId) {
        throw new Error(`State not found: ${name}`);
      } else {
        // eslint-disable-next-line no-console
        console.warn(
          `Context "${name}" is not declared, we recommend declaring it first.`
        );
        this.set(name, {
          type: "free-variable",
          value,
        });
        return;
      }
    }

    const item = this.data.get(name) as StoryboardContextItemFreeVariable;
    if (item.type !== "free-variable") {
      // eslint-disable-next-line no-console
      console.error(
        `Conflict storyboard context "${name}", expected "free-variable", received "${item.type}".`
      );
      return;
    }

    if (method === "replace") {
      item.value = value;
    } else {
      if (isObject(item.value)) {
        Object.assign(item.value, value);
      } else {
        // eslint-disable-next-line no-console
        console.warn(
          `Non-object current value of context "${name}" for "context.assign", try "context.replace" instead.`
        );
        item.value = value;
      }
    }

    item.eventTarget?.dispatchEvent(
      new CustomEvent(this.tplContextId ? "state.change" : "context.change", {
        detail: item.value,
      })
    );
  }

  async define(
    contextConfs: ContextConf[],
    coreContext: PluginRuntimeContext,
    brick?: RuntimeBrick
  ): Promise<void> {
    if (Array.isArray(contextConfs)) {
      const { mergedContext, keyword } = this.getResolveOptions(coreContext);
      await resolveContextConcurrently(
        contextConfs,
        (contextConf: ContextConf) =>
          resolveStoryboardContext(contextConf, mergedContext, this, brick),
        keyword
      );
    }
  }

  syncDefine(
    contextConfs: ContextConf[],
    coreContext: PluginRuntimeContext,
    brick: RuntimeBrick
  ): void {
    if (Array.isArray(contextConfs)) {
      const { mergedContext, keyword } = this.getResolveOptions(coreContext);
      syncResolveContextConcurrently(
        contextConfs,
        (contextConf: ContextConf) =>
          syncResolveStoryboardContext(contextConf, mergedContext, this, brick),
        keyword
      );
    }
  }

  private getResolveOptions(coreContext: PluginRuntimeContext): {
    mergedContext: PluginRuntimeContext;
    keyword: string;
  } {
    return this.tplContextId
      ? {
          mergedContext: { ...coreContext, tplContextId: this.tplContextId },
          keyword: "STATE",
        }
      : {
          mergedContext: coreContext,
          keyword: "CTX",
        };
  }
}

async function resolveStoryboardContext(
  contextConf: ContextConf,
  coreContext: PluginRuntimeContext,
  storyboardContextWrapper: StoryboardContextWrapper,
  brick?: RuntimeBrick
): Promise<boolean> {
  if (contextConf.property) {
    if (storyboardContextWrapper.tplContextId) {
      throw new Error(
        "Setting `property` is not allowed in template scoped context"
      );
    }
    if (brick) {
      storyboardContextWrapper.set(contextConf.name, {
        type: "brick-property",
        brick,
        prop: contextConf.property,
      });
    }
    return true;
  }
  return resolveNormalStoryboardContext(
    contextConf,
    coreContext,
    storyboardContextWrapper,
    brick
  );
}

async function resolveNormalStoryboardContext(
  contextConf: ContextConf,
  mergedContext: PluginRuntimeContext,
  storyboardContextWrapper: StoryboardContextWrapper,
  brick?: RuntimeBrick
): Promise<boolean> {
  if (!looseCheckIf(contextConf, mergedContext)) {
    return false;
  }
  let isResolve = false;
  let value = getDefinedTemplateState(
    !!storyboardContextWrapper.tplContextId,
    contextConf,
    brick
  );
  if (value === undefined) {
    if (contextConf.resolve) {
      if (looseCheckIf(contextConf.resolve, mergedContext)) {
        isResolve = true;
        const valueConf: Record<string, unknown> = {};
        await _internalApiGetResolver().resolveOne(
          "reference",
          {
            transform: "value",
            transformMapArray: false,
            ...contextConf.resolve,
          },
          valueConf,
          null,
          mergedContext
        );
        value = valueConf.value;
      } else if (!hasOwnProperty(contextConf, "value")) {
        return false;
      }
    }
    if (!isResolve && contextConf.value !== undefined) {
      value = computeRealValue(contextConf.value, mergedContext, true);
    }
  }
  resolveFreeVariableValue(
    value,
    contextConf,
    mergedContext,
    storyboardContextWrapper,
    brick
  );
  return true;
}

function syncResolveStoryboardContext(
  contextConf: ContextConf,
  mergedContext: PluginRuntimeContext,
  storyboardContextWrapper: StoryboardContextWrapper,
  brick?: RuntimeBrick
): boolean {
  if (!looseCheckIf(contextConf, mergedContext)) {
    return false;
  }
  if (contextConf.resolve) {
    throw new Error("resolve is not allowed here");
  }
  let value = getDefinedTemplateState(
    !!storyboardContextWrapper.tplContextId,
    contextConf,
    brick
  );
  if (value === undefined) {
    value = computeRealValue(contextConf.value, mergedContext, true);
  }
  resolveFreeVariableValue(
    value,
    contextConf,
    mergedContext,
    storyboardContextWrapper,
    brick
  );
  return true;
}

function getDefinedTemplateState(
  isTemplateState: boolean,
  contextConf: ContextConf,
  brick: RuntimeBrick
): unknown {
  if (
    isTemplateState &&
    brick.properties &&
    hasOwnProperty(brick.properties, contextConf.name)
  ) {
    return brick.properties[contextConf.name];
  }
}

function resolveFreeVariableValue(
  value: unknown,
  contextConf: ContextConf,
  mergedContext: PluginRuntimeContext,
  storyboardContextWrapper: StoryboardContextWrapper,
  brick?: RuntimeBrick
): void {
  const newContext: StoryboardContextItem = {
    type: "free-variable",
    value,
    // This is required for tracking context, even if no `onChange` is specified.
    eventTarget: new EventTarget(),
  };
  if (contextConf.onChange) {
    for (const handler of ([] as BrickEventHandler[]).concat(
      contextConf.onChange
    )) {
      newContext.eventTarget.addEventListener(
        storyboardContextWrapper.tplContextId
          ? "state.change"
          : "context.change",
        listenerFactory(handler, mergedContext, brick)
      );
    }
  }
  storyboardContextWrapper.set(contextConf.name, newContext);
}
