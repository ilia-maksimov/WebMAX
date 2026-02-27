const css = require("css");
const fs = require("fs");
const styleConfig = require("./style-config");

class WebMAXStyleProcessor {
  /**
   * Reads a CSS file and converts it into a JSON object
   * compatible with both Web and Native.
   */
  static parse(cssPath) {
    if (!fs.existsSync(cssPath)) return {};

    try {
      const content = fs.readFileSync(cssPath, "utf8");
      const ast = css.parse(content);
      const styles = {};

      ast.stylesheet.rules.forEach((rule) => {
        if (rule.type === "rule") {
          // Simplification: taking only the first class selector
          const selector = rule.selectors[0].replace(".", "");
          styles[selector] = {};

          rule.declarations.forEach((decl) => {
            if (decl.type !== "declaration") return;

            // Convert kebab-case (background-color) to camelCase (backgroundColor)
            const prop = decl.property.replace(/-([a-z])/g, (g) =>
              g[1].toUpperCase(),
            );

            if (styleConfig.isSupported(prop)) {
              let value = decl.value;
              if (value.endsWith("px")) value = parseInt(value);
              if (!isNaN(value) && typeof value !== "boolean")
                value = Number(value);

              styles[selector][prop] = value;
            } else {
              console.warn(
                `\x1b[33m[WebMAX Style Warning]\x1b[0m Property "${decl.property}" is not supported on Native. Skipping.`,
              );
            }
          });
        }
      });
      return styles;
    } catch (e) {
      console.error(
        `\x1b[31m[WebMAX Style Error]\x1b[0m Failed to parse CSS: ${e.message}`,
      );
      return {};
    }
  }
}

module.exports = WebMAXStyleProcessor;
