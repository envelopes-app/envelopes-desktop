/// <reference path="../../_includes.ts" />

import { DateWithoutTime } from '../../utilities';
import * as catalogEntities from '../catalogEntities';
import { ISimpleEntitiesCollection } from '../state/IEntitiesCollection';

export interface CreateBudgetCompletedAction extends Redux.Action { 
	// budgetId of the newly created budget 
	budgetId:string;
}

export interface CloneBudgetCompletedAction extends Redux.Action { 
	// Newly created catalog entities for the cloned budget
	entities:ISimpleEntitiesCollection;
}

export interface FreshStartBudgetCompletedAction extends CloneBudgetCompletedAction { }

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

export interface EnsureBudgetEntitiesForMonthCompletedAction extends Redux.Action { 
	month:DateWithoutTime;
}
