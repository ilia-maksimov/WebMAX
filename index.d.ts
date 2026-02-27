// index.d.ts

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
  borderRadius?: number;
  justifyContent?: "flex-start" | "center" | "flex-end" | "space-between";
  alignItems?: "flex-start" | "center" | "flex-end" | "stretch";
  width?: string | number;
  height?: string | number;
}

/**
 * Basic props for all elements
 */
interface BaseProps {
  id?: string;
  className?: string;
  style?: WebMAXStyles;
  children?: any;
}

/**
 * Props for blocks with semantic support (SEO)
 */
export interface BoxProps extends BaseProps {
  semantic?: "section" | "header" | "footer" | "main" | "aside" | "nav";
}

/**
 * Props for text (SEO)
 */
export interface TextProps extends BaseProps {
  semantic?: "h1" | "h2" | "h3" | "h4" | "p" | "span" | "strong";
}

/**
 * WebMAX's main facility
 */
export const View: (props: BoxProps) => any;
export const Text: (props: TextProps) => any;
export const Action: (props: BaseProps & { onPress?: () => void }) => any;

export function compile(platform: "web" | "native"): any;
