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

  async compileSFC(inputPath, outputPath) {
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

        data = typeof result === "function" ? result() : result;
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
        onopentag: (name, attribs) => {
          const processedProps = { ...attribs };

          if (this.platform === "web") {
            processedProps[scopeAttr] = "";
          }

          const className = attribs.class || attribs.className;
          if (className && styleMap[className]) {
            if (this.platform === "native") {
              processedProps.style = {
                ...(processedProps.style || {}),
                ...styleMap[className],
              };
            }
          }

          const actualTag = this.engine.getTagName(
            name,
            processedProps.semantic,
          );
          tagStack.push(actualTag);

          if (this.platform === "web") {
            output += this.engine.openTag(name, processedProps);
          } else {
            output.push(this.engine.openTag(name, processedProps));
          }
        },
        ontext: (text) => {
          const processedText = text.replace(/\{(\w+)\}/g, (match, key) => {
            return data && data[key] !== undefined ? String(data[key]) : match;
          });

          if (!processedText.trim()) return;

          if (this.platform === "web") {
            output += processedText;
          } else {
            output.push({ action: "TEXT", value: processedText.trim() });
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
    console.log(
      `\x1b[32m[WebMAX]\x1b[0m Compiled [${this.platform}] to ${outputPath}`,
    );
  }
}

module.exports = WebMAXCompiler;
