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
var FabricCAService = require('fabric-ca-client');
var fabric_network_1 = require("fabric-network");
var path = __importStar(require("path"));
/**
 * Check if the user exists in the wallet
 */
function userExists(userName, config) {
    return __awaiter(this, void 0, void 0, function () {
        var wallet;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getWallet(config)];
                case 1:
                    wallet = _a.sent();
                    return [2 /*return*/, wallet.exists(userName)];
            }
        });
    });
}
/**
 * Connect to the gateway using the connection profile
 */
function connectToGateway(userName, config) {
    return __awaiter(this, void 0, void 0, function () {
        var wallet, gateway, connectionProfile;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getWallet(config)];
                case 1:
                    wallet = _a.sent();
                    gateway = new fabric_network_1.Gateway();
                    connectionProfile = path.resolve(__dirname, '../..', String(config.connection));
                    // Connect to the peer
                    return [4 /*yield*/, gateway.connect(connectionProfile, {
                            wallet: wallet,
                            identity: userName,
                            discovery: {
                                enabled: true,
                                asLocalhost: true
                            }
                        })];
                case 2:
                    // Connect to the peer
                    _a.sent();
                    return [2 /*return*/, gateway];
            }
        });
    });
}
/**
 * getWallet() creates a user in the wallet
 */
function getWallet(config) {
    return __awaiter(this, void 0, void 0, function () {
        var walletPath, wallet;
        return __generator(this, function (_a) {
            walletPath = path.join(process.cwd(), String(config.wallet));
            wallet = new fabric_network_1.FileSystemWallet(walletPath);
            console.log("Wallet path: " + walletPath);
            return [2 /*return*/, wallet];
        });
    });
}
/**
 * Creates a user in the wallet
 */
function enrollNewUser(userName, config) {
    return __awaiter(this, void 0, void 0, function () {
        var wallet, _a, error, gateway, connectionProfile, connectionOptions, fabricCA, registrar, secret, enrollment, userIdentity;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, getWallet(config)];
                case 1:
                    wallet = _b.sent();
                    _a = true;
                    return [4 /*yield*/, wallet.exists(userName)];
                case 2:
                    // Check if the user exists
                    if (_a == (_b.sent())) {
                        error = new Error();
                        error.message = "A user with  user name " + userName + " already exists";
                        throw error;
                    }
                    gateway = new fabric_network_1.Gateway();
                    connectionProfile = path.resolve(__dirname, '../..', String(config.connection));
                    connectionOptions = {
                        wallet: wallet,
                        identity: userName,
                        discovery: {
                            enabled: true,
                            asLocalhost: true
                        }
                    };
                    // Connect to the gateway
                    return [4 /*yield*/, gateway.connect(connectionProfile, connectionOptions)];
                case 3:
                    // Connect to the gateway
                    _b.sent();
                    fabricCA = gateway.getClient().getCertificateAuthority();
                    registrar = gateway.getCurrentIdentity();
                    return [4 /*yield*/, fabricCA.register({
                            affiliation: '',
                            enrollmentID: userName,
                            role: 'client',
                            attrs: [
                                {
                                    name: 'role',
                                    value: 'user',
                                    ecert: true
                                }
                            ]
                        }, registrar)];
                case 4:
                    secret = _b.sent();
                    return [4 /*yield*/, fabricCA.enroll({
                            enrollmentID: userName,
                            enrollmentSecret: secret
                        })];
                case 5:
                    enrollment = _b.sent();
                    userIdentity = fabric_network_1.X509WalletMixin.createIdentity(String(config.mspid), enrollment.certificate, enrollment.key.toBytes());
                    return [4 /*yield*/, wallet.import(userName, userIdentity)];
                case 6:
                    _b.sent();
                    return [2 /*return*/];
            }
        });
    });
}
/**
 * Submit a transaction which changes the world state in Hyperledger
 */
function submitTransaction(config, userName, contractName, contractMethod, args) {
    return __awaiter(this, void 0, void 0, function () {
        var gateway, network, contract, tx, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, connectToGateway(userName, config)];
                case 1:
                    gateway = _a.sent();
                    return [4 /*yield*/, gateway.getNetwork(String(config.channel))];
                case 2:
                    network = _a.sent();
                    _a.label = 3;
                case 3:
                    _a.trys.push([3, 6, , 7]);
                    contract = network.getContract(contractName);
                    tx = contract.createTransaction(contractMethod);
                    return [4 /*yield*/, tx.submit.apply(tx, args)];
                case 4:
                    _a.sent();
                    console.log("Transaction " + tx.getTransactionID + " has been submitted");
                    // Disconnect from the gateway.
                    return [4 /*yield*/, gateway.disconnect()];
                case 5:
                    // Disconnect from the gateway.
                    _a.sent();
                    return [3 /*break*/, 7];
                case 6:
                    error_1 = _a.sent();
                    throw error_1;
                case 7: return [2 /*return*/];
            }
        });
    });
}
/**
 * Accept private data and submit it into the transient store
 */
function submitTransactionPrivateData(config, userName, contractName, contractMethod, args, privateData) {
    return __awaiter(this, void 0, void 0, function () {
        var gateway, network, contract, tx, privateDataJSON, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, connectToGateway(userName, config)];
                case 1:
                    gateway = _a.sent();
                    return [4 /*yield*/, gateway.getNetwork(String(config.channel))];
                case 2:
                    network = _a.sent();
                    _a.label = 3;
                case 3:
                    _a.trys.push([3, 6, , 7]);
                    contract = network.getContract(contractName);
                    tx = contract.createTransaction(contractMethod);
                    if (privateData != null) {
                        privateDataJSON = JSON.parse(privateData);
                        tx.setTransient({
                            encryptedData: Buffer.from(privateDataJSON.encryptedData),
                            key: Buffer.from(privateDataJSON.key),
                            iv: Buffer.from(privateDataJSON.iv)
                        });
                    }
                    // Submit the transaction to hyperledger
                    return [4 /*yield*/, tx.submit.apply(tx, args)];
                case 4:
                    // Submit the transaction to hyperledger
                    _a.sent();
                    console.log("Transaction " + tx.getTransactionID + " has been submitted");
                    // Disconnect from the gateway.
                    return [4 /*yield*/, gateway.disconnect()];
                case 5:
                    // Disconnect from the gateway.
                    _a.sent();
                    return [3 /*break*/, 7];
                case 6:
                    error_2 = _a.sent();
                    throw error_2;
                case 7: return [2 /*return*/];
            }
        });
    });
}
/**
 * Submit a transaction that reads the world state
 */
function evaluateTransaction(config, userName, contractName, contractMethod, args) {
    return __awaiter(this, void 0, void 0, function () {
        var gateway, network, contract, result, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, connectToGateway(userName, config)];
                case 1:
                    gateway = _a.sent();
                    return [4 /*yield*/, gateway.getNetwork(String(config.channel))];
                case 2:
                    network = _a.sent();
                    _a.label = 3;
                case 3:
                    _a.trys.push([3, 6, , 7]);
                    contract = network.getContract(contractName);
                    return [4 /*yield*/, contract.evaluateTransaction.apply(contract, __spreadArrays([contractMethod], args))];
                case 4:
                    result = _a.sent();
                    console.log('Transaction has been evaluated');
                    // Disconnect from the gateway.
                    return [4 /*yield*/, gateway.disconnect()];
                case 5:
                    // Disconnect from the gateway.
                    _a.sent();
                    // Return the result
                    return [2 /*return*/, result.toString('utf8')];
                case 6:
                    error_3 = _a.sent();
                    throw error_3;
                case 7: return [2 /*return*/];
            }
        });
    });
}
exports.default = { evaluateTransaction: evaluateTransaction, submitTransaction: submitTransaction, enrollNewUser: enrollNewUser, userExists: userExists, submitTransactionPrivateData: submitTransactionPrivateData };
