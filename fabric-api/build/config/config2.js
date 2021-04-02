"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
var SERVER_HOSTNAME_2 = process.env.SERVER_HOSTNAME || 'localhost';
var SERVER_PORT_2 = process.env.SERVER_PORT || 2337;
var SERVER_TOKEN_EXPIRETIME_2 = process.env.SERVER_TOKEN_EXPIRETIME || 3600;
var SERVER_TOKEN_ISSUER_2 = process.env.SERVER_TOKEN_ISSUER || 'coolIssuer';
var SERVER_TOKEN_SECRET_2 = process.env.SERVER_TOKEN_SECRET || 'superencryptedsecret';
var SERVER_2 = {
    hostname: SERVER_HOSTNAME_2,
    port: SERVER_PORT_2,
    token: {
        expireTime: SERVER_TOKEN_EXPIRETIME_2,
        issuer: SERVER_TOKEN_ISSUER_2,
        secret: SERVER_TOKEN_SECRET_2
    }
};
var config = {
    server: SERVER_2,
    connection: 'connection_org2.json',
    walletpath: '../../Org2Wallet',
    wallet: 'Org2Wallet',
    username: 'org2Admin',
    mspid: 'Org2MSP',
    admin: 'admin',
    channel: 'mychannel'
};
exports.default = { config: config };
