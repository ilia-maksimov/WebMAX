const WebMAXEngine = require("./engine");

const engine = new WebMAXEngine("web");

module.exports = {
  View: (props, ...children) =>
    engine.createElement("View", props, ...children),
  Text: (props, ...children) =>
    engine.createElement("Text", props, ...children),
  Action: (props, ...children) =>
    engine.createElement("Action", props, ...children),

  compile: (platform) => new WebMAXEngine(platform),
};
