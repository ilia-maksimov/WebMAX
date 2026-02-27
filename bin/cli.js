#!/usr/bin/env node

/**
 * @file bin/cli.js
 * WebMAX Command Line Interface
 */

const path = require("path");
const fs = require("fs");
const WebMAXCompiler = require("../compiler");

async function run() {
  // 1. Parse Arguments
  const args = process.argv.slice(2);
  const params = {};

  args.forEach((val, index) => {
    if (val.startsWith("--")) {
      const key = val.slice(2);
      params[key] = args[index + 1];
    }
  });

  // 2. Setup Configuration
  const input = params.input || "src/index.wm";
  const output = params.output || "dist/index.html";
  const platform = params.platform || "web";

  console.log(
    `\x1b[34m%s\x1b[0m`,
    `--- WebMAX Compiler v${require("../package.json").version} ---`,
  );

  try {
    const inputPath = path.resolve(process.cwd(), input);
    const outputPath = path.resolve(process.cwd(), output);

    // 3. Load Pre-render Logic (.data.js)
    const dataPath = inputPath.replace(".wm", ".data.js");
    let dynamicData = {};

    if (fs.existsSync(dataPath)) {
      // Clear cache to allow fresh data on every run if used in dev-server later
      delete require.cache[require.resolve(dataPath)];
      const dataModule = require(dataPath);

      // Execute if it's a function (supports async), otherwise use as object
      dynamicData =
        typeof dataModule === "function" ? await dataModule() : dataModule;

      console.log(
        "\x1b[36m%s\x1b[0m",
        `ℹ Loaded data from: ${path.basename(dataPath)}`,
      );
    } else {
      console.log(
        "\x1b[33m%s\x1b[0m",
        `⚠ No data file found at ${path.basename(dataPath)}. Using empty data.`,
      );
    }

    // 4. Compile
    const compiler = new WebMAXCompiler(platform);
    compiler.compileFile(inputPath, outputPath, dynamicData);

    console.log("\x1b[32m%s\x1b[0m", `✔ Successfully compiled [${platform}]`);
    console.log(`  Source: ${input}`);
    console.log(`  Output: ${output}`);
  } catch (error) {
    console.error(
      "\x1b[31m%s\x1b[0m",
      `✖ Compilation failed: ${error.message}`,
    );
    process.exit(1);
  }
}

run();
