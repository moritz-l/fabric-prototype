"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var express_1 = __importDefault(require("express"));
var members_1 = __importDefault(require("../controllers/members"));
var router = express_1.default.Router();
router.get('/certificate/:memberId', members_1.default.readMemberCertificate);
module.exports = router;
