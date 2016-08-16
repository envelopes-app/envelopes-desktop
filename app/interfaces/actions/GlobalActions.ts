import { IEntitiesCollection } from '../state/IEntitiesCollection';
import * as catalogEntities from '../catalogEntities';

export interface CreateBudgetCompletedAction extends Redux.Action { 
	// budgetId of the newly created budget 
	budgetId:string;
}

export interface LoadBudgetCompletedAction extends Redux.Action { 
	// The opened budget 
	budget:catalogEntities.IBudget;
}

export interface SyncDataWithDatabaseCompletedAction extends Redux.Action { 
	// Collection that contains updated entities that have been loaded from the database 
	entities:IEntitiesCollection;
}
