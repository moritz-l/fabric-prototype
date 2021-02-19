import { NextFunction, Request, Response } from 'express';
import bcryptjs from 'bcryptjs';
import logging from '../config/logging';
import fabricFunctions from '../functions/fabric';
import * as crypto from 'crypto';

const NAMESPACE = 'User';

const validateToken = (req: Request, res: Response, next: NextFunction) => {
    logging.info(NAMESPACE, 'Token validated, user authorized.');

    return res.status(200).json({
        message: 'Token(s) validated'
    });
};

const register = async (req: Request, res: Response, next: NextFunction) => {
    const user = {
        username: req.body.username,
        password: req.body.password,
        orgname: req.body.orgname
    };

    // Hash the PW with a salt
    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(user.password, salt);

    try {
        // Create the wallet
        fabricFunctions.enrollNewUser(user.username);

        // Create the keypair for the user
        const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
            modulusLength: 4096
        });

        // Add the user info to the blockchain
        await fabricFunctions.submitTransaction(user.username, 'user_contract', 'createUser', [user.username, hashedPassword, salt]);

        // Enroll the organisation
        await fabricFunctions.submitTransaction(user.username, 'user_contract', 'createUser', [user.username, hashedPassword, salt]);

        return res.status(200).json({
            message: `User ${user.username} has been registered`,
            privateKey: privateKey.export.toString()
        });
    } catch (error) {
        next(error);
    }
};

const login = async (req: Request, res: Response, next: NextFunction) => {
    const user = {
        username: req.body.username,
        password: req.body.password
    };

    try {
        // Check if the user exists in the wallet
        const userexists = await fabricFunctions.userExists(user.username);
        if (userexists == false) {
            const error = new Error();
            error.message = `User ${user.username} does not exist`;
            throw error;
        }

        // Get the user info
        const userInfoAsString = await fabricFunctions.evaluateTransaction(user.username, 'user_contract', 'readUser', [user.username]);
        const userInfo = JSON.parse(userInfoAsString);
        const hashedStoredPassword = await bcryptjs.hash(user.password, userInfo.salt);
        const hashedProvidedPassword = await bcryptjs.hash(userInfo.password, userInfo.salt);

        if (hashedProvidedPassword != hashedStoredPassword) {
            return res.status(400).json({
                message: `Login for user ${user.username} failed`
            });
        }

        // Send login confirmation
        return res.status(200).json({
            message: `User ${user.username} has been logged in`
        });
    } catch (error) {
        next(error);
    }
};

export default { validateToken, register, login };
