import type { RuntimeMisc } from "@next-core/brick-types";
import { getBasePath } from "./getBasePath";

jest.mock("./getBasePath");
jest.mock("../history");

(getBasePath as jest.Mock).mockReturnValue("/next/");

describe("getRuntimeMisc", () => {
  let getRuntimeMisc: () => RuntimeMisc;

  beforeEach(() => {
    jest.isolateModules(() => {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      getRuntimeMisc = require("./misc").getRuntimeMisc;
    });
  });

  it("should work", () => {
    Object.defineProperty(window, "parent", { value: window, writable: true });

    const misc = getRuntimeMisc();
    expect(misc).toEqual({
      isInIframe: false,
      isInIframeOfSameSite: false,
      isInIframeOfNext: false,
      isInIframeOfVisualBuilder: false,
      isInIframeOfLegacyConsole: false,
    });

    // Misc is frozen.
    expect(() => {
      misc.isInIframe = true;
    }).toThrow();

    // Misc is cached.
    Object.defineProperty(window, "parent", {
      value: {
        origin: "https://easyops.cn",
      },
      writable: true,
    });

    expect(getRuntimeMisc()).toBe(misc);
  });

  it("show work in iframe", () => {
    Object.defineProperty(window, "parent", {
      value: {
        origin: "https://easyops.cn",
      },
      writable: true,
    });

    expect(getRuntimeMisc()).toEqual({
      isInIframe: true,
      isInIframeOfSameSite: false,
      isInIframeOfNext: false,
      isInIframeOfVisualBuilder: false,
      isInIframeOfLegacyConsole: false,
    });
  });

  it("show work in iframe if parent is not accessible", () => {
    const parent = {};
    Object.defineProperty(parent, "origin", {
      get: () => {
        throw new Error("denied");
      },
    });
    Object.defineProperty(window, "parent", { value: parent, writable: true });

    expect(getRuntimeMisc()).toEqual({
      isInIframe: true,
      isInIframeOfSameSite: false,
      isInIframeOfNext: false,
      isInIframeOfVisualBuilder: false,
      isInIframeOfLegacyConsole: false,
    });
  });

  it("show work in iframe of legacy console", () => {
    const location = window.location;
    delete window.location;
    window.location = {
      pathname: "/next/abc",
    } as unknown as Location;
    Object.defineProperty(window, "parent", {
      value: {
        origin: "http://localhost",
        location: {
          pathname: "/xyz",
        },
      },
      writable: true,
    });
    expect(getRuntimeMisc()).toEqual({
      isInIframe: true,
      isInIframeOfSameSite: true,
      isInIframeOfNext: false,
      isInIframeOfVisualBuilder: false,
      isInIframeOfLegacyConsole: true,
    });
    window.location = location;
  });

  it("show work in iframe of non-legacy console", () => {
    const location = window.location;
    delete window.location;
    window.location = {
      pathname: "/next/abc",
    } as unknown as Location;
    Object.defineProperty(window, "parent", {
      value: {
        origin: "http://localhost",
        location: {
          pathname: "/next/xyz",
        },
      },
      writable: true,
    });
    expect(getRuntimeMisc()).toEqual({
      isInIframe: true,
      isInIframeOfSameSite: true,
      isInIframeOfNext: true,
      isInIframeOfVisualBuilder: false,
      isInIframeOfLegacyConsole: false,
    });
    window.location = location;
  });

  it("show work in iframe of visual builder", () => {
    const location = window.location;
    delete window.location;
    window.location = {
      pathname: "/next/any",
    } as unknown as Location;
    Object.defineProperty(window, "parent", {
      value: {
        origin: "http://localhost",
        location: {
          pathname: "/next/visual-builder/xyz",
        },
      },
      writable: true,
    });
    expect(getRuntimeMisc()).toEqual({
      isInIframe: true,
      isInIframeOfSameSite: true,
      isInIframeOfNext: true,
      isInIframeOfVisualBuilder: true,
      isInIframeOfLegacyConsole: false,
    });
    window.location = location;
  });
});
