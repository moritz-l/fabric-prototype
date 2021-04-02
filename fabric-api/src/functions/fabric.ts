const FabricCAService = require('fabric-ca-client');
import { FileSystemWallet, Gateway, X509WalletMixin } from 'fabric-network';
import * as path from 'path';

/**
 * Check if the user exists in the wallet
 */
async function userExists(userName: string, config: any): Promise<boolean> {
    const wallet = await getWallet(config);
    return wallet.exists(userName);
}
/**
 * Connect to the gateway using the connection profile
 */
async function connectToGateway(userName: string, config: any): Promise<Gateway> {
    // Get the wallet
    const wallet = await getWallet(config);

    // Create a new gateway for connecting to our peer node
    const gateway = new Gateway();
    const connectionProfile = path.resolve(__dirname, '../..', String(config.connection));

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
async function getWallet(config: any): Promise<FileSystemWallet> {
    // Get the existing file system wallet
    const walletPath = path.join(process.cwd(), String(config.wallet));
    const wallet = new FileSystemWallet(walletPath);
    console.log(`Wallet path: ${walletPath}`);

    return wallet;
}
/**
 * Creates a user in the wallet
 */
async function enrollNewUser(userName: string, config: any): Promise<void> {
    // Get the existing file system wallet
    const wallet = await getWallet(config);

    // Check if the user exists
    if (true == (await wallet.exists(userName))) {
        const error = new Error();
        error.message = `A user with  user name ${userName} already exists`;
        throw error;
    }

    // Create a new gateway for connecting to our peer node as admin
    const gateway = new Gateway();
    const connectionProfile = path.resolve(__dirname, '../..', String(config.connection));
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
    const userIdentity = X509WalletMixin.createIdentity(String(config.mspid), enrollment.certificate, enrollment.key.toBytes());

    await wallet.import(userName, userIdentity);
}
/**
 * Submit a transaction which changes the world state in Hyperledger
 */
async function submitTransaction(config: any, userName: string, contractName: string, contractMethod: string, args: string[]): Promise<void> {
    // Connect to the gateway
    const gateway = await connectToGateway(userName, config);

    // Get the network (channel) our contract is deployed to
    const network = await gateway.getNetwork(String(config.channel));

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
async function submitTransactionPrivateData(config: any, userName: string, contractName: string, contractMethod: string, args: string[], privateData: string): Promise<void> {
    // Connect to the gateway
    const gateway = await connectToGateway(userName, config);

    // Get the network (channel) our contract is deployed to
    const network = await gateway.getNetwork(String(config.channel));

    // Get the contract from the network
    try {
        const contract = network.getContract(contractName);
        const tx = contract.createTransaction(contractMethod);

        if (privateData != null) {
            const privateDataJSON = JSON.parse(privateData);

            tx.setTransient({
                encryptedData: Buffer.from(privateDataJSON.encryptedData),
                key: Buffer.from(privateDataJSON.key),
                iv: Buffer.from(privateDataJSON.iv)
            });
        }
        // Submit the transaction to hyperledger
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
async function evaluateTransaction(config: any, userName: string, contractName: string, contractMethod: string, args: string[]): Promise<string> {
    // Connect to the gateway
    const gateway = await connectToGateway(userName, config);

    // Get the network (channel) our contract is deployed to.
    const network = await gateway.getNetwork(String(config.channel));

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
