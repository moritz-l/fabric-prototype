/*
 * SPDX-License-Identifier: Apache-2.0
 */

import { Object, Property } from 'fabric-contract-api';

@Object()
export class Member {
    @Property()
    public mspId: string;

    @Property()
    public creator: string;

    @Property()
    public name: string

    @Property()
    public collectionId: string

    @Property()
    public publicKey: string
}
