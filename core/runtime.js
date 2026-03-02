window.WebMAX = {
  hydrate(componentData) {
    const bindings = {};
    const methods = componentData.methods || {};

    document.querySelectorAll("[data-wm-bind]").forEach((el) => {
      const key = el.getAttribute("data-wm-bind");
      if (!bindings[key]) bindings[key] = [];
      bindings[key].push(el);
    });

    document.addEventListener("click", (e) => {
      const target = e.target.closest("[data-wm-on-click]");
      if (target) {
        const methodName = target.getAttribute("data-wm-on-click");
        if (methods[methodName]) {
          methods[methodName].call(window.state);
        } else {
          new Function(methodName).call(window.state);
        }
      }
    });

    window.state = new Proxy(componentData.data || {}, {
      set(target, key, value) {
        target[key] = value;
        if (bindings[key]) {
          bindings[key].forEach((el) => {
            el.textContent = value;
          });
        }
        return true;
      },
    });

    console.log("WebMAX Hydrated 🚀");

    return state;
  },
};
