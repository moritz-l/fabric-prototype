/*
 * SPDX-License-Identifier: Apache-2.0
 */

import { Object, Property } from 'fabric-contract-api';

@Object()
export class XInvoice {

    @Property()
    public invoiceId: string;

    @Property()
    public sender: string;

    @Property()
    public receiver: string;

    @Property()
    public status: string;

    @Property()
    public processor: string;

    @Property()
    public creationDate: Date

}

@Object()
export class XInvoicePrivateData {

    @Property()
    public file: string;

}
