"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var getTimeStamp = function () {
    return new Date().toISOString();
};
var info = function (namespace, message, object) {
    if (object) {
        console.log("[" + getTimeStamp() + "] [INFO] [" + namespace + "] " + message, object);
    }
    else {
        console.log("[" + getTimeStamp() + "] [INFO] [" + namespace + "] " + message);
    }
};
var warn = function (namespace, message, object) {
    if (object) {
        console.log("[" + getTimeStamp() + "] [WARN] [" + namespace + "] " + message, object);
    }
    else {
        console.log("[" + getTimeStamp() + "] [WARN] [" + namespace + "] " + message);
    }
};
var error = function (namespace, message, object) {
    if (object) {
        console.log("[" + getTimeStamp() + "] [ERROR] [" + namespace + "] " + message, object);
    }
    else {
        console.log("[" + getTimeStamp() + "] [ERROR] [" + namespace + "] " + message);
    }
};
var debug = function (namespace, message, object) {
    if (object) {
        console.log("[" + getTimeStamp() + "] [DEBUG] [" + namespace + "] " + message, object);
    }
    else {
        console.log("[" + getTimeStamp() + "] [DEBUG] [" + namespace + "] " + message);
    }
};
exports.default = {
    info: info,
    warn: warn,
    error: error,
    debug: debug
};
