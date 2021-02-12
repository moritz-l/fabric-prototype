import { NextFunction, Request, Response } from 'express';
import fabricFunctions from '../functions/fabric';
import logging from '../config/logging';
import * as crypto from 'crypto';

const NAMESPACE = 'Invoice';

// Default user for now
const username = 'org1Admin';

/**
 * Create a new invoice
 */
const createInvoice = async (req: Request, res: Response, next: NextFunction) => {
    // Get the JSON body
    const invoiceno: string = req.body.invoiceno;
    const sender: string = req.body.sender;
    const receiver: string = req.body.receiver;
    const privatedata: string = req.body.privatedata;

    // Create the invoice
    try {
        // Get the public key for the memberId
        const publicKey = //await fabricFunctions.evaluateTransaction(username, 'member2_contract', 'getMemberPublicKey', [receiver]);
            '-----BEGIN RSA PUBLIC KEY-----\nMIIBCgKCAQEAzr1BsankDpxOPBYjEckMCj391c48ewjzmeHZwmlcFqJJuygSdN2b\nGbGui3uway7fYXmuT4jdkqlJUSMxDFAtlUe+R8Mkj9uN5RoG/tE6jqCQc7N3yJYQ\nRU4KHYM5BHYTj7sg6W5YcTTyu3oK+KPkZ4/v/KxgF0hr9OahFN4WjwEIMWniKgfb\nSp6qMvPEP30nPVfeZIirtVBfLRo72rx5Hgm0ShAaLIBJnKAANjrgdfSYRcCHeeRs\n5rHyeEhoD44IkwAVNEPXtlEU/evJnEmdelTbURjT4B/Hcov94oqJ0kDt+FGXwrPr\nf5BE1GRxRiHnBDNeQ7HqPm9KBoycffXbAQIDAQAB\n-----END RSA PUBLIC KEY-----\n';

        const test = Buffer.from(publicKey).toString('utf8');

        const encryptedData = crypto.publicEncrypt(
            {
                key: test,
                padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
                oaepHash: 'sha256'
            },
            Buffer.from(privatedata)
        );

        const privateKey =
            '-----BEGIN RSA PRIVATE KEY-----\nMIIEpgIBAAKCAQEAzr1BsankDpxOPBYjEckMCj391c48ewjzmeHZwmlcFqJJuygS\ndN2bGbGui3uway7fYXmuT4jdkqlJUSMxDFAtlUe+R8Mkj9uN5RoG/tE6jqCQc7N3\nyJYQRU4KHYM5BHYTj7sg6W5YcTTyu3oK+KPkZ4/v/KxgF0hr9OahFN4WjwEIMWni\nKgfbSp6qMvPEP30nPVfeZIirtVBfLRo72rx5Hgm0ShAaLIBJnKAANjrgdfSYRcCH\neeRs5rHyeEhoD44IkwAVNEPXtlEU/evJnEmdelTbURjT4B/Hcov94oqJ0kDt+FGX\nwrPrf5BE1GRxRiHnBDNeQ7HqPm9KBoycffXbAQIDAQABAoIBAQCLxx3hlzIgRsIG\nkhkH71x6mEtFAXmW3giF5FOsxDuE+hjLt14zMZmqF54hpHE1Jq3V…SKzXKTSr4V\n0PgGE21dar2REZkodpdijxqq6aN5iVSl6DYcKAaqV0OaqvoAxt+zkim1sTf06AAL\nnJfjgkCH1SVsJVYWUGgc2y2XAoGBAMZBYJTs0bKnoS8vWHjlKzFZRMCsI34svHkL\nT4iYkVVOwVY3kqE1E4LG9eTERiYUyHeUQf+XoE1wYR4FQEE65I/xzlmeBAvKZxjh\nUNtjMAhl0mKYQux9OPdpvyuJEWO0QrvrD3ImVIk4jgdKqe0TS9CjiME8Bbaod8OY\nHDfxzT4lAoGBAOJ0TO4SuX5qZz0Rsa+O8645thciov1XzSkIo2gIS8v9HmUJPXpZ\nagT/ooZIw8sI0MZqRWUFLgOR41IZZovN4GOTgEcV+Rb5mgrDriG3y2p//XD69Xtp\nIZ6PnYJ0QWPkYiBjGS5LQEkCBn3rcTrnN2XXN99NimuQqVu+PRJQqrlj\n-----END RSA PRIVATE KEY-----\n';

        const test2 = Buffer.from(privateKey).toString('utf8');

        const decryptedData = crypto.privateDecrypt(
            {
                key: test2,
                padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
                oaepHash: 'sha256',
                BYTES_PER_ELEMENT: 64
            },
            encryptedData
        );

        return res.status(200).json({
            message: `created invoice ${invoiceno}`,
            encryptedData: encryptedData.toString(),
            decryptedData: decryptedData.toString()
        });

        await fabricFunctions.submitTransactionPrivateData(username, 'invoice2-contract', 'createInvoice', [invoiceno, sender, receiver], encryptedData);

        return res.status(200).json({
            message: `created invoice ${invoiceno}`,
            privateData: encryptedData.toString()
        });
    } catch (error) {
        next(error);
    }
};
/**
 * Get a list of all invoices
 */
const readInvoiceList = async (req: Request, res: Response, next: NextFunction) => {
    // Read the list of invoices
    try {
        const result = await fabricFunctions.evaluateTransaction(username, 'invoice2-contract', 'GetAllInvoices', []);
        const listOfInvoices = JSON.parse(result);
        return res.status(200).json({
            listOfInvoices
        });
    } catch (error) {
        next(error);
    }
};

export default { createInvoice, readInvoiceList };
