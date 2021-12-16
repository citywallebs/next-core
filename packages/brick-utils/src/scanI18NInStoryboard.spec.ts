import { Storyboard, BrickConf } from "@next-core/brick-types";
import { scanI18NInStoryboard, scanI18NInAny } from "./scanI18NInStoryboard";

describe("scanI18NInStoryboard", () => {
  it("should work", () => {
    const selfRef: Record<string, any> = {
      quality: "good",
    };
    selfRef.ref = selfRef;
    const storyboard: Storyboard = {
      routes: [
        {
          bricks: [
            {
              brick: "b-a",
              properties: {
                any: "<% I18N('MY_KEY_B', 'My key b') %>",
                any2: "<% I18N('MY_KEY_C', 'My key c') %>",
                any3: "<% I18N('MY_KEY_C', 'My key c v2') %>",
                any4: "<% I18N('MY_KEY_D', {}) %>",
                selfRef,
              },
            },
          ],
        },
      ],
      meta: {
        customTemplates: [
          {
            name: "ct-a",
            bricks: [
              {
                brick: "b-x",
                bg: true,
                properties: {
                  any: "<% I18N('MY_KEY_A') %>",
                },
              },
            ],
          },
        ],
        menus: [
          {
            menuId: "menu-a",
            items: [
              {
                text: "<% I18N('MY_KEY_M') %>",
              },
            ],
          },
        ],
        functions: [
          {
            source: `
              function test(): string {
                return I18N("MY_KEY_F");
              }
            `,
            typescript: true,
          },
        ],
      },
      app: {
        defaultConfig: {
          bad: "<% I18N('MY_KEY_Z') %>",
        },
      },
    } as any;
    expect(
      Array.from(scanI18NInStoryboard(storyboard).entries()).map(
        ([key, valueSet]) => [key, Array.from(valueSet)]
      )
    ).toEqual([
      ["MY_KEY_B", ["My key b"]],
      ["MY_KEY_C", ["My key c", "My key c v2"]],
      ["MY_KEY_D", []],
      ["MY_KEY_A", []],
      ["MY_KEY_M", []],
      ["MY_KEY_F", []],
    ]);
  });

  it("should return empty", () => {
    expect(
      Array.from(
        scanI18NInStoryboard({ routes: null, app: null }).entries()
      ).map(([key, valueSet]) => [key, Array.from(valueSet)])
    ).toEqual([]);
  });
});

describe("scanI18NInAny", () => {
  it("should work", () => {
    const brickConf: BrickConf = {
      brick: "b-b",
      properties: {
        good: "<% I18N('MY_KEY_A') %>",
        good2: "<% I18N('MY_KEY_B', 'My key b') %>",
        good3: "<% I18N('MY_KEY_C', 'My key c') %>",
        good3_duplicated: "<% I18N('MY_KEY_C', 'My key c') %>",
        good3_v2: "<% I18N('MY_KEY_C', 'My key c v2') %>",
        good4: "<% I18N('MY_KEY_D', {}) %>",
        good5: "<% I18N('MY_KEY_E', 123) %>",
        good6: "<% process(I18N('MY_KEY_F')) %>",
        good7: "<% () => I18N('MY_KEY_G') %>",
        bad: "<% I18N(bad) %>",
        bad2: "<% I18N(123) %>",
        bad3: "<% I18N.doSomething('MY_KEY_Z') %>",
        bad4: "<% I18N['MY_KEY_Y'] %>",
        bad5: "<% ANY.I18N('MY_KEY_X') %>",
        bad6: "I18N('MY_KEY_W')",
        bad7: "<% I18N() %>",
        bad8: "<% 'MY_KEY_V' %>",
        bad9: "<% (I18N) => I18N('MY_KEY_U') %>",
      },
    } as any;
    expect(
      Array.from(scanI18NInAny(brickConf).entries()).map(([key, valueSet]) => [
        key,
        Array.from(valueSet),
      ])
    ).toEqual([
      ["MY_KEY_A", []],
      ["MY_KEY_B", ["My key b"]],
      ["MY_KEY_C", ["My key c", "My key c v2"]],
      ["MY_KEY_D", []],
      ["MY_KEY_E", []],
      ["MY_KEY_F", []],
      ["MY_KEY_G", []],
    ]);
  });
});
