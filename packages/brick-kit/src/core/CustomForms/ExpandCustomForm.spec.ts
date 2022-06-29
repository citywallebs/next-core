import "@testing-library/jest-dom";
import {
  ExpandCustomForm,
  getDefaultProperties,
  getStoryboard,
} from "./ExpandCustomForm";

describe("getDefaultProperties is work", () => {
  it("getDefaultProperties by STRING", () => {
    const result = getDefaultProperties("test", [
      {
        defaultValue: "0",
        description: "不允许特殊字符",
        id: "test",
        limit: ["required"],
        name: "用户名",
        type: "STRING",
      },
    ]);
    expect(result).toEqual({
      brick: "forms.general-input",
      properties: {
        id: "test",
        label: "用户名",
        name: "test",
        placeholder: "不允许特殊字符",
        readOnly: false,
        required: true,
      },
    });
  });

  it("getDefaultProperties by INT", () => {
    const result = getDefaultProperties("test", [
      {
        defaultValue: "0",
        description: "不允许特殊字符",
        id: "test",
        limit: ["required"],
        name: "用户名",
        type: "INT",
      },
    ]);
    expect(result).toEqual({
      brick: "forms.general-input-number",
      properties: {
        id: "test",
        inputBoxStyle: { width: "100%" },
        label: "用户名",
        name: "test",
        placeholder: "不允许特殊字符",
        precision: 0,
        readOnly: false,
        required: true,
      },
    });
  });

  it("getDefaultProperties by BOOLEAN", () => {
    const result = getDefaultProperties("test", [
      {
        defaultValue: "0",
        description: "不允许特殊字符",
        id: "test",
        limit: ["required"],
        name: "用户名",
        type: "BOOLEAN",
      },
    ]);
    expect(result).toEqual({
      brick: "forms.general-switch",
      properties: {
        id: "test",
        label: "用户名",
        name: "test",
        readOnly: false,
        required: true,
      },
    });
  });

  it("getDefaultProperties by FLOAT", () => {
    const result = getDefaultProperties("test", [
      {
        defaultValue: "0",
        description: "不允许特殊字符",
        id: "test",
        limit: ["required"],
        name: "用户名",
        type: "FLOAT",
      },
    ]);
    expect(result).toEqual({
      brick: "forms.general-input-number",
      properties: {
        id: "test",
        inputBoxStyle: { width: "100%" },
        label: "用户名",
        name: "test",
        placeholder: "不允许特殊字符",
        readOnly: false,
        required: true,
      },
    });
  });

  it("getDefaultProperties by ENUMERATED_SINGLE_OPTION", () => {
    const result = getDefaultProperties("test", [
      {
        defaultValue: "0",
        description: "不允许特殊字符",
        id: "test",
        limit: ["required"],
        name: "用户名",
        type: "ENUMERATED_SINGLE_OPTION",
      },
    ]);
    expect(result).toEqual({
      brick: "forms.general-select",
      properties: {
        id: "test",
        inputBoxStyle: { width: "100%" },
        label: "用户名",
        name: "test",
        options: [
          { label: "选项一", value: 1 },
          { label: "选项二", value: 2 },
        ],
        placeholder: "不允许特殊字符",
        readOnly: false,
        required: true,
      },
    });
  });

  it("getDefaultProperties by SELECT_MULTIPLE_ENUMERATED_TYPE", () => {
    const result = getDefaultProperties("test", [
      {
        defaultValue: "0",
        description: "不允许特殊字符",
        id: "test",
        limit: ["required"],
        name: "用户名",
        type: "SELECT_MULTIPLE_ENUMERATED_TYPE",
      },
    ]);
    expect(result).toEqual({
      brick: "forms.general-select",
      properties: {
        id: "test",
        inputBoxStyle: { width: "100%" },
        label: "用户名",
        mode: "multiple",
        name: "test",
        options: [
          { label: "选项一", value: 1 },
          { label: "选项二", value: 2 },
        ],
        placeholder: "不允许特殊字符",
        readOnly: false,
        required: true,
      },
    });
  });

  it("getDefaultProperties by DATE", () => {
    const result = getDefaultProperties("test", [
      {
        defaultValue: "0",
        description: "不允许特殊字符",
        id: "test",
        limit: ["required"],
        name: "用户名",
        type: "DATE",
      },
    ]);
    expect(result).toEqual({
      brick: "forms.general-date-picker",
      properties: {
        id: "test",
        label: "用户名",
        name: "test",
        placeholder: "不允许特殊字符",
        readOnly: false,
        required: true,
      },
    });
  });

  it("getDefaultProperties by TIME", () => {
    const result = getDefaultProperties("test", [
      {
        defaultValue: "0",
        description: "不允许特殊字符",
        id: "test",
        limit: ["required"],
        name: "用户名",
        type: "TIME",
      },
    ]);
    expect(result).toEqual({
      brick: "forms.general-date-picker",
      properties: {
        id: "test",
        label: "用户名",
        name: "test",
        placeholder: "不允许特殊字符",
        readOnly: false,
        required: true,
      },
    });
  });

  it("getDefaultProperties by IP", () => {
    const result = getDefaultProperties("test", [
      {
        defaultValue: "0",
        description: "不允许特殊字符",
        id: "test",
        limit: ["required"],
        name: "用户名",
        type: "IP",
      },
    ]);
    expect(result).toEqual({
      brick: "forms.general-input",
      properties: {
        id: "test",
        label: "用户名",
        name: "test",
        pattern:
          /((^\s*((([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5]))\s*$)|(^\s*((([0-9A-Fa-f]{1,4}:){7}([0-9A-Fa-f]{1,4}|:))|(([0-9A-Fa-f]{1,4}:){6}(:[0-9A-Fa-f]{1,4}|((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){5}(((:[0-9A-Fa-f]{1,4}){1,2})|:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){4}(((:[0-9A-Fa-f]{1,4}){1,3})|((:[0-9A-Fa-f]{1,4})?:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){3}(((:[0-9A-Fa-f]{1,4}){1,4})|((:[0-9A-Fa-f]{1,4}){0,2}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){2}(((:[0-9A-Fa-f]{1,4}){1,5})|((:[0-9A-Fa-f]{1,4}){0,3}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){1}(((:[0-9A-Fa-f]{1,4}){1,6})|((:[0-9A-Fa-f]{1,4}){0,4}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(:(((:[0-9A-Fa-f]{1,4}){1,7})|((:[0-9A-Fa-f]{1,4}){0,5}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:)))(%.+)?\s*$))/,
        placeholder: "不允许特殊字符",
        readOnly: false,
        required: true,
      },
    });
  });

  it("getDefaultProperties by JSON", () => {
    const result = getDefaultProperties("test", [
      {
        defaultValue: "0",
        description: "不允许特殊字符",
        id: "test",
        limit: ["required"],
        name: "用户名",
        type: "JSON",
      },
    ]);
    expect(result).toEqual({});
  });

  it("getDefaultProperties by ARRAY", () => {
    const result = getDefaultProperties("test", [
      {
        defaultValue: "0",
        description: "不允许特殊字符",
        id: "test",
        limit: ["required"],
        name: "用户名",
        type: "ARRAY",
      },
    ]);
    expect(result).toEqual({});
  });

  it("getDefaultProperties by STRUCTURE", () => {
    const result = getDefaultProperties("test", [
      {
        defaultValue: "0",
        description: "不允许特殊字符",
        id: "test",
        limit: ["required"],
        name: "用户名",
        type: "STRUCTURE",
      },
    ]);
    expect(result).toEqual({
      brick: "forms.cmdb-instance-select-panel",
      properties: {
        id: "test",
        label: "用户名",
        name: "test",
        readOnly: false,
        required: true,
      },
    });
  });

  it("getDefaultProperties by STRUCTURE_ARRAY", () => {
    const result = getDefaultProperties("test", [
      {
        defaultValue: "0",
        description: "不允许特殊字符",
        id: "test",
        limit: ["required"],
        name: "用户名",
        type: "STRUCTURE_ARRAY",
      },
    ]);
    expect(result).toEqual({
      brick: "forms.cmdb-instance-select-panel",
      properties: {
        id: "test",
        label: "用户名",
        name: "test",
        readOnly: false,
        required: true,
      },
    });
  });

  it("getDefaultProperties by field not find", () => {
    const result = getDefaultProperties("test", [
      {
        defaultValue: "0",
        description: "不允许特殊字符",
        id: "test123",
        limit: ["required"],
        name: "用户名",
        type: "input",
      },
    ]);
    expect(result).toEqual({
      brick: "forms.general-input",
      properties: { id: "field", label: "字段名", name: "field" },
    });
  });
});

describe("getStoryboard is work", () => {
  const layout = [
    {
      brick: "forms.general-form",
      bricks: [
        {
          brick: "basic-bricks.grid-layout",
          bricks: [
            {
              quote: "userName",
              userDefined: { properties: { label: "123" } },
            },
            {
              quote: "userId",
              userDefined: { brick: "forms.general-textarea" },
            },
            {
              quote: "age",
            },
          ],
          properties: {
            columns: 1,
            id: "grid_252",
            title: "行容器",
          },
        },
        {
          brick: "basic-bricks.grid-row",
          bricks: [
            {
              quote: "age",
            },
            {
              quote: "test",
            },
          ],
          properties: {
            columns: 1,
            id: "grid_252",
            title: "行容器",
          },
        },
      ],
      context: {},
      properties: {
        formItemConfig: {},
        id: "form_251",
        sectionConfig: {},
        values: {},
      },
    },
  ];
  const fields = [
    {
      _object_id: "FORM_MODEL_FIELD@EASYOPS",
      creator: "easyops",
      ctime: "2022-05-30 10:27:25",
      defaultValue: "0",
      description: "不允许特殊字符",
      id: "userName",
      instanceId: "5e0316589e322",
      limit: ["required"],
      modifier: "easyops",
      mtime: "2022-06-07 15:34:11",
      name: "用户名",
      type: "STRING",
    },
    {
      _object_id: "FORM_MODEL_FIELD@EASYOPS",
      creator: "easyops",
      ctime: "2022-05-30 12:18:55",
      defaultValue: "0",
      description: "不允许特殊字符",
      id: "userId",
      instanceId: "5e032f4514c7b",
      limit: [],
      modifier: "easyops",
      mtime: "2022-06-07 14:52:26",
      name: "用户Id",
      type: "STRING",
    },
    {
      _object_id: "FORM_MODEL_FIELD@EASYOPS",
      creator: "easyops",
      ctime: "2022-05-31 16:16:10",
      defaultValue: "0",
      description: "不允许特殊字符",
      id: "age",
      instanceId: "5e04a62a36373",
      limit: [],
      modifier: "easyops",
      mtime: "2022-06-07 12:24:03",
      name: "年龄",
      type: "INT",
    },
  ];
  const result = getStoryboard(layout, [], fields);
  expect(result).toEqual([
    {
      brick: "forms.general-form",
      context: {},
      properties: {
        formItemConfig: {},
        id: "form_251",
        sectionConfig: {},
        values: {},
      },
      slots: {
        items: {
          bricks: [
            {
              brick: "basic-bricks.grid-layout",
              properties: {
                columns: 1,
                id: "grid_252",
                title: "行容器",
              },
              slots: {
                items: {
                  bricks: [
                    {
                      brick: "forms.general-input",
                      properties: {
                        id: "userName",
                        name: "userName",
                        label: "123",
                        readOnly: false,
                        required: true,
                        placeholder: "不允许特殊字符",
                      },
                    },
                    {
                      brick: "forms.general-textarea",
                      properties: {
                        id: "userId",
                        name: "userId",
                        label: "用户Id",
                        readOnly: false,
                        required: false,
                        placeholder: "不允许特殊字符",
                      },
                    },
                    {
                      brick: "forms.general-input-number",
                      properties: {
                        id: "age",
                        name: "age",
                        label: "年龄",
                        readOnly: false,
                        required: false,
                        placeholder: "不允许特殊字符",
                        precision: 0,
                        inputBoxStyle: {
                          width: "100%",
                        },
                      },
                    },
                  ],
                  type: "bricks",
                },
              },
            },
            {
              brick: "basic-bricks.grid-row",
              properties: {
                columns: 1,
                id: "grid_252",
                title: "行容器",
              },
              slots: {
                content: {
                  bricks: [
                    {
                      brick: "forms.general-input-number",
                      properties: {
                        id: "age",
                        name: "age",
                        label: "年龄",
                        readOnly: false,
                        required: false,
                        placeholder: "不允许特殊字符",
                        precision: 0,
                        inputBoxStyle: {
                          width: "100%",
                        },
                      },
                    },
                    {
                      brick: "forms.general-input",
                      properties: {
                        id: "field",
                        label: "字段名",
                        name: "field",
                      },
                    },
                  ],
                  type: "bricks",
                },
              },
            },
          ],
          type: "bricks",
        },
      },
    },
  ]);
});

describe("ExpandCustomForm is work", () => {
  const formData = {
    fields: [
      {
        description: "不允许特殊字符",
        id: "userName",
        name: "用户名",
        instanceId: "5e0316589e322",
        limit: ["readOnly", "only", "required"],
        type: "STRING",
      },
      {
        defaultValue: "0",
        description: "不允许特殊字符",
        id: "userId",
        limit: [],
        name: "用户Id",
        type: "STRING",
      },
      {
        defaultValue: "0",
        description: "不允许特殊字符",
        id: "age",
        instanceId: "5e04a62a36373",
        limit: [],
        name: "年龄",
        type: "INT",
      },
      {
        description: "不允许特殊字符",
        id: "department",
        instanceId: "5e04a6469c232",
        limit: ["required"],
        name: "部门",
        type: "ENUMERATED_SINGLE_OPTION",
      },
      {
        defaultValue: "在职",
        id: "status",
        limit: ["required"],
        name: "状态",
        type: "ENUMERATED_SINGLE_OPTION",
      },
    ],
    formName: "222",
    formSchema: {
      layout: {
        brick: "forms.general-form",
        bricks: [
          {
            brick: "basic-bricks.grid-layout",
            bricks: [
              {
                quote: "userName",
              },
              {
                quote: "userId",
                userDefined: {
                  brick: "forms.general-input",
                  properties: {
                    label: "ID",
                  },
                },
              },
              {
                quote: "age",
              },
              {
                quote: "department",
              },
              {
                quote: "status",
              },
            ],
            properties: {
              columns: 1,
              id: "grid_138",
              title: "行容器",
            },
          },
        ],
        context: {},
        properties: {
          formItemConfig: {},
          id: "form_137",
          sectionConfig: {},
          values: {},
        },
        userDefined: {
          brick: "forms.general-form",
          properties: {
            style: {
              marginTop: "20px",
            },
          },
        },
      },
      op: "",
    },
  };
  const _formData = {};
  const brickConf = {
    bg: false,
    brick: "form-builder.form-render",
    iid: "5e27819b1e711",
    injectDeep: true,
    portal: false,
    properties: {
      dataset: {
        testid: "test",
      },
      formData: "<% CTX.formData %>",
    },
  };
  expect(ExpandCustomForm(formData, brickConf)).toEqual({
    bg: false,
    brick: "div",
    iid: "5e27819b1e711",
    injectDeep: true,
    portal: false,
    properties: {
      dataset: {
        testid: "test",
      },
      formData: "<% CTX.formData %>",
    },
    slots: {
      "": {
        bricks: [
          {
            brick: "forms.general-form",
            context: {},
            properties: {
              formItemConfig: {},
              id: "form_137",
              sectionConfig: {},
              values: {},
              style: {
                marginTop: "20px",
              },
            },
            slots: {
              items: {
                bricks: [
                  {
                    brick: "basic-bricks.grid-layout",
                    properties: {
                      columns: 1,
                      id: "grid_138",
                      title: "行容器",
                    },
                    slots: {
                      items: {
                        bricks: [
                          {
                            brick: "forms.general-input",
                            properties: {
                              id: "userName",
                              name: "userName",
                              label: "用户名",
                              readOnly: true,
                              required: true,
                              placeholder: "不允许特殊字符",
                            },
                          },
                          {
                            brick: "forms.general-input",
                            properties: {
                              id: "userId",
                              name: "userId",
                              label: "ID",
                              readOnly: false,
                              required: false,
                              placeholder: "不允许特殊字符",
                            },
                          },
                          {
                            brick: "forms.general-input-number",
                            properties: {
                              id: "age",
                              name: "age",
                              label: "年龄",
                              readOnly: false,
                              required: false,
                              placeholder: "不允许特殊字符",
                              precision: 0,
                              inputBoxStyle: {
                                width: "100%",
                              },
                            },
                          },
                          {
                            brick: "forms.general-select",
                            properties: {
                              id: "department",
                              name: "department",
                              label: "部门",
                              readOnly: false,
                              required: true,
                              options: [
                                {
                                  label: "选项一",
                                  value: 1,
                                },
                                {
                                  label: "选项二",
                                  value: 2,
                                },
                              ],
                              placeholder: "不允许特殊字符",
                              inputBoxStyle: {
                                width: "100%",
                              },
                            },
                          },
                          {
                            brick: "forms.general-select",
                            properties: {
                              id: "status",
                              name: "status",
                              label: "状态",
                              readOnly: false,
                              required: true,
                              options: [
                                {
                                  label: "选项一",
                                  value: 1,
                                },
                                {
                                  label: "选项二",
                                  value: 2,
                                },
                              ],
                              inputBoxStyle: {
                                width: "100%",
                              },
                            },
                          },
                        ],
                        type: "bricks",
                      },
                    },
                  },
                ],
                type: "bricks",
              },
            },
          },
        ],
        type: "bricks",
      },
    },
  });
  expect(ExpandCustomForm(_formData, brickConf)).toEqual({
    brick: "div",
    slots: {
      "": {
        bricks: [
          {
            brick: "presentational-bricks.brick-illustration",
            properties: {
              category: "default",
              header: {
                title: "参数错误",
              },
              mode: "guide",
              name: "search-empty",
            },
          },
        ],
        type: "bricks",
      },
    },
  });
});
