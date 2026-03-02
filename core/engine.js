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

  openTag(type, props = {}, scopeId = null) {
    const tag = this.getTagName(type, props.semantic);
    const { events = {}, ...otherProps } = props;

    if (this.platform === "web") {
      const attrString = Object.entries(otherProps)
        .filter(([key]) => key !== "semantic")
        .map(([key, val]) => `${key}="${val}"`)
        .join(" ");

      const eventAttrs = Object.entries(events)
        .map(([evt, method]) => `data-wm-on-${evt}="${method}"`)
        .join(" ");

      const scopeAttr = scopeId ? `data-wm-${scopeId}` : "";
      const typeAttr = `data-wm-type="${type.toLowerCase()}"`;

      const allAttrs = [attrString, eventAttrs, scopeAttr, typeAttr]
        .filter(Boolean)
        .join(" ");

      return `<${tag} ${allAttrs}>`;
    }

    // Native
    return { action: "START_NODE", type: tag, props: { ...props, events } };
  }
}

module.exports = WebMAXEngine;
