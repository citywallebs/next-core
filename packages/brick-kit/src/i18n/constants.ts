export const NS_BRICK_KIT = "brick-kit";

export enum K {
  REQUEST_FAILED = "REQUEST_FAILED",
  MODAL_OK = "MODAL_OK",
  MODAL_CANCEL = "MODAL_CANCEL",
  SOMETHING_WENT_WRONG = "SOMETHING_WENT_WRONG",
  LOGIN_TIMEOUT_MESSAGE = "LOGIN_TIMEOUT_MESSAGE",
  NETWORK_ERROR = "NETWORK_ERROR",
  PAGE_NOT_FOUND = "PAGE_NOT_FOUND",
  APP_NOT_FOUND = "APP_NOT_FOUND",
  LICENSE_EXPIRED = "LICENSE_EXPIRED",
  NO_PERMISSION = "NO_PERMISSION",
  OTHER_ERROR = "OTHER_ERROR",
  GO_BACK_PREVIOUS_PAGE = "GO_BACK_PREVIOUS_PAGE",
}

export type Locale = { [key in K]: string };
