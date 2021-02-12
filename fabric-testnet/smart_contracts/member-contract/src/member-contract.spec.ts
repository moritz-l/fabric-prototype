/*
 * SPDX-License-Identifier: Apache-2.0
 */

import { Context } from 'fabric-contract-api';
import { ChaincodeStub, ClientIdentity } from 'fabric-shim';
import { MemberContract } from '.';

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

describe('MemberContract', () => {

    let contract: MemberContract;
    let ctx: TestContext;

    beforeEach(() => {
        contract = new MemberContract();
        ctx = new TestContext();
        ctx.stub.getState.withArgs('1001').resolves(Buffer.from('{"value":"member 1001 value"}'));
        ctx.stub.getState.withArgs('1002').resolves(Buffer.from('{"value":"member 1002 value"}'));
    });

    describe('#memberExists', () => {

        it('should return true for a member', async () => {
            await contract.memberExists(ctx, '1001').should.eventually.be.true;
        });

        it('should return false for a member that does not exist', async () => {
            await contract.memberExists(ctx, '1003').should.eventually.be.false;
        });

    });

    describe('#createMember', () => {

        it('should create a member', async () => {
            await contract.createMember(ctx, '1003', 'member 1003 value');
            ctx.stub.putState.should.have.been.calledOnceWithExactly('1003', Buffer.from('{"value":"member 1003 value"}'));
        });

        it('should throw an error for a member that already exists', async () => {
            await contract.createMember(ctx, '1001', 'myvalue').should.be.rejectedWith(/The member 1001 already exists/);
        });

    });

    describe('#readMember', () => {

        it('should return a member', async () => {
            await contract.readMember(ctx, '1001').should.eventually.deep.equal({ value: 'member 1001 value' });
        });

        it('should throw an error for a member that does not exist', async () => {
            await contract.readMember(ctx, '1003').should.be.rejectedWith(/The member 1003 does not exist/);
        });

    });

    describe('#updateMember', () => {

        it('should update a member', async () => {
            await contract.updateMember(ctx, '1001', 'member 1001 new value');
            ctx.stub.putState.should.have.been.calledOnceWithExactly('1001', Buffer.from('{"value":"member 1001 new value"}'));
        });

        it('should throw an error for a member that does not exist', async () => {
            await contract.updateMember(ctx, '1003', 'member 1003 new value').should.be.rejectedWith(/The member 1003 does not exist/);
        });

    });

    describe('#deleteMember', () => {

        it('should delete a member', async () => {
            await contract.deleteMember(ctx, '1001');
            ctx.stub.deleteState.should.have.been.calledOnceWithExactly('1001');
        });

        it('should throw an error for a member that does not exist', async () => {
            await contract.deleteMember(ctx, '1003').should.be.rejectedWith(/The member 1003 does not exist/);
        });

    });

});
