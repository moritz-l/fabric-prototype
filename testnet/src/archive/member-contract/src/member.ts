/*
 * SPDX-License-Identifier: Apache-2.0
 */

import { Object, Property } from 'fabric-contract-api';

@Object()
export class Adress {
    
    @Property()
    public street: string

    @Property()
    public city: string
}

@Object()
export class Member {    
    @Property()
    public mspId: string;

    @Property()
    public adress: Adress

    @Property()
    public name: string

    @Property()
    public publicKey: string

    @Property()
    public active: boolean

    @Property()
    public collectionId: string
}
