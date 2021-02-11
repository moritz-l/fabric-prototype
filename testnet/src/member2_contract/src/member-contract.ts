/*
 * SPDX-License-Identifier: Apache-2.0
 */

import { Context, Contract, Info, Returns, Transaction } from 'fabric-contract-api';
import { Member } from './member';

@Info({title: 'MemberContract', description: 'Contract for membership services' })
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
    public async getMemberCollection(ctx: Context, memberId: string): Promise<string> {
        const exists = await this.memberExists(ctx, memberId);
        if (!exists) {
            throw new Error(`The member ${memberId} does not exist`);
        }
        const buffer = await ctx.stub.getState(memberId);
        const member = JSON.parse(buffer.toString()) as Member;
        return member.collectionId;
    }

    @Transaction(false)
    @Returns('Member')
    public async getMemberPublicKey(ctx: Context, memberId: string): Promise<string> {
        const exists = await this.memberExists(ctx, memberId);
        if (!exists) {
            throw new Error(`The member ${memberId} does not exist`);
        }
        const buffer = await ctx.stub.getState(memberId);
        const member = JSON.parse(buffer.toString()) as Member;
        return member.publicKey;
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
    @Returns('boolean')
    public async checkAuthority(ctx: Context, memberId: string): Promise<boolean> {
        const exists = await this.memberExists(ctx, memberId);
        if (!exists) {
            throw new Error(`The member ${memberId} does not exist`);
        }

        const buffer = await ctx.stub.getState(memberId);

        const member = JSON.parse(buffer.toString()) as Member;
        if (member.mspId == ctx.clientIdentity.getMSPID()){
            return true;
        } else {
            return false;
        }
    }

    @Transaction(false)
    @Returns('string')
    public async GetAllMembers(ctx: Context): Promise<string> {
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

}
