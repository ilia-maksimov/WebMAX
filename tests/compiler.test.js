import { describe, it, expect } from "vitest";
import WebMAXCompiler from "../compiler";
import path from "path";
import fs from "fs";

describe("Compiler Snapshots", () => {
  const compilerWeb = new WebMAXCompiler("web");
  const compilerNative = new WebMAXCompiler("native");

  it("Should compile simple template to valid HTML (Web)", async () => {
    const input = path.resolve(__dirname, "fixtures/basic.wm");
    const output = path.resolve(__dirname, "output/basic.html");

    await compilerWeb.compileSFC(input, output);

    const result = fs.readFileSync(output, "utf-8");
    expect(result).toMatchSnapshot();
  });

  it("Should compile simple template to valid JSON (Native)", async () => {
    const input = path.resolve(__dirname, "fixtures/basic.wm");
    const output = path.resolve(__dirname, "output/basic.json");

    await compilerNative.compileSFC(input, output);

    const result = JSON.parse(fs.readFileSync(output, "utf-8"));
    expect(result).toMatchSnapshot();
  });

  it("Should handle complex nesting, semantic, symbols", async () => {
    const input = path.resolve(__dirname, "fixtures/complex.wm");
    const outputWeb = path.resolve(__dirname, "output/complex.html");
    const outputNative = path.resolve(__dirname, "output/complex.json");

    await compilerWeb.compileSFC(input, outputWeb);
    expect(fs.readFileSync(outputWeb, "utf-8")).toMatchSnapshot();

    await compilerNative.compileSFC(input, outputNative);
    expect(
      JSON.parse(fs.readFileSync(outputNative, "utf-8")),
    ).toMatchSnapshot();
  });
});
