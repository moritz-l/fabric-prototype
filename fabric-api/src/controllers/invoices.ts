import { NextFunction, Request, Response } from 'express';
import fabricFunctions from '../functions/fabric';
import constants from '../functions/constants';

const NAMESPACE = 'Invoice';

/**
 * Create a new invoice
 */
const createInvoice = async (req: Request, res: Response, next: NextFunction) => {
    // Get the JSON body
    const invoiceNo: string = req.body.invoiceno;
    const sender: string = req.body.sender;
    const receiver: string = req.body.receiver;
    const encryptedData: string = req.body.encryptedData;
    const key: string = req.body.key;
    const iv: string = req.body.iv;

    const transientData = JSON.stringify({
        encryptedData: encryptedData,
        key: key,
        iv: iv
    });

    const username = req.app.locals.config.username;

    // Create the invoice
    try {
        // Save on the blockchain
        await fabricFunctions.submitTransactionPrivateData(req.app.locals.config, username, constants.invoice_contract, 'createInvoice', [invoiceNo, sender, receiver], transientData);

        return res.status(200).json({
            message: `created invoice ${invoiceNo}`
        });
    } catch (error) {
        next(error);
    }
};
/**
 * Get a list of all invoices
 */
const readInvoiceList = async (req: Request, res: Response, next: NextFunction) => {
    const username = req.app.locals.config.username;

    // Read the list of invoices
    try {
        const result = await fabricFunctions.evaluateTransaction(req.app.locals.config, username, constants.invoice_contract, 'GetAllInvoices', []);
        const listOfInvoices = JSON.parse(result);
        return res.status(200).json({
            listOfInvoices
        });
    } catch (error) {
        next(error);
    }
};

export default { createInvoice, readInvoiceList };
