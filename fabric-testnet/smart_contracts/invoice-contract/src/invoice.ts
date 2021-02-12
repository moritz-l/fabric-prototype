/*
 * SPDX-License-Identifier: Apache-2.0
 */

import { Object, Property } from 'fabric-contract-api';

@Object()
export class Invoice {

    @Property()
    public invoiceNumber: string;

    @Property()
    public sender: string;

    @Property()
    public receiver: string;

    @Property()
    public status: string;

    @Property()
    public processor: string;

}

