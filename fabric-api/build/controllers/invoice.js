"use strict";
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
var fabric_1 = __importDefault(require("../functions/fabric"));
var constants_1 = __importDefault(require("../functions/constants"));
/**
 * Delete an invoice
 */
var deleteInvoice = function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var username, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                username = req.app.locals.config.username;
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                return [4 /*yield*/, fabric_1.default.submitTransaction(req.app.locals.config, username, constants_1.default.invoice_contract, 'deleteInvoice', [req.params.invoiceId])];
            case 2:
                _a.sent();
                return [2 /*return*/, res.status(200).json({
                        message: "deleted invoice " + req.params.invoiceId
                    })];
            case 3:
                error_1 = _a.sent();
                next(error_1);
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); };
/**
 * Update an invoice
 */
var updateInvoice = function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var status, username, _a, error_2;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                status = req.body.status;
                if (!status) {
                    return [2 /*return*/, res.status(400).json({
                            message: "no status provided for invoice " + req.params.invoiceId
                        })];
                }
                username = req.app.locals.config.username;
                _b.label = 1;
            case 1:
                _b.trys.push([1, 8, , 9]);
                _a = status;
                switch (_a) {
                    case 'rejected': return [3 /*break*/, 2];
                    case 'accepted': return [3 /*break*/, 4];
                }
                return [3 /*break*/, 6];
            case 2: return [4 /*yield*/, fabric_1.default.submitTransaction(req.app.locals.config, username, constants_1.default.invoice_contract, 'rejectInvoice', [req.params.invoiceId])];
            case 3:
                _b.sent();
                _b.label = 4;
            case 4: return [4 /*yield*/, fabric_1.default.submitTransaction(req.app.locals.config, username, constants_1.default.invoice_contract, 'acceptInvoice', [req.params.invoiceId])];
            case 5:
                _b.sent();
                _b.label = 6;
            case 6:
                {
                }
                _b.label = 7;
            case 7: return [2 /*return*/, res.status(200).json({
                    message: "updated invoice " + req.params.invoiceId
                })];
            case 8:
                error_2 = _b.sent();
                next(error_2);
                return [3 /*break*/, 9];
            case 9: return [2 /*return*/];
        }
    });
}); };
/**
 * Read an invoice
 */
var readInvoice = function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var username, invoice, privateResult, error_3, error_4;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                username = req.app.locals.config.username;
                return [2 /*return*/, res.status(200).json({
                        test: 'sdälfäsd'
                    })];
            case 1:
                _a.trys.push([1, 7, , 8]);
                return [4 /*yield*/, fabric_1.default.evaluateTransaction(req.app.locals.config, username, constants_1.default.invoice_contract, 'readInvoice', [req.params.invoiceId])];
            case 2:
                invoice = _a.sent();
                privateResult = void 0;
                _a.label = 3;
            case 3:
                _a.trys.push([3, 5, , 6]);
                return [4 /*yield*/, fabric_1.default.evaluateTransaction(req.app.locals.config, username, constants_1.default.invoice_contract, 'readInvoicePrivateData', [req.params.invoiceId])];
            case 4:
                privateResult = _a.sent();
                return [3 /*break*/, 6];
            case 5:
                error_3 = _a.sent();
                return [3 /*break*/, 6];
            case 6:
                if (!privateResult) {
                    return [2 /*return*/, res.status(200).json({
                            invoice: JSON.parse(invoice)
                        })];
                }
                else {
                    return [2 /*return*/, res.status(200).json({
                            invoice: JSON.parse(invoice),
                            privateData: JSON.parse(privateResult)
                        })];
                }
                return [3 /*break*/, 8];
            case 7:
                error_4 = _a.sent();
                next(error_4);
                return [3 /*break*/, 8];
            case 8: return [2 /*return*/];
        }
    });
}); };
exports.default = { deleteInvoice: deleteInvoice, updateInvoice: updateInvoice, readInvoice: readInvoice };
