import dotenv from 'dotenv';

dotenv.config();

const SERVER_HOSTNAME_2 = process.env.SERVER_HOSTNAME || 'localhost';
const SERVER_PORT_2 = process.env.SERVER_PORT || 2337;

const SERVER_TOKEN_EXPIRETIME_2 = process.env.SERVER_TOKEN_EXPIRETIME || 3600;
const SERVER_TOKEN_ISSUER_2 = process.env.SERVER_TOKEN_ISSUER || 'coolIssuer';
const SERVER_TOKEN_SECRET_2 = process.env.SERVER_TOKEN_SECRET || 'superencryptedsecret';

const SERVER_2 = {
    hostname: SERVER_HOSTNAME_2,
    port: SERVER_PORT_2,
    token: {
        expireTime: SERVER_TOKEN_EXPIRETIME_2,
        issuer: SERVER_TOKEN_ISSUER_2,
        secret: SERVER_TOKEN_SECRET_2
    }
};

const config = {
    server: SERVER_2,
    connection: 'connection_org2.json',
    walletpath: '../../Org2Wallet',
    wallet: 'Org2Wallet',
    username: 'org2Admin',
    mspid: 'Org2MSP',
    admin: 'admin',
    channel: 'mychannel'
};

export default { config };
