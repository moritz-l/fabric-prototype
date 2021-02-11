/*
 * SPDX-License-Identifier: Apache-2.0
 */

import { Context, Contract, Info, Returns, Transaction } from 'fabric-contract-api';
import { Invoice } from './invoice';

@Info({title: 'InvoiceContract', description: 'My Smart Contract' })
export class InvoiceContract extends Contract {

    @Transaction(false)
    @Returns('boolean')
    public async invoiceExists(ctx: Context, invoiceId: string): Promise<boolean> {
        const buffer = await ctx.stub.getState(invoiceId);
        return (!!buffer && buffer.length > 0);
    }

    @Transaction()
    public async createInvoice(ctx: Context, invoiceId: string, value: string): Promise<void> {
        const exists = await this.invoiceExists(ctx, invoiceId);
        if (exists) {
            throw new Error(`The invoice ${invoiceId} already exists`);
        }
        const invoice = new Invoice();
        invoice.value = value;
        const buffer = Buffer.from(JSON.stringify(invoice));
        await ctx.stub.putState(invoiceId, buffer);
    }

    @Transaction(false)
    @Returns('Invoice')
    public async readInvoice(ctx: Context, invoiceId: string): Promise<Invoice> {
        const exists = await this.invoiceExists(ctx, invoiceId);
        if (!exists) {
            throw new Error(`The invoice ${invoiceId} does not exist`);
        }
        const buffer = await ctx.stub.getState(invoiceId);
        const invoice = JSON.parse(buffer.toString()) as Invoice;
        return invoice;
    }

    @Transaction()
    public async updateInvoice(ctx: Context, invoiceId: string, newValue: string): Promise<void> {
        const exists = await this.invoiceExists(ctx, invoiceId);
        if (!exists) {
            throw new Error(`The invoice ${invoiceId} does not exist`);
        }
        const invoice = new Invoice();
        invoice.value = newValue;
        const buffer = Buffer.from(JSON.stringify(invoice));
        await ctx.stub.putState(invoiceId, buffer);
    }

    @Transaction()
    public async deleteInvoice(ctx: Context, invoiceId: string): Promise<void> {
        const exists = await this.invoiceExists(ctx, invoiceId);
        if (!exists) {
            throw new Error(`The invoice ${invoiceId} does not exist`);
        }
        await ctx.stub.deleteState(invoiceId);
    }

}
