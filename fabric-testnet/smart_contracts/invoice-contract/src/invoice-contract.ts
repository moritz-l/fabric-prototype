/*
 * SPDX-License-Identifier: Apache-2.0
 */

import { Context, Contract, Info, Returns, Transaction } from 'fabric-contract-api';
import { Invoice, PrivateData } from './invoice';

@Info({title: 'InvoiceContract', description: 'Basic invoice contract' })
export class InvoiceContract extends Contract {

    @Transaction(false)
    @Returns('boolean')
    public async invoiceExists(ctx: Context, invoiceKey: string): Promise<boolean> {
        const buffer = await ctx.stub.getState(invoiceKey.toString());
        return (!!buffer && buffer.length > 0);
    }

    @Transaction(false)
    @Returns('boolean')
    public async isAuthorized(ctx: Context, invoiceKey: string): Promise<boolean> {
        // Get the invoice data
        let buffer = await ctx.stub.getState(invoiceKey.toString());
        const invoice = JSON.parse(buffer.toString()) as Invoice;

        // Check if the identity submitting the transaction is the current processor
        let isAuthorized = await (await ctx.stub.invokeChaincode(`member-contract`, [`checkAuthority`, invoice.processor], ctx.stub.getChannelID())).payload.toString('utf8');
        if (isAuthorized == 'true'){
            return true
        } else {
            return false
        }
    }

    @Transaction()
    public async createInvoice(ctx: Context, invoiceNumber: string, sender: string, receiver: string): Promise<void> {
        // Check if the members submitted as sender and receiver exist
        let memberExists = await (await ctx.stub.invokeChaincode(`member-contract`, [`memberExists`, sender], ctx.stub.getChannelID())).payload.toString('utf8');
        if (memberExists == 'false'){
            throw new Error(`The sender ${sender} does not exist`);
        } else {
            memberExists = await (await ctx.stub.invokeChaincode(`member-contract`, [`memberExists`, receiver], ctx.stub.getChannelID())).payload.toString('utf8');
            if (memberExists == 'false'){
                throw new Error(`The receiver ${receiver} does not exist`);
            }
        }

        // Check if the submitter is part of the sending organization
        let isAuthorized = await (await ctx.stub.invokeChaincode(`member-contract`, [`checkAuthority`, sender], ctx.stub.getChannelID())).payload.toString('utf8');
        if (isAuthorized != 'true'){
            throw new Error(`The sender is not authorized to submit invoices for the sending organization ${sender}`);
        }

        // Key-creation has to be deterministic and unique to ensure endorsement
        const invoiceKey = `${sender}_${receiver}_${invoiceNumber}`;

        // Check if key has already been issued
        const exists = await this.invoiceExists(ctx, invoiceKey);
        if (exists) {
            throw new Error(`The invoice ${invoiceKey} already exists`);
        }

        // NOTE: transientData can be read by endorsing peers
        const transientData = ctx.stub.getTransient();

        try {
            // Save transientData to private data collection
            if (!!transientData){
                const privateData = new PrivateData();

                // Get the encrypted data
                privateData.encryptedData = transientData.get('encryptedData').toString('utf8');

                // And the random bytes for AES
                privateData.key = transientData.get('key').toString('utf8');
                privateData.iv = transientData.get('iv').toString('utf8')

                let response  = await ctx.stub.invokeChaincode(`member-contract`, [`getMemberCollection`, receiver], ctx.stub.getChannelID());
                let collection = response.payload.toString('utf8');

                if(!!collection == false){
                    throw new Error(`Could not determine collection for ${receiver}`);
                }

                const buffer = Buffer.from(JSON.stringify(privateData));
                ctx.stub.putPrivateData(collection, invoiceKey.toString(), buffer);
            }
        } catch (e) {
            // Do nothing
        }

        // Save the public state of the invoice
        const invoice = new Invoice();
        invoice.invoiceNumber = invoiceNumber;
        invoice.sender = sender;
        invoice.processor = invoice.receiver = receiver;
        invoice.status = `new`;

        const buffer = Buffer.from(JSON.stringify(invoice));
        await ctx.stub.putState(invoiceKey.toString(), buffer);

    }

    @Transaction(false)
    @Returns('Invoice')
    public async readInvoicePrivateData(ctx: Context, invoiceKey: string): Promise<PrivateData> {
        // Check existence
        const exists = await this.invoiceExists(ctx, invoiceKey);
        if (!exists) {
            throw new Error(`The invoice ${invoiceKey} does not exist`);
        }

        // Get the existing data
        let buffer = await ctx.stub.getState(invoiceKey.toString());
        const invoice = JSON.parse(buffer.toString()) as Invoice;

        // Get the private collection
        let response  = await ctx.stub.invokeChaincode(`member-contract`, [`getMemberCollection`, invoice.receiver], ctx.stub.getChannelID());
        let collection = response.payload.toString('utf8');

        if(!!collection == false){
            throw new Error(`Could not determine collection for ${invoice.receiver}`);
        }

        // Retrieve data from the private collection
        buffer = await ctx.stub.getPrivateData(collection, invoiceKey.toString());
        return JSON.parse(buffer.toString()) as PrivateData;
    }

    @Transaction(false)
    @Returns('Invoice')
    public async readInvoice(ctx: Context, invoiceKey: string): Promise<Invoice> {
        // Check existence
        const exists = await this.invoiceExists(ctx, invoiceKey);
        if (!exists) {
            throw new Error(`The invoice ${invoiceKey} does not exist`);
        }
        // Get the existing data
        const buffer = await ctx.stub.getState(invoiceKey.toString());
        const invoice = JSON.parse(buffer.toString()) as Invoice;

        return invoice;
    }


    @Transaction()
    public async rejectInvoice(ctx: Context, invoiceKey: string): Promise<void> {
        // Check existence
        const exists = await this.invoiceExists(ctx, invoiceKey);
        if (!exists) {
            throw new Error(`The invoice ${invoiceKey} does not exist`);
        }

        // Check authority
        const authorized = await this.isAuthorized(ctx, invoiceKey);
        if (!authorized) {
            throw new Error(`Not authorized to update invoice ${invoiceKey}`);
        }

        // Get the existing data
        let buffer = await ctx.stub.getState(invoiceKey.toString());
        const invoice = JSON.parse(buffer.toString()) as Invoice;

        // Update only possible for status new
        if (invoice.status != `new`){
            throw new Error(`The invoice ${invoiceKey} has status ${invoice.status}`);
        }

        invoice.status = `rejected`;
        buffer = Buffer.from(JSON.stringify(invoice));
        await ctx.stub.putState(invoiceKey.toString(), buffer);
    }

    @Transaction()
    public async acceptInvoice(ctx: Context, invoiceKey: string): Promise<void> {
        // Check existence
        const exists = await this.invoiceExists(ctx, invoiceKey);
        if (!exists) {
            throw new Error(`The invoice ${invoiceKey} does not exist`);
        }

        // Check authority
        const authorized = await this.isAuthorized(ctx, invoiceKey);
        if (!authorized) {
            throw new Error(`Not authorized to update invoice ${invoiceKey}`);
        }

        // Get the existing data
        let buffer = await ctx.stub.getState(invoiceKey.toString());
        const invoice = JSON.parse(buffer.toString()) as Invoice;

        // Update only possible for status new
        if (invoice.status != `new`){
            throw new Error(`The invoice ${invoiceKey} has status ${invoice.status}`);
        }

        invoice.status = `accepted`;
        buffer = Buffer.from(JSON.stringify(invoice));
        await ctx.stub.putState(invoiceKey.toString(), buffer);
    }

    @Transaction()
    public async deleteInvoice(ctx: Context, invoiceKey: string): Promise<void> {
        // Check existence
        const exists = await this.invoiceExists(ctx, invoiceKey);
        if (!exists) {
            throw new Error(`The invoice ${invoiceKey} does not exist`);
        }

        // Check authority
        const authorized = await this.isAuthorized(ctx, invoiceKey);
        if (!authorized) {
            throw new Error(`Not authorized to update invoice ${invoiceKey}`);
        }

        // Get the existing data
        let buffer = await ctx.stub.getState(invoiceKey.toString());
        const invoice = JSON.parse(buffer.toString()) as Invoice;

        // Only allow the deletion of new invoices
        if (invoice.status != `new`){
            throw new Error(`The invoice ${invoiceKey} has status ${invoice.status}`);
        }

        // Delete public data a.k.a. world state
        await ctx.stub.deleteState(invoiceKey.toString());

        // Get the private collection
        let response  = await ctx.stub.invokeChaincode(`member-contract`, [`getMemberCollection`, invoice.receiver], ctx.stub.getChannelID());
        let collection = response.payload.toString('utf8');

        if(!!collection == false){
            throw new Error(`Could not determine collection for ${invoice.receiver}`);
        }

        // Delete the private data
        await ctx.stub.deletePrivateData(collection, invoiceKey.toString());
    }

    @Transaction(false)
    @Returns('string')
    public async GetAllInvoices(ctx: Context): Promise<string> {
        // Get all invoices from the world state
        const iterator = await ctx.stub.getStateByRange('', '');
        const allResults = [];
        while (true) {
            const res = await iterator.next();
            if (res.value && res.value.value.toString()) {
                console.log(res.value.value.toString('utf8'));

                const Key = res.value.key;
                let Record;
                try {
                    Record = JSON.parse(res.value.value.toString('utf8'));
                } catch (err) {
                    console.log(err);
                    Record = res.value.value.toString('utf8');
                }
                allResults.push({ Key, Record });
            }
            if (res.done) {
                console.log('end of data');
                await iterator.close();
                console.info(allResults);
                return JSON.stringify(allResults);
            }
        }
    }

    @Transaction(false)
    @Returns('string')
    public async GetHistory(ctx: Context, invoiceKey: string): Promise<string> {
        const iterator = await ctx.stub.getHistoryForKey(invoiceKey);
        const allResults = [];
        while (true) {
            const res = await iterator.next();
            if (res.value && res.value.value.toString()) {
                console.log(res.value.value.toString('utf8'));

                const tx_id = res.value.tx_id;
                const timestamp = res.value.timestamp;
                let record;
                try {
                    record = JSON.parse(res.value.value.toString('utf8'));
                } catch (err) {
                    console.log(err);
                    record = res.value.value.toString('utf8');
                }
                allResults.push({ tx_id, timestamp, record });
            }
            if (res.done) {
                console.log('end of data');
                await iterator.close();
                console.info(allResults);
                return JSON.stringify(allResults);
            }
        }
    }

    @Transaction(false)
    @Returns('string')
    public async GetAllRelevantInvoices(ctx: Context, memberId: string): Promise<string> {
        // Get all invoices from the world state for the member
        const iterator = await ctx.stub.getStateByRange('', '');
        const allResults = [];
        while (true) {
            const res = await iterator.next();
            if (res.value && res.value.value.toString()) {
                console.log(res.value.value.toString('utf8'));

                const Key = res.value.key;
                let Record: Invoice;
                try {
                    Record = JSON.parse(res.value.value.toString('utf8')) as Invoice;
                } catch (err) {
                    console.log(err);
                }
                //only return results where the member is involved
                if (Record.receiver == memberId || Record.sender == memberId){
                    allResults.push({ Key, Record });
                }
            }
            if (res.done) {
                console.log('end of data');
                await iterator.close();
                console.info(allResults);
                return JSON.stringify(allResults);
            }
        }
    }

}
