var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __markAsModule = (target) => __defProp(target, "__esModule", { value: true });
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

// netlify/functions/simulate.js
var import_web_worker = __toESM(require("web-worker"));
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
