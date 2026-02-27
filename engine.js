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

    return type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();
  }

  openTag(type, props = {}) {
    const tag = this.getTagName(type, props.semantic);

    if (this.platform === "web") {
      const attributes = Object.entries(props)
        .filter(([k]) => k !== "style" && k !== "semantic")
        .map(([k, v]) => (v === "" ? k : `${k}="${v}"`))
        .join(" ");

      const attrString = attributes ? ` ${attributes}` : "";

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

      return `<${tag}${attrString}${styleAttr} data-wm-type="${type.toLowerCase()}">`;
    }

    const nativeType =
      type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();
    return { action: "START_NODE", type: nativeType, props };
  }
}

module.exports = WebMAXEngine;
