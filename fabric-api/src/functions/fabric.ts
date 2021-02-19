import e from 'express';
import { IdentityService } from 'fabric-ca-client';
import Client from 'fabric-client';
const FabricCAService = require('fabric-ca-client');
import { FileSystemWallet, Gateway, InMemoryWallet, Identity, Transaction, Contract, X509WalletMixin } from 'fabric-network';
import * as path from 'path';

const CHANNEL = 'mychannel';
const ADMIN = 'admin';
const WALLET = 'Org1Wallet';
const MSPID = 'Org1MSP';
/**
 * Check if the user exists in the wallet
 */
async function userExists(userName: string): Promise<boolean> {
    const wallet = await getWallet();
    return wallet.exists(userName);
}
/**
 * Connect to the gateway using the connection profile
 */
async function connectToGateway(userName: string): Promise<Gateway> {
    // Get the wallet
    const wallet = await getWallet();

    // Create a new gateway for connecting to our peer node
    const gateway = new Gateway();
    const connectionProfile = path.resolve(__dirname, '../..', 'connection.json');

    // Connect to the peer
    await gateway.connect(connectionProfile, {
        wallet,
        identity: userName,
        discovery: {
            enabled: true,
            asLocalhost: true
        }
    });

    return gateway;
}
/**
 * getWallet() creates a user in the wallet
 */
async function getWallet(): Promise<FileSystemWallet> {
    // Get the existing file system wallet
    const walletPath = path.join(process.cwd(), WALLET);
    const wallet = new FileSystemWallet(walletPath);
    console.log(`Wallet path: ${walletPath}`);

    return wallet;
}
/**
 * Creates a user in the wallet
 */
async function enrollNewUser(userName: string): Promise<void> {
    // Get the existing file system wallet
    const wallet = await getWallet();

    // Check if the user exists
    if (true == (await wallet.exists(userName))) {
        const error = new Error();
        error.message = `A user with  user name ${userName} already exists`;
        throw error;
    }

    // Create a new gateway for connecting to our peer node as admin
    const gateway = new Gateway();
    const connectionProfile = path.resolve(__dirname, '../..', 'connection.json');
    const connectionOptions = {
        wallet,
        identity: userName,
        discovery: {
            enabled: true,
            asLocalhost: true
        }
    };

    // Connect to the gateway
    await gateway.connect(connectionProfile, connectionOptions);

    // Get the CA and the enrollment user
    const fabricCA = gateway.getClient().getCertificateAuthority();
    const registrar = gateway.getCurrentIdentity();

    // Register the user with the CA (don't set an affiliation)
    const secret = await fabricCA.register(
        {
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
        },
        registrar
    );

    // Enroll the user
    const enrollment = await fabricCA.enroll({
        enrollmentID: userName,
        enrollmentSecret: secret
    });

    // Create an entry in the wallet
    const userIdentity = X509WalletMixin.createIdentity(MSPID, enrollment.certificate, enrollment.key.toBytes());

    await wallet.import(userName, userIdentity);
}
/**
 * Submit a transaction which changes the world state in Hyperledger
 */
async function submitTransaction(userName: string, contractName: string, contractMethod: string, args: string[]): Promise<void> {
    // Connect to the gateway
    const gateway = await connectToGateway(userName);

    // Get the network (channel) our contract is deployed to
    const network = await gateway.getNetwork(CHANNEL);

    // Get the contract from the network
    try {
        const contract = network.getContract(contractName);
        const tx = contract.createTransaction(contractMethod);
        await tx.submit(...args);

        console.log(`Transaction ${tx.getTransactionID} has been submitted`);

        // Disconnect from the gateway.
        await gateway.disconnect();
    } catch (error) {
        throw error;
    }
}
/**
 * Accept private data and submit it into the transient store
 */
async function submitTransactionPrivateData(userName: string, contractName: string, contractMethod: string, args: string[], privateData: string): Promise<void> {
    // Connect to the gateway
    const gateway = await connectToGateway(userName);

    // Get the network (channel) our contract is deployed to
    const network = await gateway.getNetwork(CHANNEL);

    // Get the contract from the network
    try {
        const contract = network.getContract(contractName);

        const tx = contract.createTransaction(contractMethod);

        if (privateData != null) {
            // const buffer = Buffer.from(privateData);
            const privateDataJSON = JSON.parse(privateData);

            tx.setTransient({
                encryptedData: Buffer.from(privateDataJSON.encryptedData),
                key: Buffer.from(privateDataJSON.key),
                iv: Buffer.from(privateDataJSON.iv)
            });
        }
        await tx.submit(...args);

        console.log(`Transaction ${tx.getTransactionID} has been submitted`);

        // Disconnect from the gateway.
        await gateway.disconnect();
    } catch (error) {
        throw error;
    }
}
/**
 * Submit a transaction that reads the world state
 */
async function evaluateTransaction(userName: string, contractName: string, contractMethod: string, args: string[]): Promise<string> {
    // Connect to the gateway
    const gateway = await connectToGateway(userName);

    // Get the network (channel) our contract is deployed to.
    const network = await gateway.getNetwork(CHANNEL);

    try {
        // Get the contract from the network.
        const contract = network.getContract(contractName);

        // Submit the specified transaction
        const result = await contract.evaluateTransaction(contractMethod, ...args);

        console.log('Transaction has been evaluated');

        // Disconnect from the gateway.
        await gateway.disconnect();

        // Return the result
        return result.toString('utf8');
    } catch (error) {
        throw error;
    }
}

export default { evaluateTransaction, submitTransaction, enrollNewUser, userExists, submitTransactionPrivateData };
