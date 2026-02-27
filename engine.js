class WebMAXEngine {
  constructor(platform = "web") {
    this.platform = platform;
    this.tagMap = {
      view: "div",
      text: "span",
      action: "button",
    };
  }

  getTagName(type, semantic) {
    const lowerType = type.toLowerCase();
    if (this.platform === "web") {
      if (lowerType === "view") return semantic || this.tagMap.view;
      if (lowerType === "text") return semantic || this.tagMap.text;
      if (lowerType === "action") return this.tagMap.action;
      return lowerType;
    }
    return type;
  }

  /**
   * Generates opening tag
   */
  openTag(type, props = {}) {
    const tag = this.getTagName(type, props.semantic);

    if (this.platform === "web") {
      const className = props.class || props.className || "";
      const classAttr = className ? ` class="${className}"` : "";

      let styleAttr = "";
      if (props.style && typeof props.style === "object") {
        const styleString = Object.entries(props.style)
          .map(
            ([k, v]) =>
              `${k.replace(/([A-Z])/g, "-$1").toLowerCase()}: ${v}${typeof v === "number" ? "px" : ""}`,
          )
          .join("; ");
        styleAttr = styleString ? ` style="${styleString}"` : "";
      }

      return `<${tag}${classAttr}${styleAttr} data-wm-type="${type.toLowerCase()}">`;
    }

    const nativeType =
      type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();
    return { action: "START_NODE", type: nativeType, props };
  }
}

module.exports = WebMAXEngine;
