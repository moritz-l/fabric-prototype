import { NextFunction, Request, Response } from 'express';
import fabricFunctions from '../functions/fabric';
import constants from '../functions/constants';
/**
 * Delete an invoice
 */
const deleteInvoice = async (req: Request, res: Response, next: NextFunction) => {
    const username = req.app.locals.config.username;

    // Delete the invoice
    try {
        await fabricFunctions.submitTransaction(req.app.locals.config, username, constants.invoice_contract, 'deleteInvoice', [req.params.invoiceId]);

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

    const username = req.app.locals.config.username;

    try {
        switch (status) {
            case 'rejected': {
                await fabricFunctions.submitTransaction(req.app.locals.config, username, constants.invoice_contract, 'rejectInvoice', [req.params.invoiceId]);
            }
            case 'accepted': {
                await fabricFunctions.submitTransaction(req.app.locals.config, username, constants.invoice_contract, 'acceptInvoice', [req.params.invoiceId]);
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
    const username = req.app.locals.config.username;

    try {
        const invoice = await fabricFunctions.evaluateTransaction(req.app.locals.config, username, constants.invoice_contract, 'readInvoice', [req.params.invoiceId]);

        let privateResult;
        try {
            privateResult = await fabricFunctions.evaluateTransaction(req.app.locals.config, username, constants.invoice_contract, 'readInvoicePrivateData', [req.params.invoiceId]);
        } catch (error) {}

        if (!privateResult) {
            return res.status(200).json({
                invoice: JSON.parse(invoice)
            });
        } else {
            return res.status(200).json({
                invoice: JSON.parse(invoice),
                privateData: JSON.parse(privateResult)
            });
        }
    } catch (error) {
        next(error);
    }
};

export default { deleteInvoice, updateInvoice, readInvoice };
