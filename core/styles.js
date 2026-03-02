const css = require("css");
const styleConfig = require("../style-config");

class WebMAXStyleProcessor {
  static processScoped(cssContent, componentId) {
    if (!cssContent) return { styleMap: {}, scopedCSS: "" };

    const ast = css.parse(cssContent);
    const styleMap = {};
    const scopeAttr = `data-wm-${componentId}`;

    ast.stylesheet.rules.forEach((rule) => {
      if (rule.type === "rule") {
        rule.selectors = rule.selectors.map((sel) => {
          if (sel.startsWith(".")) {
            return `${sel}[${scopeAttr}]`;
          }
          return `${sel}[${scopeAttr}]`;
        });

        const firstSelector = rule.selectors[0]
          .split("[")[0]
          .trim()
          .replace(/^\./, "");

        styleMap[firstSelector] = {};

        rule.declarations.forEach((decl) => {
          if (decl.type !== "declaration") return;

          const cleanProp = decl.property.toLowerCase();

          const prop = cleanProp.replace(/-([a-z])/g, (g) =>
            g[1].toUpperCase(),
          );

          if (styleConfig.isSupported(prop)) {
            let value = decl.value;
            let nativeValue = value;

            const lowerValue = String(value).toLowerCase();

            if (lowerValue.endsWith("px")) {
              value = parseInt(lowerValue);
            }
            if (!isNaN(value) && value !== "" && typeof value !== "boolean") {
              value = Number(value);
            }

            styleMap[firstSelector][prop] = value;

            if (
              !isNaN(nativeValue) &&
              !lowerValue.includes("px") &&
              !lowerValue.includes("%") &&
              !lowerValue.includes("em") &&
              !lowerValue.includes("rem")
            ) {
              decl.value = nativeValue + "px";
            }
          } else {
            console.warn(
              `\x1b[33m[WebMAX Style Warning]\x1b[0m Property "${decl.property}" not supported on Native.`,
            );
          }
        });
      }
    });

    return {
      styleMap,
      scopedCSS: css.stringify(ast),
    };
  }
}

module.exports = WebMAXStyleProcessor;
