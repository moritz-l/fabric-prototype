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
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var fabric_network_1 = require("fabric-network");
var path = __importStar(require("path"));
var CHANNEL = 'mychannel';
var USER = 'org1Admin';
var WALLET = 'Org1Wallet';
var MSPID = 'Org1MSP';
function connectToGateway() {
    return __awaiter(this, void 0, void 0, function () {
        var walletPath, wallet, gateway, connectionProfile, connectionOptions;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    walletPath = path.join(process.cwd(), WALLET);
                    wallet = new fabric_network_1.FileSystemWallet(walletPath);
                    console.log("Wallet path: " + walletPath);
                    gateway = new fabric_network_1.Gateway();
                    connectionProfile = path.resolve(__dirname, '../..', 'connection.json');
                    connectionOptions = { wallet: wallet, identity: USER, discovery: { enabled: true, asLocalhost: true } };
                    return [4 /*yield*/, gateway.connect(connectionProfile, connectionOptions)];
                case 1:
                    _a.sent();
                    return [2 /*return*/, gateway];
            }
        });
    });
}
function submitTransaction(contractName, contractMethod, args, privateData) {
    if (privateData === void 0) { privateData = ''; }
    return __awaiter(this, void 0, void 0, function () {
        var gateway, network, contract, tx, buffer, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, connectToGateway()];
                case 1:
                    gateway = _a.sent();
                    return [4 /*yield*/, gateway.getNetwork(CHANNEL)];
                case 2:
                    network = _a.sent();
                    _a.label = 3;
                case 3:
                    _a.trys.push([3, 5, , 6]);
                    contract = network.getContract(contractName);
                    tx = contract.createTransaction(contractMethod);
                    buffer = Buffer.from(privateData);
                    tx.setTransient({
                        private: buffer
                    });
                    return [4 /*yield*/, tx.submit.apply(tx, args)];
                case 4:
                    _a.sent();
                    console.log("Transaction " + tx.getTransactionID + " has been submitted");
                    return [3 /*break*/, 6];
                case 5:
                    error_1 = _a.sent();
                    console.log("Successfully caught the error: \n    " + error_1);
                    return [3 /*break*/, 6];
                case 6: 
                // Disconnect from the gateway.
                return [4 /*yield*/, gateway.disconnect()];
                case 7:
                    // Disconnect from the gateway.
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function evaluateTransaction(contractName, contractMethod, args) {
    return __awaiter(this, void 0, void 0, function () {
        var gateway, network, contract, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, connectToGateway()];
                case 1:
                    gateway = _a.sent();
                    return [4 /*yield*/, gateway.getNetwork(CHANNEL)];
                case 2:
                    network = _a.sent();
                    contract = network.getContract(contractName);
                    return [4 /*yield*/, contract.evaluateTransaction.apply(contract, __spreadArrays([contractMethod], args))];
                case 3:
                    result = _a.sent();
                    console.log('Transaction has been evaluated');
                    // Disconnect from the gateway.
                    return [4 /*yield*/, gateway.disconnect()];
                case 4:
                    // Disconnect from the gateway.
                    _a.sent();
                    // Return the result
                    return [2 /*return*/, result.toString('utf8')];
            }
        });
    });
}
function submitTransactionOffline(contractName, contractMethod, args, privateData) {
    if (privateData === void 0) { privateData = ''; }
    return __awaiter(this, void 0, void 0, function () {
        var gateway, network, channel, certificate, transactionProposalReq, unsignedProposal, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, connectToGateway()];
                case 1:
                    gateway = _a.sent();
                    return [4 /*yield*/, gateway.getNetwork(CHANNEL)];
                case 2:
                    network = _a.sent();
                    channel = network.getChannel();
                    certificate = '-----BEGIN CERTIFICATE-----\nMIICvTCCAmSgAwIBAgIUNgegYAP7ykGdNiI4Pdvv+gTI4PEwCgYIKoZIzj0EAwIw\nfzELMAkGA1UEBhMCVVMxEzARBgNVBAgTCkNhbGlmb3JuaWExFjAUBgNVBAcTDVNh\nbiBGcmFuY2lzY28xHzAdBgNVBAoTFkludGVybmV0IFdpZGdldHMsIEluYy4xDDAK\nBgNVBAsTA1dXVzEUMBIGA1UEAxMLZXhhbXBsZS5jb20wHhcNMjEwMjAyMTUzMTAw\nWhcNMjExMDExMTkzMTAwWjBhMQswCQYDVQQGEwJVUzEXMBUGA1UECBMOTm9ydGgg\nQ2Fyb2xpbmExFDASBgNVBAoTC0h5cGVybGVkZ2VyMQ8wDQYDVQQLEwZjbGllbnQx\nEjAQBgNVBAMTCW9yZzFBZG1pbjBZMBMGByqGSM49AgEGCCqGSM49AwEHA0IABNmu\nyO7fX5aQCFi1nGvjQ1dLd1QKjGh0O/PJQPAwF5MspK7ggTxxAdqIM3ABoSkMCiem\nBaCPZ8HOXLaAoOHD2N+jgdswgdgwDgYDVR0PAQH/BAQDAgeAMAwGA1UdEwEB/wQC\nMAAwHQYDVR0OBBYEFPoSMN5tmLw5FcpfmT4qOjC4D3mpMB8GA1UdIwQYMBaAFBdn\nQj2qnoI/xMUdn1vDmdG1nEgQMBoGA1UdEQQTMBGCD21vcml0ei10aGlua3BhZDBc\nBggqAwQFBgcIAQRQeyJhdHRycyI6eyJoZi5BZmZpbGlhdGlvbiI6IiIsImhmLkVu\ncm9sbG1lbnRJRCI6Im9yZzFBZG1pbiIsImhmLlR5cGUiOiJjbGllbnQifX0wCgYI\nKoZIzj0EAwIDRwAwRAIgFwiQFvl4v2mVoMFwR/6CzRtumfBQqj/spJ5gn4H2WNQC\nIHh5wffK37LG8ETYmlurokEoDzWzq7mnot+dAaeXoiNM\n-----END CERTIFICATE-----';
                    _a.label = 3;
                case 3:
                    _a.trys.push([3, 5, , 6]);
                    transactionProposalReq = {
                        fcn: contractMethod,
                        args: args,
                        chaincodeId: contractName,
                        channelId: CHANNEL
                    };
                    return [4 /*yield*/, channel.generateUnsignedProposal(transactionProposalReq, MSPID, certificate, false)];
                case 4:
                    unsignedProposal = _a.sent();
                    return [3 /*break*/, 6];
                case 5:
                    error_2 = _a.sent();
                    return [3 /*break*/, 6];
                case 6: return [2 /*return*/];
            }
        });
    });
}
exports.default = { evaluateTransaction: evaluateTransaction, submitTransaction: submitTransaction };
