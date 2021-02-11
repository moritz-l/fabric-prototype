"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var http_1 = __importDefault(require("http"));
var express_1 = __importDefault(require("express"));
var body_parser_1 = __importDefault(require("body-parser"));
var logging_1 = __importDefault(require("./config/logging"));
var config_1 = __importDefault(require("./config/config"));
var invoices_1 = __importDefault(require("./routes/invoices"));
var invoice_1 = __importDefault(require("./routes/invoice"));
var members_1 = __importDefault(require("./routes/members"));
var sessions_1 = __importDefault(require("./routes/sessions"));
var NAMESPACE = 'Server';
var router = express_1.default();
// Log the request
router.use(function (req, res, next) {
    // At invoke
    logging_1.default.info(NAMESPACE, "METHOD - [" + req.method + "], URL - [" + req.url + "], IP - [" + req.socket.remoteAddress + "]");
    // At finish
    res.on('finish', function () {
        logging_1.default.info(NAMESPACE, "METHOD - [" + req.method + "], URL - [" + req.url + "], IP - [" + req.socket.remoteAddress + ", STATUS - [" + res.statusCode + "]");
    });
    // Continue
    next();
});
// Parse the request
router.use(body_parser_1.default.urlencoded({ extended: false }));
router.use(body_parser_1.default.json());
// Define rules of the API
router.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    // Allowed HTTP-Headers
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    // Accepted Methods
    if (req.method == 'OPTIONS') {
        res.header('Access-Control-Allow-Methods', 'GET DELETE POST PUT');
        return res.status(200).json({});
    }
    // Continue
    next();
});
// Routing
router.use('/invoices', invoices_1.default);
router.use('/invoice', invoice_1.default);
router.use('/members', members_1.default);
router.use('/sessions', sessions_1.default);
// Error handling
router.use(function (req, res, next) {
    var error = new Error('ressource not found');
    return res.status(404).json({
        message: error.message
    });
    // Continue
    next();
});
// Create the server
var httpServer = http_1.default.createServer(router);
httpServer.listen(config_1.default.server.port, function () { return logging_1.default.info(NAMESPACE, "Server running on " + config_1.default.server.hostname + ":" + config_1.default.server.port); });
