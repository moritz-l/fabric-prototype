"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var express_1 = __importDefault(require("express"));
var invoice_1 = __importDefault(require("../controllers/invoice"));
var router = express_1.default.Router();
router.get('/:invoiceId', invoice_1.default.readInvoice);
router.post('/:invoiceId', invoice_1.default.updateInvoice);
router.delete('/:invoiceId', invoice_1.default.deleteInvoice);
module.exports = router;
