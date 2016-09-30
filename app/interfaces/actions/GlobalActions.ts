/// <reference path="../../_includes.ts" />

import { ISimpleEntitiesCollection } from '../state/IEntitiesCollection';
import * as catalogEntities from '../catalogEntities';

export interface CreateBudgetCompletedAction extends Redux.Action { 
	// budgetId of the newly created budget 
	budgetId:string;
}

export interface OpenBudgetCompletedAction extends Redux.Action { 
	// The opened budget 
	budget:catalogEntities.IBudget;
	// All the entities for the budget
	entities:ISimpleEntitiesCollection;
}

export interface SyncDataWithDatabaseCompletedAction extends Redux.Action { 
	// Collection that contains updated entities that have been loaded from the database 
	entities:ISimpleEntitiesCollection;
}
