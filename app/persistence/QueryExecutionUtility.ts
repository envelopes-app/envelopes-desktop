/// <reference path='../_includes.ts' />

import { ipcRenderer } from 'electron';
import { Promise } from 'es6-promise';
import * as uuid from 'node-uuid';

import { IDatabaseQuery } from '../interfaces/persistence/IDatabaseQuery';
import { BudgetKnowledge } from './KnowledgeObjects';

export function executeSqlQueries(queryList:Array<IDatabaseQuery>):Promise<any> {

	return new Promise<any>((resolve, reject)=>{

		// We have to send this request to the main process for execution. 
		// Generate a new guid to uniquely identify this request. 
		var requestId:string = uuid.v4();
		// Use the requestId as the channel name to listen for the response
		ipcRenderer.once(requestId, function(event, ...args:any[]) {

			// If there was an error, it would be in the first args position
			if(args[0])
				reject(args[0]);

			// Resolve the promise object with the data received from the main process
			resolve(args[1]);
		});

		var payload:any = {
			requestId: requestId,
			queryList: queryList
		};
		// Send the request to the main process
		ipcRenderer.send("database-request", payload);
	});
}