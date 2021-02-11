/*
 * SPDX-License-Identifier: Apache-2.0
 */

import { Context, Contract, Info, Returns, Transaction } from 'fabric-contract-api';
import { User } from './user';

@Info({title: 'UserContract', description: 'Contract for user management' })
export class UserContract extends Contract {

    @Transaction(false)
    @Returns('boolean')
    public async userExists(ctx: Context, userId: string): Promise<boolean> {
        const collection = `col${ctx.clientIdentity.getMSPID()}`;
        const buffer = await ctx.stub.getPrivateData(collection, userId);
        return (!!buffer && buffer.length > 0);
    }

    @Transaction()
    public async createUser(ctx: Context, userId: string, passwordHash: string, salt: string): Promise<void> {
        const exists = await this.userExists(ctx, userId);
        if (exists) {
            throw new Error(`The user ${userId} already exists`);
        }
        const user = new User();
        user.passwordHash = passwordHash;
        user.salt = salt;
        const buffer = Buffer.from(JSON.stringify(user));
        const collection = `col${ctx.clientIdentity.getMSPID()}`;
        await ctx.stub.putPrivateData(collection, userId, buffer);
    }

    @Transaction()
    public async updateUser(ctx: Context, userId: string, newPasswordHash: string, newSalt: string): Promise<void> {
        const exists = await this.userExists(ctx, userId);
        if (!exists) {
            throw new Error(`The user ${userId} does not exist`);
        }
        const user = new User();
        user.passwordHash = newPasswordHash;
        user.salt = newSalt;
        const buffer = Buffer.from(JSON.stringify(user));
        const collection = `col${ctx.clientIdentity.getMSPID()}`;
        await ctx.stub.putPrivateData(collection, userId, buffer);
    }

    @Transaction(false)
    @Returns('User')
    public async readUser(ctx: Context, userId: string): Promise<User> {
        const exists = await this.userExists(ctx, userId);
        if (!exists) {
            throw new Error(`The user ${userId} does not exist`);
        }
        const collection = `col${ctx.clientIdentity.getMSPID()}`;
        const buffer = await ctx.stub.getPrivateData(collection, userId);
        return JSON.parse(buffer.toString()) as User;
    }

    @Transaction()
    public async deleteUser(ctx: Context, userId: string): Promise<void> {
        const exists = await this.userExists(ctx, userId);
        if (!exists) {
            throw new Error(`The user ${userId} does not exist`);
        }
        const collection = `col${ctx.clientIdentity.getMSPID()}`;
        await ctx.stub.deletePrivateData(collection, userId);
    }

}
