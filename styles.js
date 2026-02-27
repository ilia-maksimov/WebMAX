const css = require("css");
const styleConfig = require("./style-config");

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

          // 1. Приводим всё к нижнему регистру (FONT-SIZE -> font-size)
          const cleanProp = decl.property.toLowerCase();

          // 2. Превращаем в camelCase (font-size -> fontSize)
          const prop = cleanProp.replace(/-([a-z])/g, (g) =>
            g[1].toUpperCase(),
          );

          if (styleConfig.isSupported(prop)) {
            let value = decl.value;

            // Приводим значение к нижнему регистру для обработки единиц (12PX -> 12px)
            const lowerValue = String(value).toLowerCase();

            if (lowerValue.endsWith("px")) {
              value = parseInt(lowerValue);
            }
            if (!isNaN(value) && value !== "" && typeof value !== "boolean") {
              value = Number(value);
            }

            styleMap[firstSelector][prop] = value;
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
