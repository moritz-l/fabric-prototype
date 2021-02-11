"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var createSession = function (req, res, next) {
    return res.status(200).json({
        message: 'jupp, new bearer'
    });
};
exports.default = { createSession: createSession };
