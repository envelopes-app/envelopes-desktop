/// <reference path='../_includes.ts' />

import * as uuid from 'node-uuid';

export class KeyGenerator {

	public static generateUUID():string {

		return uuid.v4();
	}
}