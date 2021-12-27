import { StoryboardFunction } from "@next-core/brick-types";
import {
  ReadonlyStoryboardFunctions,
  StoryboardFunctionRegistryFactory,
} from "./StoryboardFunctionRegistryFactory";

const widgetFunctionRegistry = new Map<string, ReadonlyStoryboardFunctions>();

export const widgetFunctions = new Proxy(Object.freeze({}), {
  get(target, key: string) {
    return widgetFunctionRegistry.get(key);
  },
}) as Readonly<Record<string, ReadonlyStoryboardFunctions>>;

export function registerWidgetFunctions(
  widgetId: string,
  functions: StoryboardFunction[]
): void {
  if (widgetFunctionRegistry.has(widgetId)) {
    // eslint-disable-next-line no-console
    throw new Error(`Widget functions of "${widgetId}" already registered`);
  }
  const { storyboardFunctions, registerStoryboardFunctions } =
    StoryboardFunctionRegistryFactory({ widgetId });
  widgetFunctionRegistry.set(widgetId, storyboardFunctions);
  registerStoryboardFunctions(functions);
}
