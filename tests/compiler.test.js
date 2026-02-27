import { describe, it, expect } from "vitest";
import { Compiler } from "../index";
import path from "path";
import fs from "fs";

describe("Compiler Snapshots", () => {
  const compilerWeb = new Compiler("web");
  const compilerNative = new Compiler("native");

  it("Should compile simple template to valid HTML (Web)", () => {
    const input = path.resolve(__dirname, "fixtures/basic.wm");
    const output = path.resolve(__dirname, "output/basic.html");

    compilerWeb.compileFile(input, output, { user: "Max" });

    const result = fs.readFileSync(output, "utf-8");
    expect(result).toMatchSnapshot();
  });

  it("Should compile simple template to valid JSON (Native)", () => {
    const input = path.resolve(__dirname, "fixtures/basic.wm");
    const output = path.resolve(__dirname, "output/basic.json");

    compilerNative.compileFile(input, output, { user: "Max" });

    const result = JSON.parse(fs.readFileSync(output, "utf-8"));
    expect(result).toMatchSnapshot();
  });

  it("Should handle complex nesting, semantic, symbols", () => {
    const input = path.resolve(__dirname, "fixtures/complex.wm");
    const outputWeb = path.resolve(__dirname, "output/complex.html");
    const outputNative = path.resolve(__dirname, "output/complex.json");

    const testData = {
      title: "WebMAX Ultimate Test",
      version: 0.1,
    };

    new Compiler("web").compileFile(input, outputWeb, testData);
    expect(fs.readFileSync(outputWeb, "utf-8")).toMatchSnapshot();

    new Compiler("native").compileFile(input, outputNative, testData);
    expect(
      JSON.parse(fs.readFileSync(outputNative, "utf-8")),
    ).toMatchSnapshot();
  });
});
