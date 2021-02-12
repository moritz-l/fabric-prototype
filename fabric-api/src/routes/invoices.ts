import express from 'express';
import controller from '../controllers/invoices';

const router = express.Router();

router.get('/list', controller.readInvoiceList);
router.post('/new', controller.createInvoice);

export = router;
