import { NextFunction, Request, Response } from 'express';
import fabricFunctions from '../functions/fabric';
import constants from '../functions/constants';

import * as crypto from 'crypto';

const username = 'org1Admin';

/**
 * Read the members public key from Hyperledger
 */
const readMemberCertificate = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Get the public key for the memberId
        const memberKey = await fabricFunctions.evaluateTransaction(username, constants.member_contract, 'getMemberPublicKey', [req.params.memberId]);

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

        await fabricFunctions.submitTransaction(username, constants.member_contract, 'enrollMember', [memberId, publicKey]);

        return res.status(200).json({
            message: `Member ${memberId} has been successfully enrolled. Please save the private key!`,
            privateKey: Buffer.from(privateKey, 'utf8').toString()
        });
    } catch (error) {
        next(error);
    }
};

export default { readMemberCertificate, enrollAsMember };
