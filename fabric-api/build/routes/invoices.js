"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var express_1 = __importDefault(require("express"));
var invoices_1 = __importDefault(require("../controllers/invoices"));
var router = express_1.default.Router();
router.get('/list', invoices_1.default.readInvoiceList);
router.post('/new', invoices_1.default.createInvoice);
module.exports = router;
