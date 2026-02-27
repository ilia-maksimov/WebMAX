import { describe, it, expect } from "vitest";
import StyleProcessor from "../styles";

describe("StyleProcessor Logic", () => {
  it("Should convert px to numbers for Native and scope styles", () => {
    const css = ".card { padding: 20px; border-radius: 10; }";

    const { styleMap, scopedCSS } = StyleProcessor.processScoped(css, "a1b2c3");

    expect(styleMap.card.padding).toBe(20);
    expect(styleMap.card.borderRadius).toBe(10);

    expect(scopedCSS).toContain(".card[data-wm-a1b2c3]");
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

    const { styleMap } = StyleProcessor.processScoped(css, "corner");

    expect(styleMap.empty).toEqual({});

    expect(styleMap.units.margin).toBe(15);
    expect(styleMap.units.padding).toBe(10);
    expect(styleMap.units.width).toBe("100%");

    expect(styleMap.UPPERCASE.fontSize).toBe(12);
  });
});
