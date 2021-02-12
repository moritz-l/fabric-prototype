import http from 'http';
import express from 'express';
import bodyParser from 'body-parser';
import logging from './config/logging';
import config from './config/config';
import invoicesRoute from './routes/invoices';
import invoiceRoute from './routes/invoice';
import membersRoute from './routes/members';
import usersRoute from './routes/user';

const NAMESPACE = 'Server';
const router = express();

// Log the request
router.use((req, res, next) => {
    // At invoke
    logging.info(NAMESPACE, `METHOD - [${req.method}], URL - [${req.url}], IP - [${req.socket.remoteAddress}]`);

    // At finish
    res.on('finish', () => {
        logging.info(NAMESPACE, `METHOD - [${req.method}], URL - [${req.url}], IP - [${req.socket.remoteAddress}, STATUS - [${res.statusCode}]`);
    });

    // Continue
    next();
});

// Parse the request
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());

// Define rules of the API
router.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    // Allowed HTTP-Headers
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');

    // Accepted Methods
    if (req.method == 'OPTIONS') {
        res.header('Access-Control-Allow-Methods', 'GET DELETE POST PUT');
        return res.status(200).json({});
    }

    // Continue
    next();
});

// Routing
router.use('/invoices', invoicesRoute);
router.use('/invoice', invoiceRoute);
router.use('/members', membersRoute);
router.use('/users', usersRoute);

// Error handling
router.use((req, res, next) => {
    const error = new Error('ressource not found');

    return res.status(404).json({
        message: error.message
    });

    // Continue
    next();
});

// Create the server
const httpServer = http.createServer(router);
httpServer.listen(config.server.port, () => logging.info(NAMESPACE, `Server running on ${config.server.hostname}:${config.server.port}`));
