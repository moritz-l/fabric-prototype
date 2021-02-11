/*
 * SPDX-License-Identifier: Apache-2.0
 */

import { Object, Property } from 'fabric-contract-api';

@Object()
export class User {

    @Property()
    public passwordHash: string;

    @Property()
    public salt: string;

}
