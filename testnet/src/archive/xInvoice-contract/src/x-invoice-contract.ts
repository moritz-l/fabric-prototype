/*
 * SPDX-License-Identifier: Apache-2.0
 */

import { Context, Contract, Info, Returns, Transaction } from 'fabric-contract-api';
import { XInvoice, XInvoicePrivateData } from './x-invoice';

@Info({title: 'XInvoiceContract', description: 'Contract for XInvoices' })
export class XInvoiceContract extends Contract {

    @Transaction(false)
    @Returns('boolean')
    public async xInvoiceExists(ctx: Context, invoiceKey: number): Promise<boolean> {

        const buffer = await ctx.stub.getState(invoiceKey.toString());
        return (!!buffer && buffer.length > 0);
    }

    @Transaction()
    public async createInvoice(ctx: Context, InvoiceId: string, sender: string, receiver: string): Promise<void> {

        const key = `${sender}${receiver}${InvoiceId}`;
        const invoiceKey = key.split('').reduce((a,b)=>{a=((a<<5)-a)+b.charCodeAt(0);return a&a},0)

        const exists = await this.xInvoiceExists(ctx, invoiceKey);
        if (exists) {
            throw new Error(`The invoice ${InvoiceId} already exists`);
        }
        const xInvoice = new XInvoice();

        const transientData = ctx.stub.getTransient();
        if (!!transientData){
            let response  = await ctx.stub.invokeChaincode(`member-chainchode`, [`readMemberCollectionId`, receiver], ctx.stub.getChannelID());
            let collection = response.payload.toString('utf8')

            const xInvoicePrivateData = new XInvoicePrivateData();
            //const privateCollectionName = `colOrg1MSPOrg2MSP`;

            xInvoicePrivateData.file = `Hi :)`;
            const privateBuffer = Buffer.from(JSON.stringify(xInvoicePrivateData));

            ctx.stub.putPrivateData(collection, invoiceKey.toString(), privateBuffer);
        }

        xInvoice.invoiceId = InvoiceId;
        xInvoice.sender = sender;
        xInvoice.processor = xInvoice.receiver = receiver;
        xInvoice.status = `new`;

        const buffer = Buffer.from(JSON.stringify(xInvoice));
        await ctx.stub.putState(invoiceKey.toString(), buffer);

    }

    @Transaction(false)
    @Returns('XInvoice')
    public async readXInvoice(ctx: Context, invoiceKey: number): Promise<XInvoice> {

        const exists = await this.xInvoiceExists(ctx, invoiceKey);
        if (!exists) {
            throw new Error(`The invoice ${invoiceKey} does not exist`);
        }
        const buffer = await ctx.stub.getState(invoiceKey.toString());
        const xInvoice = JSON.parse(buffer.toString()) as XInvoice;

        return xInvoice;
    }

    @Transaction(false)
    @Returns('XInvoice')
    public async readXInvoicePrivateData(ctx: Context, invoiceKey: number): Promise<XInvoicePrivateData> {

        const exists = await this.xInvoiceExists(ctx, invoiceKey);
        if (!exists) {
            throw new Error(`The invoice ${invoiceKey} does not exist`);
        }

        let buffer = await ctx.stub.getState(invoiceKey.toString());
        const xInvoice = JSON.parse(buffer.toString()) as XInvoice;

        let response = await ctx.stub.invokeChaincode(`member-chainchode`, [`readMemberCollectionId`, xInvoice.receiver], ctx.stub.getChannelID());
        let collection = response.payload.toString('utf8');


        buffer = await ctx.stub.getPrivateData(collection, invoiceKey.toString());
        const xInvoicePrivateData = JSON.parse(buffer.toString()) as XInvoicePrivateData;

        return xInvoicePrivateData;
    }

    @Transaction()
    public async rejectXInvoice(ctx: Context, invoiceKey: number): Promise<void> {

        const exists = await this.xInvoiceExists(ctx, invoiceKey);
        if (!exists) {
            throw new Error(`The invoice ${invoiceKey} does not exist`);
        }
        const xInvoice = new XInvoice();
        xInvoice.status = `rejected`;
        const buffer = Buffer.from(JSON.stringify(xInvoice));
        await ctx.stub.putState(invoiceKey.toString(), buffer);

    }

    @Transaction()
    public async deleteXInvoice(ctx: Context, invoiceKey: number): Promise<void> {

        const exists = await this.xInvoiceExists(ctx, invoiceKey);
        if (!exists) {
            throw new Error(`The invoice ${invoiceKey} does not exist`);
        }
        await ctx.stub.deleteState(invoiceKey.toString());
        const privateCollectionName = `colOrg1MSPOrg2MSP`;
        await ctx.stub.deletePrivateData(privateCollectionName, invoiceKey.toString());
    }

    @Transaction(false)
    @Returns('string')
    public async GetAllXInvoices(ctx: Context): Promise<string> {

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
