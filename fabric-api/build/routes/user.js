"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var express_1 = __importDefault(require("express"));
var user_1 = __importDefault(require("../controllers/user"));
var router = express_1.default.Router();
router.post('/register', user_1.default.register);
router.post('/login', user_1.default.login);
module.exports = router;
