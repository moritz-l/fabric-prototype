import { NextFunction, Request, Response } from 'express';
import fabricFunctions from '../functions/fabric';
import logging from '../config/logging';
import user from './user';

import * as crypto from 'crypto';

const NAMESPACE = 'Member';

const username = 'org1Admin';

/**
 * Read the members public key from Hyperledger
 */
const readMemberCertificate = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Get the public key for the memberId
        const memberKey = await fabricFunctions.evaluateTransaction(username, 'member2_contract', 'getMemberPublicKey', [req.params.memberId]);

        return res.status(200).json({
            memberKey: memberKey
        });
    } catch (error) {
        next(error);
    }
};
/**
 * Enroll a member in hyperledger
 */
const enrollAsMember = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const memberId = req.params.memberId;

        // Create the keypair for the organisation
        const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
            modulusLength: 2048,
            publicKeyEncoding: {
                type: 'pkcs1',
                format: 'pem'
            },
            privateKeyEncoding: {
                type: 'pkcs1',
                format: 'pem'
            }
        });

        const privatedata = 'bla';

        const encryptedData = crypto.publicEncrypt(
            {
                key: publicKey,
                padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
                oaepHash: 'sha256'
            },
            Buffer.from(privatedata)
        );

        const decryptedData = crypto.privateDecrypt(
            {
                key: privateKey,
                padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
                oaepHash: 'sha256'
            },
            encryptedData
        );

        await fabricFunctions.submitTransaction(username, 'member2_contract', 'enrollMember', [memberId, publicKey]);

        return res.status(200).json({
            message: `Member ${memberId} has been successfully enrolled. Please save the private key!`,
            publicKey: Buffer.from(publicKey, 'utf8').toString(),
            pk1: publicKey,
            pk4: Buffer.from(publicKey, 'base64').toString(),
            privateKey: Buffer.from(privateKey, 'utf8').toString(),
            pk2: privateKey,
            pk3: Buffer.from(privateKey, 'base64').toString(),
            privateData: decryptedData.toString()
        });
    } catch (error) {
        next(error);
    }
};

export default { readMemberCertificate, enrollAsMember };
