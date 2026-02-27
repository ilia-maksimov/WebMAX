/**
 * @file style-config.js
 * Allowed properties that work on both Web & Native
 */

const ALLOWED_PROPS = new Set([
  "display",
  "flexDirection",
  "justifyContent",
  "alignItems",
  "padding",
  "margin",
  "backgroundColor",
  "color",
  "fontSize",
  "fontWeight",
  "borderRadius",
  "borderWidth",
  "width",
  "height",
  "opacity",
]);

module.exports = {
  isSupported: (prop) => ALLOWED_PROPS.has(prop),
  // Map some CSS defaults to Native defaults
  defaults: {
    display: "flex",
    flexDirection: "column",
  },
};
