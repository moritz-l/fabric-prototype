import express from 'express';
import controller from '../controllers/invoice';

const router = express.Router();

router.get('/:invoiceId', controller.readInvoice);
router.post('/:invoiceId', controller.updateInvoice);
router.delete('/:invoiceId', controller.deleteInvoice);

export = router;
