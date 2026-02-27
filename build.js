const Compiler = require("./compiler");
const webmax = new Compiler("web");

webmax.compileFile("./src/index.wm", "./dist/index.html", {
  projectName: "WebMAX Framework",
});
