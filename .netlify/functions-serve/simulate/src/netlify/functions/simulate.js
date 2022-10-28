var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __markAsModule = (target) => __defProp(target, "__esModule", { value: true });
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __reExport = (target, module2, copyDefault, desc) => {
  if (module2 && typeof module2 === "object" || typeof module2 === "function") {
    for (let key of __getOwnPropNames(module2))
      if (!__hasOwnProp.call(target, key) && (copyDefault || key !== "default"))
        __defProp(target, key, { get: () => module2[key], enumerable: !(desc = __getOwnPropDesc(module2, key)) || desc.enumerable });
  }
  return target;
};
var __toESM = (module2, isNodeMode) => {
  return __reExport(__markAsModule(__defProp(module2 != null ? __create(__getProtoOf(module2)) : {}, "default", !isNodeMode && module2 && module2.__esModule ? { get: () => module2.default, enumerable: true } : { value: module2, enumerable: true })), module2);
};

// node_modules/web-worker/cjs/node.js
var require_node = __commonJS({
  "node_modules/web-worker/cjs/node.js"(exports2, module2) {
    var URL = require("url");
    var VM = require("vm");
    var threads = require("worker_threads");
    var WORKER = Symbol.for("worker");
    var EVENTS = Symbol.for("events");
    var EventTarget = class {
      constructor() {
        Object.defineProperty(this, EVENTS, {
          value: /* @__PURE__ */ new Map()
        });
      }
      dispatchEvent(event) {
        event.target = event.currentTarget = this;
        if (this["on" + event.type]) {
          try {
            this["on" + event.type](event);
          } catch (err) {
            console.error(err);
          }
        }
        const list = this[EVENTS].get(event.type);
        if (list == null)
          return;
        list.forEach((handler) => {
          try {
            handler.call(this, event);
          } catch (err) {
            console.error(err);
          }
        });
      }
      addEventListener(type, fn) {
        let events = this[EVENTS].get(type);
        if (!events)
          this[EVENTS].set(type, events = []);
        events.push(fn);
      }
      removeEventListener(type, fn) {
        let events = this[EVENTS].get(type);
        if (events) {
          const index = events.indexOf(fn);
          if (index !== -1)
            events.splice(index, 1);
        }
      }
    };
    function Event(type, target) {
      this.type = type;
      this.timeStamp = Date.now();
      this.target = this.currentTarget = this.data = null;
    }
    module2.exports = threads.isMainThread ? mainThread() : workerThread();
    var baseUrl = URL.pathToFileURL(process.cwd() + "/");
    function mainThread() {
      class Worker2 extends EventTarget {
        constructor(url, options) {
          super();
          const {
            name,
            type
          } = options || {};
          url += "";
          let mod;
          if (/^data:/.test(url)) {
            mod = url;
          } else {
            mod = URL.fileURLToPath(new URL.URL(url, baseUrl));
          }
          const worker = new threads.Worker(__filename, {
            workerData: {
              mod,
              name,
              type
            }
          });
          Object.defineProperty(this, WORKER, {
            value: worker
          });
          worker.on("message", (data) => {
            const event = new Event("message");
            event.data = data;
            this.dispatchEvent(event);
          });
          worker.on("error", (error) => {
            error.type = "error";
            this.dispatchEvent(error);
          });
          worker.on("exit", () => {
            this.dispatchEvent(new Event("close"));
          });
        }
        postMessage(data, transferList) {
          this[WORKER].postMessage(data, transferList);
        }
        terminate() {
          this[WORKER].terminate();
        }
      }
      Worker2.prototype.onmessage = Worker2.prototype.onerror = Worker2.prototype.onclose = null;
      return Worker2;
    }
    function workerThread() {
      let {
        mod,
        name,
        type
      } = threads.workerData;
      const self = global.self = global;
      let q = [];
      function flush() {
        const buffered = q;
        q = null;
        buffered.forEach((event) => {
          self.dispatchEvent(event);
        });
      }
      threads.parentPort.on("message", (data) => {
        const event = new Event("message");
        event.data = data;
        if (q == null)
          self.dispatchEvent(event);
        else
          q.push(event);
      });
      threads.parentPort.on("error", (err) => {
        err.type = "Error";
        self.dispatchEvent(err);
      });
      class WorkerGlobalScope extends EventTarget {
        postMessage(data, transferList) {
          threads.parentPort.postMessage(data, transferList);
        }
        close() {
          process.exit();
        }
      }
      let proto = Object.getPrototypeOf(global);
      delete proto.constructor;
      Object.defineProperties(WorkerGlobalScope.prototype, proto);
      proto = Object.setPrototypeOf(global, new WorkerGlobalScope());
      ["postMessage", "addEventListener", "removeEventListener", "dispatchEvent"].forEach((fn) => {
        proto[fn] = proto[fn].bind(global);
      });
      global.name = name;
      const isDataUrl = /^data:/.test(mod);
      if (type === "module") {
        import(mod).catch((err) => {
          if (isDataUrl && err.message === "Not supported") {
            console.warn("Worker(): Importing data: URLs requires Node 12.10+. Falling back to classic worker.");
            return evaluateDataUrl(mod, name);
          }
          console.error(err);
        }).then(flush);
      } else {
        try {
          if (/^data:/.test(mod)) {
            evaluateDataUrl(mod, name);
          } else {
            require(mod);
          }
        } catch (err) {
          console.error(err);
        }
        Promise.resolve().then(flush);
      }
    }
    function evaluateDataUrl(url, name) {
      const {
        data
      } = parseDataUrl(url);
      return VM.runInThisContext(data, {
        filename: "worker.<" + (name || "data:") + ">"
      });
    }
    function parseDataUrl(url) {
      let [m, type, encoding, data] = url.match(/^data: *([^;,]*)(?: *; *([^,]*))? *,(.*)$/) || [];
      if (!m)
        throw Error("Invalid Data URL.");
      if (encoding)
        switch (encoding.toLowerCase()) {
          case "base64":
            data = Buffer.from(data, "base64").toString();
            break;
          default:
            throw Error('Unknown Data URL encoding "' + encoding + '"');
        }
      return {
        type,
        data
      };
    }
  }
});

// netlify/functions/simulate.js
var import_web_worker = __toESM(require_node());
exports.handler = async function(event, context) {
  try {
    let sendError = function(errorMsg) {
      return {
        statusCode: 404,
        body: JSON.stringify({
          error: errorMsg,
          inputs: p
        })
      };
    };
    const p = event.queryStringParameters;
    const parameter_names = [
      "postcode",
      "latitude",
      "longitude",
      "occupants",
      "temperature",
      "space_heating",
      "floor_area",
      "tes_max"
    ];
    let undefined_parameter = false;
    for (const name of parameter_names) {
      const value = p[name];
      if (value == void 0) {
        undefined_parameter = true;
      }
    }
    if (!undefined_parameter) {
      if (isNaN(p.floor_area) || p.floor_area < 25 || p.floor_area > 1500) {
        return sendError(`The floor area is set to: ${p.floor_area}. This is either not a number, less than 25 m^2, or greater than 1500m^2`);
      } else if (isNaN(p.tes_max) || p.tes_max < 0.1 || p.tes_max > 3) {
        return sendError(`The tes-max is set to: ${p.tes_max}. This is either not a number, less than 0.1 m^3, or greater than 3.0m^3`);
      } else {
        const worker = new import_web_worker.default("./pkg/webworker.cjs");
        const result = await new Promise((resolve, reject) => {
          worker.addEventListener("message", (e) => {
            resolve(e.data);
          });
          setTimeout(() => {
            resolve("timeout");
          }, 9500);
          worker.postMessage(p);
        });
        if (result === "timeout") {
          return sendError(`simulation exceeded allowed runtime of 9500ms`);
        } else {
          return {
            statusCode: 200,
            body: JSON.stringify({
              inputs: p,
              result: JSON.parse(result)
            })
          };
        }
      }
    } else {
      let url = event.headers.host + event.path;
      return sendError(`not all parameters defined. Example parameters: ${url}?postcode=CV47AL&latitude=52.3833&longitude=-1.5833&occupants=2&temperature=20&space_heating=3000&floor_area=60&tes_max=0.5`);
    }
  } catch (error) {
    return {
      statusCode: 404,
      body: JSON.stringify({ error: `An unhandled error occured. ${error}` })
    };
  }
};
//# sourceMappingURL=simulate.js.map
