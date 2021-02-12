"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var express_1 = __importDefault(require("express"));
var sessions_1 = __importDefault(require("../controllers/sessions"));
var router = express_1.default.Router();
router.post('/new', sessions_1.default.createSession);
module.exports = router;
