/// <reference path='_includes.ts' />

import { PersistenceManager } from './persistence/PersistenceManager';

let persistenceManager;

export function initializeSharedLibrary(databaseFileName:string):void {

	persistenceManager = new PersistenceManager();
	persistenceManager.initialize(databaseFileName);
}

export function handleRequest(ipcEvent:any, ipcEventArgs:any):any {

}
