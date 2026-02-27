/**
 * A list of allowed styles that are guaranteed
 * to work equally well in Web (CSS) and Native (Flexbox/Yoga)
 */
export interface WebMAXStyles {
  display?: "flex" | "none";
  flexDirection?: "row" | "column";
  padding?: number | string;
  margin?: number | string;
  backgroundColor?: string;
  color?: string;
  fontSize?: number;
  fontWeight?: string | number;
  borderRadius?: number;
  borderWidth?: number;
  justifyContent?: "flex-start" | "center" | "flex-end" | "space-between";
  alignItems?: "flex-start" | "center" | "flex-end" | "stretch";
  width?: string | number;
  height?: string | number;
  opacity?: number;
}

/**
 * Basic props for all elements
 */
interface BaseProps {
  id?: string;
  class?: string;
  className?: string;
  style?: WebMAXStyles;
}

/**
 * Props for blocks with semantic support (SEO)
 */
export interface BoxProps extends BaseProps {
  semantic?: "section" | "header" | "footer" | "main" | "aside" | "nav" | "div";
}

/**
 * Props for text (SEO)
 */
export interface TextProps extends BaseProps {
  semantic?: "h1" | "h2" | "h3" | "h4" | "p" | "span" | "strong";
}

/**
 * WebMAX's Compiler
 */
export class Compiler {
  constructor(platform?: "web" | "native");
  /**
   * Compile .wm файл into proper format
   */
  compileFile(
    inputPath: string,
    outputPath: string,
    data: Record<string, any>,
  ): void;
}

/**
 * WebMAX's Engine
 */
export class Engine {
  constructor(platform?: "web" | "native");
  getTagName(type: string, semantic?: string): string;
  openTag(type: string, props?: any): string | object;
}

/**
 * WebMAX's Styles processor
 */
export class StyleProcessor {
  static parse(cssPath: string): Record<string, WebMAXStyles>;
}

export const WebMAXCompiler: typeof Compiler;
export const WebMAXEngine: typeof Engine;
