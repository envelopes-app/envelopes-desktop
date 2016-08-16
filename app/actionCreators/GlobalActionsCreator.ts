/// <reference path="../_includes.ts" />

import { Promise } from 'es6-promise';

import { ApplicationState } from '../models/ApplicationState';
import { PersistenceManager } from '../persistence/PersistenceManager';
import * as GlobalActions from '../interfaces/actions/GlobalActions';

export class GlobalActionsCreator {

	// ********************************************************************************************
	// Action Names
	// ********************************************************************************************
	public INITIALIZE_DATABASE:string = "INITIALIZE_DATABASE";
	public SYNC_DATA_WITH_STORE:string = "SYNC_DATA_WITH_STORE";
	public SYNCED_DATA_WITH_STORE:string = "SYNCED_DATA_WITH_STORE";

	// ********************************************************************************************
	// Action Creators
	// ********************************************************************************************
	public static initializeDatabase(refreshDatabase:boolean = false) {

		return function(dispatch:ReactRedux.Dispatch<ApplicationState>) {

			// Initialize the persistence manager. This would create the database if it does 
			// not already exist. If it does, then this would ensure that any pending migrations 
			// are run on the database.
			return PersistenceManager.initialize(refreshDatabase)
				.then((retVal:boolean)=>{

					// If this is the first time that the user is launching the application, the database
					// would be empty. This ensures that we have a user and a budget created for first time use.
					return PersistenceManager.createInitialUserAndBudget();					
				});
		};
	}
}
