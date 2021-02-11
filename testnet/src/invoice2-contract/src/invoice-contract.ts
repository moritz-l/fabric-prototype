/*
 * SPDX-License-Identifier: Apache-2.0
 */

import { Context, Contract, Info, Returns, Transaction } from 'fabric-contract-api';
import { Invoice } from './invoice';

@Info({title: 'InvoiceContract', description: 'Basic invoice contract' })
export class InvoiceContract extends Contract {

    @Transaction(false)
    @Returns('boolean')
    public async invoiceExists(ctx: Context, invoiceKey: string): Promise<boolean> {
        const buffer = await ctx.stub.getState(invoiceKey.toString());
        return (!!buffer && buffer.length > 0);
    }

    @Transaction()
    public async createInvoice(ctx: Context, invoiceNumber: string, sender: string, receiver: string): Promise<void> {

        //Check if the members submitted as sender and receiver exist
        let memberExists = await (await ctx.stub.invokeChaincode(`member2_contract`, [`memberExists`, sender], ctx.stub.getChannelID())).payload.toString('utf8');
        if (memberExists == 'false'){
            throw new Error(`The sender ${sender} does not exist`);
        } else {
            memberExists = await (await ctx.stub.invokeChaincode(`member2_contract`, [`memberExists`, receiver], ctx.stub.getChannelID())).payload.toString('utf8');
            if (memberExists == 'false'){
                throw new Error(`The receiver ${receiver} does not exist`);
            }
        }

        //Key-creation has to be deterministic to ensure endorsement
        const invoiceKey = `${sender}_${receiver}_${invoiceNumber}`;

        //Check if key has already been issued
        const exists = await this.invoiceExists(ctx, invoiceKey);
        if (exists) {
            throw new Error(`The invoice ${invoiceKey} already exists`);
        }

        //NOTE: transientData can be read by endorsing peers and should be encrypted with the public key
        const transientData = ctx.stub.getTransient();

        //Save transientData to private data collection
        if (!!transientData){
            const invoicePrivateData = transientData.get('private');
            const privateData = JSON.stringify(invoicePrivateData.toString('utf8'));

            let response  = await ctx.stub.invokeChaincode(`member2_contract`, [`getMemberCollection`, receiver], ctx.stub.getChannelID());
            let collection = response.payload.toString('utf8');

            if(!!collection == false){
                throw new Error(`Could not determine collection for ${receiver}`);
            }

            const saveData = Buffer.from(privateData);
            ctx.stub.putPrivateData(collection, invoiceKey.toString(), saveData);
        }

        //Save the public state of the invoice
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
    public async readInvoicePrivateData(ctx: Context, invoiceKey: string): Promise<string> {
        const exists = await this.invoiceExists(ctx, invoiceKey);
        if (!exists) {
            throw new Error(`The invoice ${invoiceKey} does not exist`);
        }

        //Get the invoice data
        let buffer = await ctx.stub.getState(invoiceKey.toString());
        const invoice = JSON.parse(buffer.toString()) as Invoice;

        //Get the private collection
        let response  = await ctx.stub.invokeChaincode(`member2_contract`, [`getMemberCollection`, invoice.receiver], ctx.stub.getChannelID());
        let collection = response.payload.toString('utf8');

        if(!!collection == false){
            throw new Error(`Could not determine collection for ${invoice.receiver}`);
        }

        //Retrieve data from the private collection
        buffer = await ctx.stub.getPrivateData(collection, invoiceKey.toString());
        return buffer.toString();
    }

    @Transaction(false)
    @Returns('Invoice')
    public async readInvoice(ctx: Context, invoiceKey: string): Promise<Invoice> {
        const exists = await this.invoiceExists(ctx, invoiceKey);
        if (!exists) {
            throw new Error(`The invoice ${invoiceKey} does not exist`);
        }
        const buffer = await ctx.stub.getState(invoiceKey.toString());
        const invoice = JSON.parse(buffer.toString()) as Invoice;

        return invoice;
    }


    @Transaction()
    public async rejectInvoice(ctx: Context, invoiceKey: string): Promise<void> {

        const exists = await this.invoiceExists(ctx, invoiceKey);
        if (!exists) {
            throw new Error(`The invoice ${invoiceKey} does not exist`);
        }

        let buffer = await ctx.stub.getState(invoiceKey.toString());
        const invoice = JSON.parse(buffer.toString()) as Invoice;

        if (invoice.status != `new`){
            throw new Error(`The invoice ${invoiceKey} has status ${invoice.status}`);
        }

        invoice.status = `rejected`;
        buffer = Buffer.from(JSON.stringify(invoice));
        await ctx.stub.putState(invoiceKey.toString(), buffer);
    }

    @Transaction()
    public async acceptInvoice(ctx: Context, invoiceKey: string): Promise<void> {

        const exists = await this.invoiceExists(ctx, invoiceKey);
        if (!exists) {
            throw new Error(`The invoice ${invoiceKey} does not exist`);
        }

        let buffer = await ctx.stub.getState(invoiceKey.toString());
        const invoice = JSON.parse(buffer.toString()) as Invoice;

        if (invoice.status != `new`){
            throw new Error(`The invoice ${invoiceKey} has status ${invoice.status}`);
        }

        invoice.status = `accepted`;
        buffer = Buffer.from(JSON.stringify(invoice));
        await ctx.stub.putState(invoiceKey.toString(), buffer);
    }

    @Transaction()
    public async deleteInvoice(ctx: Context, invoiceKey: string): Promise<void> {

        const exists = await this.invoiceExists(ctx, invoiceKey);
        if (!exists) {
            throw new Error(`The invoice ${invoiceKey} does not exist`);
        }
        let buffer = await ctx.stub.getState(invoiceKey.toString());
        const invoice = JSON.parse(buffer.toString()) as Invoice;

        //Only allow the deletion of new invoices
        if (invoice.status != `new`){
            throw new Error(`The invoice ${invoiceKey} has status ${invoice.status}`);
        }

        //Delete public data a.k.a. world state
        await ctx.stub.deleteState(invoiceKey.toString());

        //Get the private collection
        let response  = await ctx.stub.invokeChaincode(`member2_contract`, [`getMemberCollection`, invoice.receiver], ctx.stub.getChannelID());
        let collection = response.payload.toString('utf8');

        if(!!collection == false){
            throw new Error(`Could not determine collection for ${invoice.receiver}`);
        }

        //Delete the private data
        await ctx.stub.deletePrivateData(collection, invoiceKey.toString());
    }

    @Transaction(false)
    @Returns('string')
    public async GetAllInvoices(ctx: Context): Promise<string> {
        //Get all invoices from the world state
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
    public async GetAllRelevantInvoices(ctx: Context, memberId: string): Promise<string> {
        //Get all invoices from the world state for the member
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
