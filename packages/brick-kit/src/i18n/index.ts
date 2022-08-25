import i18next from "i18next";
import { NS_BRICK_KIT } from "./constants";
import en from "./locales/en";
import zh from "./locales/zh";

/** @internal */
export const initI18n = (): void => {
  i18next.addResourceBundle("en", NS_BRICK_KIT, en);
  i18next.addResourceBundle("zh", NS_BRICK_KIT, zh);
};

/** @internal */
export function getI18nNamespace(
  type: "app" | "widget" | "menu",
  id: string
): string {
  return `$${type}-${id}`;
}
