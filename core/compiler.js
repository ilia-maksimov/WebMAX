const fs = require("fs");
const path = require("path");
const htmlparser2 = require("htmlparser2");
const WebMAXEngine = require("./engine");
const StyleProcessor = require("./styles");

class WebMAXCompiler {
  constructor(platform = "web") {
    this.platform = platform;
    this.engine = new WebMAXEngine(platform);
  }

  async compile(inputPath, outputPath, dynamicData) {
    const content = fs.readFileSync(inputPath, "utf8");

    const componentName = path.basename(inputPath, ".wm");
    const componentId = Buffer.from(componentName).toString("hex").slice(0, 6);
    const scopeAttr = `data-wm-${componentId}`;

    const extract = (tag) => {
      const regex = new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`, "i");
      const match = content.match(regex);
      return match ? match[1].trim() : "";
    };

    const templateRaw = extract("template");
    const scriptContent = extract("script");
    const cssContent = extract("style");

    let data = {};
    if (scriptContent.trim()) {
      try {
        const code = scriptContent
          .replace(/export\s+default\s+/, "return ")
          .trim();

        const result = new Function(code)();
        this.lastExtractedData =
          typeof result === "function" ? result() : result;
        data = this.lastExtractedData;
      } catch (e) {
        console.error(`\x1b[31m[WebMAX Script Error]\x1b[0m: ${e.message}`);
      }
    }

    const { styleMap, scopedCSS } = StyleProcessor.processScoped(
      cssContent,
      componentId,
    );

    let output = this.platform === "web" ? "" : [];
    const tagStack = [];

    const templateParser = new htmlparser2.Parser(
      {
        onopentag: (name, attributes) => {
          const currentScopeId = componentId;

          const props = {};
          const events = {};

          Object.entries(attributes).forEach(([key, val]) => {
            if (key.startsWith("on")) {
              const eventName = key.slice(2).toLowerCase();
              events[eventName] = val;
            } else {
              props[key] = val;
            }
          });
          props.events = events;

          const actualTag = this.engine.getTagName(name, props.semantic);

          tagStack.push(actualTag);

          if (this.platform === "web") {
            output += this.engine.openTag(name, props, currentScopeId);
          } else {
            output.push(this.engine.openTag(name, props));
          }
        },

        ontext: (text) => {
          const regex = /\{(\w+)\}/g;
          let lastIndex = 0;
          let match;

          if (!text.match(regex)) {
            const cleanText = text.trim();
            if (!cleanText) return;
            if (this.platform === "web") {
              output += text;
            } else {
              output.push({ action: "TEXT", value: cleanText });
            }
            return;
          }

          while ((match = regex.exec(text)) !== null) {
            const staticPart = text.slice(lastIndex, match.index);
            const varName = match[1];
            const initialValue =
              data[varName] !== undefined ? data[varName] : `{${varName}}`;

            if (staticPart) {
              if (this.platform === "web") output += staticPart;
              else output.push({ action: "TEXT", value: staticPart });
            }

            if (this.platform === "web") {
              output += `<span data-wm-bind="${varName}">${initialValue}</span>`;
            } else {
              output.push({
                action: "TEXT",
                value: String(initialValue),
                binding: varName,
              });
            }
            lastIndex = regex.lastIndex;
          }

          const tail = text.slice(lastIndex);
          if (tail) {
            if (this.platform === "web") output += tail;
            else output.push({ action: "TEXT", value: tail });
          }
        },

        onclosetag: (name) => {
          const lastTag = tagStack.pop();

          if (this.platform === "web") {
            output += `</${lastTag}>`;
          } else {
            const nativeType = this.engine.getTagName(name);
            output.push({ action: "END_NODE", type: nativeType });
          }
        },
      },
      { decodeEntities: true },
    );

    templateParser.write(templateRaw);
    templateParser.end();

    this.saveOutput(output, scopedCSS, outputPath);
  }

  saveOutput(content, css, outputPath) {
    const outputDir = path.dirname(outputPath);
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

    const runtimePath = path.join(__dirname, "runtime.js");
    const runtimeCode = fs.existsSync(runtimePath)
      ? fs.readFileSync(runtimePath, "utf8")
      : "// Runtime not found";

    let finalResult;
    if (this.platform === "web") {
      finalResult = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>${css}</style>
</head>
<body>
  ${content}
  <script>
    ${runtimeCode} 
    window.state = WebMAX.hydrate({
      data: ${JSON.stringify(this.lastExtractedData || {})}
    });
  </script>
</body>
</html>`;
    } else {
      finalResult = JSON.stringify(
        {
          platform: "native",
          compiledAt: new Date().toISOString(),
          tree: content,
        },
        null,
        2,
      );
    }

    fs.writeFileSync(outputPath, finalResult);
  }
}

module.exports = WebMAXCompiler;
