/*
 * SPDX-License-Identifier: Apache-2.0
 */

import { Context, Contract, Info, Returns, Transaction } from 'fabric-contract-api';
import { Invoice } from './invoice';

@Info({title: 'InvoiceContract', description: 'My Smart Contract' })
export class InvoiceContract extends Contract {

    @Transaction(false)
    @Returns('boolean')
    public async invoiceExists(ctx: Context, invoiceKey: string): Promise<boolean> {
        const buffer = await ctx.stub.getState(invoiceKey);
        return (!!buffer && buffer.length > 0);
    }

    @Transaction()
    public async createInvoice(ctx: Context, invoiceKey: string, sender: string, receiver: string): Promise<void> {
        const exists = await this.invoiceExists(ctx, invoiceKey);
        if (exists) {
            throw new Error(`The invoice ${invoiceKey} already exists`);
        }

        const invoice = new Invoice();
        invoice.sender = sender;
        invoice.receiver = receiver;
        invoice.status = `new`;

        const buffer = Buffer.from(JSON.stringify(invoice));
        await ctx.stub.putState(invoiceKey, buffer);
    }

    @Transaction(false)
    @Returns('Invoice')
    public async readInvoice(ctx: Context, invoiceKey: string): Promise<Invoice> {
        const exists = await this.invoiceExists(ctx, invoiceKey);
        if (!exists) {
            throw new Error(`The invoice ${invoiceKey} does not exist`);
        }
        const buffer = await ctx.stub.getState(invoiceKey);
        const invoice = JSON.parse(buffer.toString()) as Invoice;
        return invoice;
    }

    @Transaction()
    public async deleteInvoice(ctx: Context, invoiceKey: string): Promise<void> {
        const exists = await this.invoiceExists(ctx, invoiceKey);
        if (!exists) {
            throw new Error(`The invoice ${invoiceKey} does not exist`);
        }
        await ctx.stub.deleteState(invoiceKey);
    }

    @Transaction(false)
    @Returns('string')
    public async GetAllInvoices(ctx: Context): Promise<string> {
        const allResults = [];
        const iterator = await ctx.stub.getStateByRange('', '');
        let result = await iterator.next();
        while (!result.done) {
            const strValue = Buffer.from(result.value.value.toString()).toString('utf8');
            let record;
            try {
                record = JSON.parse(strValue);
            } catch (err) {
                console.log(err);
                record = strValue;
            }
            allResults.push({Key: result.value.key, Record: record});
            result = await iterator.next();
        }
        return JSON.stringify(allResults);
    }

}
