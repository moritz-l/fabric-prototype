"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var bcryptjs_1 = __importDefault(require("bcryptjs"));
var logging_1 = __importDefault(require("../config/logging"));
var fabric_1 = __importDefault(require("../functions/fabric"));
var crypto = __importStar(require("crypto"));
var NAMESPACE = 'User';
/*
 * This is not finished
 */
var validateToken = function (req, res, next) {
    logging_1.default.info(NAMESPACE, 'Token validated, user authorized.');
    return res.status(200).json({
        message: 'Token(s) validated'
    });
};
var register = function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var user, salt, hashedPassword, username, _a, publicKey, privateKey, error_1;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                user = {
                    username: req.body.username,
                    password: req.body.password,
                    orgname: req.body.orgname
                };
                return [4 /*yield*/, bcryptjs_1.default.genSalt(10)];
            case 1:
                salt = _b.sent();
                return [4 /*yield*/, bcryptjs_1.default.hash(user.password, salt)];
            case 2:
                hashedPassword = _b.sent();
                username = req.app.locals.config.username;
                _b.label = 3;
            case 3:
                _b.trys.push([3, 6, , 7]);
                // Create the wallet
                fabric_1.default.enrollNewUser(req.app.locals.config, user.username);
                _a = crypto.generateKeyPairSync('rsa', {
                    modulusLength: 4096
                }), publicKey = _a.publicKey, privateKey = _a.privateKey;
                // Add the user info to the blockchain
                return [4 /*yield*/, fabric_1.default.submitTransaction(req.app.locals.config, user.username, 'user_contract', 'createUser', [user.username, hashedPassword, salt])];
            case 4:
                // Add the user info to the blockchain
                _b.sent();
                // Enroll the organisation
                return [4 /*yield*/, fabric_1.default.submitTransaction(req.app.locals.config, user.username, 'user_contract', 'createUser', [user.username, hashedPassword, salt])];
            case 5:
                // Enroll the organisation
                _b.sent();
                return [2 /*return*/, res.status(200).json({
                        message: "User " + user.username + " has been registered",
                        privateKey: privateKey.export.toString()
                    })];
            case 6:
                error_1 = _b.sent();
                next(error_1);
                return [3 /*break*/, 7];
            case 7: return [2 /*return*/];
        }
    });
}); };
var login = function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var user, username, userexists, error, userInfoAsString, userInfo, hashedStoredPassword, hashedProvidedPassword, error_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                user = {
                    username: req.body.username,
                    password: req.body.password
                };
                username = req.app.locals.config.username;
                _a.label = 1;
            case 1:
                _a.trys.push([1, 6, , 7]);
                return [4 /*yield*/, fabric_1.default.userExists(user.username, req.app.locals.config)];
            case 2:
                userexists = _a.sent();
                if (userexists == false) {
                    error = new Error();
                    error.message = "User " + user.username + " does not exist";
                    throw error;
                }
                return [4 /*yield*/, fabric_1.default.evaluateTransaction(req.app.locals.config, user.username, 'user_contract', 'readUser', [user.username])];
            case 3:
                userInfoAsString = _a.sent();
                userInfo = JSON.parse(userInfoAsString);
                return [4 /*yield*/, bcryptjs_1.default.hash(user.password, userInfo.salt)];
            case 4:
                hashedStoredPassword = _a.sent();
                return [4 /*yield*/, bcryptjs_1.default.hash(userInfo.password, userInfo.salt)];
            case 5:
                hashedProvidedPassword = _a.sent();
                if (hashedProvidedPassword != hashedStoredPassword) {
                    return [2 /*return*/, res.status(400).json({
                            message: "Login for user " + user.username + " failed"
                        })];
                }
                // Send login confirmation
                return [2 /*return*/, res.status(200).json({
                        message: "User " + user.username + " has been logged in"
                    })];
            case 6:
                error_2 = _a.sent();
                next(error_2);
                return [3 /*break*/, 7];
            case 7: return [2 /*return*/];
        }
    });
}); };
exports.default = { validateToken: validateToken, register: register, login: login };
