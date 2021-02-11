/*
 * SPDX-License-Identifier: Apache-2.0
 */

import { Context, Contract, Info, Returns, Transaction } from 'fabric-contract-api';
import { Member } from './member';

@Info({title: 'MemberContract', description: 'Contract for memebership services' })
export class MemberContract extends Contract {

    @Transaction(false)
    @Returns('boolean')
    public async memberExists(ctx: Context, memberId: string): Promise<boolean> {
        const buffer = await ctx.stub.getState(memberId);
        return (!!buffer && buffer.length > 0);
    }

    @Transaction()
    public async enrollMember(ctx: Context, memberId: string, publicKey: string): Promise<void> {
        const exists = await this.memberExists(ctx, memberId);
        if (exists) {
            throw new Error(`The member ${memberId} already exists`);
        }
        
        const member = new Member();
        member.mspId = ctx.clientIdentity.getMSPID();
        member.publicKey = publicKey;
        member.collectionId = `col${member.mspId}`;

        const buffer = Buffer.from(JSON.stringify(member));
        await ctx.stub.putState(memberId, buffer);
    }

    @Transaction(false)
    @Returns('Member')
    public async readMember(ctx: Context, memberId: string): Promise<Member> {
        const exists = await this.memberExists(ctx, memberId);
        if (!exists) {
            throw new Error(`The member ${memberId} does not exist`);
        }
        const buffer = await ctx.stub.getState(memberId);
        const member = JSON.parse(buffer.toString()) as Member;
        return member;
    }

    @Transaction(false)
    @Returns('Member')
    public async readMemberCollectionId(ctx: Context, memberId: string): Promise<string> {
        const exists = await this.memberExists(ctx, memberId);
        if (!exists) {
            throw new Error(`The member ${memberId} does not exist`);
        }
        const buffer = await ctx.stub.getState(memberId);
        const member = JSON.parse(buffer.toString()) as Member;
        return member.collectionId;
    }

    @Transaction()
    public async updateMember(ctx: Context, memberId: string, newPublicKey: string): Promise<void> {
        const exists = await this.memberExists(ctx, memberId);
        if (!exists) {
            throw new Error(`The member ${memberId} does not exist`);
        }
        const member = new Member();
        member.publicKey = newPublicKey;
        const buffer = Buffer.from(JSON.stringify(member));
        await ctx.stub.putState(memberId, buffer);
    }

    @Transaction()
    public async deleteMember(ctx: Context, memberId: string): Promise<void> {
        const exists = await this.memberExists(ctx, memberId);
        if (!exists) {
            throw new Error(`The member ${memberId} does not exist`);
        }
        await ctx.stub.deleteState(memberId);
    }

    @Transaction(false)
    @Returns('string')
    public async GetAllMembers(ctx: Context): Promise<string> {
        const allResults = [];
        // range query with empty string for startKey and endKey does an open-ended query of all assets in the chaincode namespace.
        const iterator = await ctx.stub.getStateByRange('', '');
        let result = await iterator.next();
        while (!result.done) {
            const strValue = Buffer.from(result.value.value.toString()).toString('utf8');
            let record;
            try {
                record = JSON.parse(strValue) as Member;
            } catch (err) {
                console.log(err);
                record = strValue;
            }
            allResults.push({memberId: result.value.key, Record: record});
            result = await iterator.next();
        }
        return JSON.stringify(allResults);
    }

}
