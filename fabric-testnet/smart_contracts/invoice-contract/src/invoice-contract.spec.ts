/*
 * SPDX-License-Identifier: Apache-2.0
 */

import { Context } from 'fabric-contract-api';
import { ChaincodeStub, ClientIdentity } from 'fabric-shim';
import { InvoiceContract } from '.';

import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import * as sinon from 'sinon';
import * as sinonChai from 'sinon-chai';
import winston = require('winston');

chai.should();
chai.use(chaiAsPromised);
chai.use(sinonChai);

class TestContext implements Context {
    public stub: sinon.SinonStubbedInstance<ChaincodeStub> = sinon.createStubInstance(ChaincodeStub);
    public clientIdentity: sinon.SinonStubbedInstance<ClientIdentity> = sinon.createStubInstance(ClientIdentity);
    public logging = {
        getLogger: sinon.stub().returns(sinon.createStubInstance(winston.createLogger().constructor)),
        setLevel: sinon.stub(),
     };
}

describe('InvoiceContract', () => {

    let contract: InvoiceContract;
    let ctx: TestContext;

    beforeEach(() => {
        contract = new InvoiceContract();
        ctx = new TestContext();
        ctx.stub.getState.withArgs('1001').resolves(Buffer.from('{"value":"invoice 1001 value"}'));
        ctx.stub.getState.withArgs('1002').resolves(Buffer.from('{"value":"invoice 1002 value"}'));
    });

    describe('#invoiceExists', () => {

        it('should return true for a invoice', async () => {
            await contract.invoiceExists(ctx, '1001').should.eventually.be.true;
        });

        it('should return false for a invoice that does not exist', async () => {
            await contract.invoiceExists(ctx, '1003').should.eventually.be.false;
        });

    });

    describe('#createInvoice', () => {

        it('should create a invoice', async () => {
            await contract.createInvoice(ctx, '1003', 'invoice 1003 value');
            ctx.stub.putState.should.have.been.calledOnceWithExactly('1003', Buffer.from('{"value":"invoice 1003 value"}'));
        });

        it('should throw an error for a invoice that already exists', async () => {
            await contract.createInvoice(ctx, '1001', 'myvalue').should.be.rejectedWith(/The invoice 1001 already exists/);
        });

    });

    describe('#readInvoice', () => {

        it('should return a invoice', async () => {
            await contract.readInvoice(ctx, '1001').should.eventually.deep.equal({ value: 'invoice 1001 value' });
        });

        it('should throw an error for a invoice that does not exist', async () => {
            await contract.readInvoice(ctx, '1003').should.be.rejectedWith(/The invoice 1003 does not exist/);
        });

    });

    describe('#updateInvoice', () => {

        it('should update a invoice', async () => {
            await contract.updateInvoice(ctx, '1001', 'invoice 1001 new value');
            ctx.stub.putState.should.have.been.calledOnceWithExactly('1001', Buffer.from('{"value":"invoice 1001 new value"}'));
        });

        it('should throw an error for a invoice that does not exist', async () => {
            await contract.updateInvoice(ctx, '1003', 'invoice 1003 new value').should.be.rejectedWith(/The invoice 1003 does not exist/);
        });

    });

    describe('#deleteInvoice', () => {

        it('should delete a invoice', async () => {
            await contract.deleteInvoice(ctx, '1001');
            ctx.stub.deleteState.should.have.been.calledOnceWithExactly('1001');
        });

        it('should throw an error for a invoice that does not exist', async () => {
            await contract.deleteInvoice(ctx, '1003').should.be.rejectedWith(/The invoice 1003 does not exist/);
        });

    });

});
