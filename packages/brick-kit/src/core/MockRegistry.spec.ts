import { registerMock, getMockList, getMockInfo } from "./MockRegistry";

const register = (nothing?: boolean): void => {
  if (nothing) {
    registerMock(undefined);
  } else {
    registerMock({
      mockId: "123",
      mockList: [
        {
          uri: "easyops.api.test.getA/a/b/c/d/e",
          provider: "provider-a",
          method: "GET",
        },
        {
          uri: "easyops.api.test.abc.getB/a/b/:projectId/c",
          provider: "provider-b",
          method: "GET",
        },
        {
          uri: "easyops.api.test.abc.efg.getC/a/b/:projectId/c/d/:instasnceId",
          provider: "provider-c",
          method: "GET",
        },
        {
          uri: "easyops.api.test.abc.getD/a/b/c/d/:instasnceId",
          provider: "provider-d",
          method: "LIST",
        },
        {
          uri: "easyops.api.test.abc.getD/a/b/c/d/:instasnceId",
          provider: "provider-e",
          method: "post",
        },
        {
          uri: "logic.cmdb.service/object/:objectId/list",
          provider: "flowBuilder@api-a",
          method: "get",
        },
        {
          uri: "easyops.api.logic.cmdb.service/object/:objectId",
          provider: "flowBuilder@api-b",
          method: "post",
        },
      ],
    });
  }
};

describe("Mock Registry should work", () => {
  it("registerMock nothing should work", () => {
    register(true);

    expect(getMockList().length).toBe(0);
  });

  it("registerMock should work", () => {
    expect(getMockList().length).toBe(0);

    register();

    expect(getMockList().length).toBe(7);

    expect(getMockList()).toStrictEqual([
      {
        provider: "provider-a",
        method: "GET",
        uri: "/test.getA/a/b/c/d/e$",
      },
      {
        provider: "provider-b",
        method: "GET",
        uri: "/test.abc.getB/a/b/([^/]+)/c$",
      },
      {
        provider: "provider-c",
        method: "GET",
        uri: "/test.abc.efg.getC/a/b/([^/]+)/c/d/([^/]+)$",
      },
      {
        provider: "provider-d",
        method: "LIST",
        uri: "/test.abc.getD/a/b/c/d/([^/]+)$",
      },
      {
        provider: "provider-e",
        method: "post",
        uri: "/test.abc.getD/a/b/c/d/([^/]+)$",
      },
      {
        uri: "/logic.cmdb.service(@\\d+\\.\\d+\\.\\d+)?/object/([^/]+)/list$",
        provider: "flowBuilder@api-a",
        method: "get",
      },
      {
        uri: "/easyops.api.logic.cmdb.service(@\\d+\\.\\d+\\.\\d+)?/object/([^/]+)$",
        provider: "flowBuilder@api-b",
        method: "post",
      },
    ]);
  });

  it.each<[string, string, string]>([
    // noraml provider
    [
      "api/gateway/test.getA/a/b/c/d/e",
      "get",
      "api/gateway/mock_server.proxy.123/test.getA/a/b/c/d/e",
    ],
    ["api/gateway/test.getA@1.0.0/a/b/c/d/e", "get", undefined],
    ["api/gateway/easyops.api.test.getA/a/b/c/d/e", "get", undefined],
    ["api/gateway/api.test.getA/a/b/c/d/e@1.8.0", "get", undefined],
    ["api/gateway/test.getA/a/b/c/d/e/", "get", undefined],
    ["api/gateway/test.getA@1.0.0/a/b/c/d/e/f", "get", undefined],
    ["api/gateway/test.getA@1.0.0/a/", "get", undefined],
    [
      "api/gateway/test.abc.getB/a/b/P-101/c",
      "Get",
      "api/gateway/mock_server.proxy.123/test.abc.getB/a/b/P-101/c",
    ],
    [
      "api/gateway/test.abc.getB/a/b/@1.2.3/c",
      "get",
      "api/gateway/mock_server.proxy.123/test.abc.getB/a/b/@1.2.3/c",
    ],
    ["api/gateway/test.abc.getB/a/b/c/d", "get", undefined],
    [
      "api/gateway/test.abc.efg.getC/a/b/P-101/c/d/12345",
      "get",
      "api/gateway/mock_server.proxy.123/test.abc.efg.getC/a/b/P-101/c/d/12345",
    ],
    ["api/gateway/test.abc.efg.getC/a/b/P-101/c/d/12345/e", "get", undefined],
    ["api/gateway/test.abc.efg.getC/a/b/P-101/c/d/12345/", "get", undefined],
    ["api/gateway/test.abc.efg.getC/a/b/P-101/c/d/", "get", undefined],
    ["api/gateway/test.abc.efg.getC/a/b/P-101/c/d", "get", undefined],
    [
      "api/gateway/test.abc.getD/a/b/c/d/balabala",
      "get",
      "api/gateway/mock_server.proxy.123/test.abc.getD/a/b/c/d/balabala",
    ],
    [
      "api/gateway/test.abc.getD/a/b/c/d/balabala",
      "POST",
      "api/gateway/mock_server.proxy.123/test.abc.getD/a/b/c/d/balabala",
    ],
    ["api/gateway/test.abc.getD/a/b/c/d/balabala/e", "get", undefined],
    // flow api
    [
      "api/gateway/logic.cmdb.service@1.2.3/object/APP/list",
      "get",
      "api/gateway/mock_server.proxy.123/logic.cmdb.service/object/APP/list",
    ],
    [
      "api/gateway/logic.cmdb.service/object/APP/list",
      "get",
      "api/gateway/mock_server.proxy.123/logic.cmdb.service/object/APP/list",
    ],
    ["api/gateway/logic.cmdb.service@1/object/APP/list", "get", undefined],
    ["api/gateway/logic.cmdb.service:1.2.3/object/APP/list", "get", undefined],
    ["api/gateway/logic.cmdb.service/object@1.2.3/APP/list", "get", undefined],
    ["api/gateway/logic.cmdb.@1.2.3service/object/APP/list", "get", undefined],
    [
      "api/gateway/logic.cmdb.service@1.2.3.4/object/APP/list",
      "get",
      undefined,
    ],
    ["api/gateway/logic.cmdb.service@1.a.2/object/APP/list", "get", undefined],
    ["api/gateway/logic.cmdb.service/object/APP/list/abc", "get", undefined],
    ["api/gateway/logic.cmdb.service/object/APP", "get", undefined],
    [
      "api/gateway/easyops.api.logic.cmdb.service@11.22.33/object/abc",
      "post",
      "api/gateway/mock_server.proxy.123/easyops.api.logic.cmdb.service/object/abc",
    ],
    ["easyops.api.logic.cmdb.service/object/abc/t", "post", undefined],
  ])("getMockRule args: %j ,should return %j", (param, method, result) => {
    register();
    expect(getMockInfo(param, method)?.url).toEqual(result);
  });
});
