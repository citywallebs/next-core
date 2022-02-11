import { trackContext, trackState } from "./track";

const consoleWarn = jest
  .spyOn(console, "warn")
  .mockImplementation(() => void 0);

describe("trackContext", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return tracking contexts", () => {
    expect(
      trackContext(
        "<% 'track context', CTX.good1(CTX['good2'], () => CTX.good3, DATA.bad1, CTX[bad2], (CTX) => CTX.bad3, CTX) %>"
      )
    ).toEqual(["good1", "good2", "good3"]);
  });

  it("should return false for non-track-ctx mode", () => {
    expect(trackContext("<% CTX.bad %>")).toBe(false);
    expect(trackContext("<% 'oops', 'track context', CTX.bad %>")).toBe(false);
    expect(trackContext("<% track.CTX, CTX.bad %>")).toBe(false);
  });

  it("should return false if no CTX usage were found", () => {
    expect(trackContext("<% 'track context', () => DATA.bad %>")).toBe(false);
    expect(consoleWarn).toBeCalled();
  });
});

describe("trackState", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return tracking states", () => {
    expect(
      trackState(
        "<% 'track state', STATE.good1(STATE['good2'], () => STATE.good3, DATA.bad1, STATE[bad2], (STATE) => STATE.bad3, STATE) %>"
      )
    ).toEqual(["good1", "good2", "good3"]);
  });

  it("should return false for non-track-state mode", () => {
    expect(trackState("<% STATE.bad %>")).toBe(false);
    expect(trackState("<% 'oops', 'track state', STATE.bad %>")).toBe(false);
    expect(trackState("<% track.STATE, STATE.bad %>")).toBe(false);
  });

  it("should return false if no STATE usage were found", () => {
    expect(trackState("<% 'track state', () => DATA.bad %>")).toBe(false);
    expect(consoleWarn).toBeCalled();
  });
});
