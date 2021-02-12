import { NextFunction, Request, Response } from 'express';
import fabricFunctions from '../functions/fabric';
import logging from '../config/logging';
import user from './user';
import * as crypto from 'crypto';

// Default user for now
const username = 'org1Admin';

/**
 * Delete an invoice
 */
const deleteInvoice = async (req: Request, res: Response, next: NextFunction) => {
    // Delete the invoice
    try {
        await fabricFunctions.submitTransaction(username, 'invoice2-contract', 'deleteInvoice', [req.params.invoiceId]);

        return res.status(200).json({
            message: `deleted invoice ${req.params.invoiceId}`
        });
    } catch (error) {
        next(error);
    }
};
/**
 * Update an invoice
 */
const updateInvoice = async (req: Request, res: Response, next: NextFunction) => {
    // Update the invoice
    const status = req.body.status;
    if (!status) {
        return res.status(400).json({
            message: `no status provided for invoice ${req.params.invoiceId}`
        });
    }

    try {
        switch (status) {
            case 'rejected': {
                await fabricFunctions.submitTransaction(username, 'invoice2-contract', 'rejectInvoice', [req.params.invoiceId]);
            }
            case 'accepted': {
                await fabricFunctions.submitTransaction(username, 'invoice2-contract', 'acceptInvoice', [req.params.invoiceId]);
            }
            default: {
            }
        }

        return res.status(200).json({
            message: `updated invoice ${req.params.invoiceId}`
        });
    } catch (error) {
        next(error);
    }
};
/**
 * Read an invoice
 */
const readInvoice = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await fabricFunctions.evaluateTransaction(username, 'invoice2-contract', 'readInvoice', [req.params.invoiceId]);
        const privateResult = await fabricFunctions.evaluateTransaction(username, 'invoice2-contract', 'readInvoicePrivateData', [req.params.invoiceId]);

        const privateKey =
            '-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC+s5GegnK0n034\nNwvUSa4pAeDn3LfE4lGSw/COBMieG5RQ33RHXe9Xf1piN5VNcbkknX0eI/fc2w1N\nr6zvGXQnVZEv7p1gZnJY7I1CmbGRu1qgQO2z7uB9FsrQ2QQCaIPMnQWhMaFUIS2p\nCr2GcUU0AvdYWhMuz2PB4FPFq+f6s2oR6mSZxhVJRvTpQ6s0v1I+fFRylBA2locr\n4+AC0hlKZce7X7rlFAW+/vNOzhJ4Az5J+Nv8oUOlTVtyJXo2pHCnd6cIL0WY7iAj\nUCqEOZ+6KN5UxDcPhaJy43XC72jaYZ7RcoN+dxJi63Gl/oqfUa2eREZoSP5xq3QN\nto6vyRKpAgMBAAECggEAaTUwFT7qgXOR1GqqAAhWKRF8Pu6qA9jIICwxPmitNW0J\nukRNJkJQ…fXAJc/bEvpqCHTSm86SHFNFm3UcG5O21gWVVUUYZZxZZL8po\nBdnT8sajwBJNoAjW3gLGGtzuiL1maQwCt3uxEZgB2z7lvcHIwnZ0IguRAoGBAIsx\nJXEAqCo6QEy6sFFgP+ijUDQ2tUjK65DSDsFiZa7TO5iwDYoQNy59PsSamee7mlL3\nE0WYx8MfNMbKXwpJsb47uGjYJAWDxPhoj0Lb3JXRuNmvoC/ZtMdN8N0UAQGBQlyz\najqySVLR6RCTRG+cWXcUBafNLM5aqwPjBMLZdMRhAoGBANZGZip+N1GrQKNDOpQj\nk95CIq7NiMPnMHbB4NlnuOhJkRAPOIpn9pPahp2KB0uXMlxniH60KgoV/GvicLz2\ndKdK328PkSa5y+M/e2hnzn+FQ6k7KEodnVDf3g6fZ5/bzLeZKlWQ4e/7JOWHF8Di\nCJ9vPqN3IkmBxA67pNeRhZOb\n-----END PRIVATE KEY-----\n';

        const invoice = JSON.parse(result);

        const decryptedData = crypto.privateDecrypt(
            {
                key: Buffer.from(privateKey, 'base64'),
                padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
                oaepHash: 'sha256'
            },
            Buffer.from(JSON.parse(privateResult))
        );

        return res.status(200).json({
            invoice,
            decryptedData
        });
    } catch (error) {
        next(error);
    }
};

export default { deleteInvoice, updateInvoice, readInvoice };
