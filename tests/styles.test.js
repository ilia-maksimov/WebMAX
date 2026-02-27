import { describe, it, expect } from "vitest";
import { StyleProcessor } from "../index";
import fs from "fs";
import path from "path";

describe("StyleProcessor Logic", () => {
  it("Should convert px to numbers for Native", () => {
    const css = ".card { padding: 20px; border-radius: 10; }";
    const tempPath = path.resolve(__dirname, "test.css");
    fs.writeFileSync(tempPath, css);

    const styles = StyleProcessor.parse(tempPath);

    expect(styles.card.padding).toBe(20);
    expect(styles.card.borderRadius).toBe(10);

    fs.unlinkSync(tempPath);
  });

  it("StyleProcessor: corner cases", () => {
    const css = `
    .empty {}
    .units { 
      margin: 15px; 
      padding: 10; 
      width: 100%; 
      height: 50vh; 
    }
    .colors {
      background-color: #FFF;
      color: rgba(0,0,0,0.5);
    }
    .UPPERCASE { FONT-SIZE: 12PX; }
  `;
    const tempPath = path.resolve(__dirname, "dirty.css");
    fs.writeFileSync(tempPath, css);

    const styles = StyleProcessor.parse(tempPath);

    expect(styles.empty).toEqual({});

    expect(styles.units.margin).toBe(15);
    expect(styles.units.padding).toBe(10);
    expect(styles.units.width).toBe("100%");

    expect(styles.UPPERCASE.fontSize).toBe(12);

    fs.unlinkSync(tempPath);
  });
});
