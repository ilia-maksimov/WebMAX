const fs = require("fs");
const path = require("path");
const htmlparser2 = require("htmlparser2");
const WebMAXEngine = require("./engine");
const StyleProcessor = require("./styles"); // NEW

class WebMAXCompiler {
  constructor(platform = "web") {
    this.platform = platform;
    this.engine = new WebMAXEngine(platform);
  }

  compileFile(inputPath, outputPath, data) {
    const cssPath = inputPath.replace(".wm", ".css");
    const styleMap = StyleProcessor.parse(cssPath);

    const template = fs.readFileSync(inputPath, "utf8");
    let output = this.platform === "web" ? "" : [];
    const tagStack = [];

    const parser = new htmlparser2.Parser({
      onopentag: (name, attribs) => {
        const processedProps = { ...attribs };

        if (attribs.class && styleMap[attribs.class]) {
          if (this.platform === "native") {
            processedProps.style = {
              ...(processedProps.style || {}),
              ...styleMap[attribs.class],
            };
          }
        }

        const actualTag = this.engine.getTagName(name, processedProps.semantic);
        tagStack.push(actualTag);

        if (this.platform === "web") {
          output += this.engine.openTag(name, processedProps);
        } else {
          output.push(this.engine.openTag(name, processedProps));
        }
      },
      ontext: (text) => {
        const processedText = text
          .replace(/{(\w+)}/g, (match, key) => data[key] || match)
          .trim();
        if (!processedText) return;

        if (this.platform === "web") {
          output += processedText;
        } else {
          output.push({ action: "TEXT", value: processedText });
        }
      },
      onclosetag: (name) => {
        const lastTag = tagStack.pop();
        if (this.platform === "web") {
          output += `</${lastTag}>`;
        } else {
          const nativeType =
            name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
          output.push({ action: "END_NODE", type: nativeType });
        }
      },
    });

    parser.write(template);
    parser.end();

    // Finalizing output
    let finalResult;
    if (this.platform === "web") {
      finalResult = `<!DOCTYPE html><html><head><link rel="stylesheet" href="${path.basename(cssPath)}"></head><body>${output}</body></html>`;

      if (fs.existsSync(cssPath)) {
        fs.copyFileSync(
          cssPath,
          path.join(path.dirname(outputPath), path.basename(cssPath)),
        );
      }
    } else {
      finalResult = JSON.stringify(
        { platform: "native", tree: output },
        null,
        2,
      );
    }

    const outputDir = path.dirname(outputPath);
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

    fs.writeFileSync(outputPath, finalResult);
    console.log(`[WebMAX] Compiled [${this.platform}] to ${outputPath}`);
  }
}

module.exports = WebMAXCompiler;
