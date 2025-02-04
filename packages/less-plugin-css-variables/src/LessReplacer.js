function escapeRegExp(input) {
  return input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const variableMap = {
  "table-header-sort-active-bg": true,
  "table-header-filter-active-bg": true,
  "table-header-sort-active-filter-bg": true,
  "pagination-item-disabled-bg-active": true,
};

const rawStringMap = {
  "fade(@calendar-item-active-bg, 20%)": "var(--antd-column-active-bg)",
  "darken(@item-active-bg, 2%)": "var(--antd-item-active-bg-darken-2)",
  "fade(@switch-color, 20%)": "var(--antd-switch-color-fade-20)",
  "shade(@text-color-secondary, 40%)":
    "var(--antd-text-color-secondary-shade-40)",
  "fade(@disabled-color, 10%)": "var(--antd-disabled-color-fade-10)",
  "fade(@radio-dot-color, 8%)": "var(--antd-radio-dot-color-fade-8)",
  "lighten(@border-color-split, 80%)":
    "var(--antd-border-color-split-lighten-80)",
  "lighten(@table-border-color, 80%)":
    "var(--antd-border-color-split-lighten-80)",
  "fade(@modal-mask-bg, 10%)": "var(--antd-modal-mask-bg-fade-10)",
  "fade(@error-color, @outline-fade);": "var(--antd-error-color-fade-20)",
  "box-shadow: @input-outline-offset @outline-blur-size @outline-width fade(@color, @outline-fade)":
    ".replaceFormInputErrorShadow(@color; @input-outline-offset; @outline-blur-size;@outline-width;@outline-fade;)",
  "border-color: ~`colorPalette('@{color}', 5) `":
    ".replaceFormInputErrorBorder(@color)",
};

const replacements = [
  [
    new RegExp(
      `(?:@(${Object.keys(variableMap).map(escapeRegExp).join("|")})):[^;]+;`,
      "g"
    ),
    (match, p1) => {
      return `@${p1}: var(--antd-${p1});`;
    },
  ],
  [
    new RegExp(`${Object.keys(rawStringMap).map(escapeRegExp).join("|")}`, "g"),
    (match) => {
      return rawStringMap[match];
    },
  ],
];

class LessReplacer {
  process(src) {
    return replacements.reduce(
      (source, item) => source.replace(item[0], item[1]),
      src
    );
  }
}

exports.LessReplacer = LessReplacer;
