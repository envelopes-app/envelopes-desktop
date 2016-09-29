/// <reference path='../../_includes.ts' />

import * as _ from 'lodash';

import { BudgetKnowledge } from '../KnowledgeObjects';
import { IDatabaseQuery } from '../../interfaces/persistence'; 
import * as budgetEntities from '../../interfaces/budgetEntities';
import * as budgetQueries from '../queries/budgetQueries';
import { IEntitiesCollection, ISimpleEntitiesCollection } from '../../interfaces/state';

export class MonthlyBudgetHelper {

	public getPersistenceQueries(budgetId:string,
				changedEntities:ISimpleEntitiesCollection,
				originalEntities:IEntitiesCollection,
				budgetKnowledge:BudgetKnowledge):Array<IDatabaseQuery> {

		var queriesList:Array<IDatabaseQuery> = [];

		if(changedEntities.monthlyBudgets) {

			_.forEach(changedEntities.monthlyBudgets, function(changedEntity:budgetEntities.IMonthlyBudget) {

				// Set the budgetId and update the deviceKnowledge value on the entity
				changedEntity.budgetId = budgetId;
				changedEntity.deviceKnowledge = budgetKnowledge.getNextValue();

				// Add the query to the list to update this entity in the database
				queriesList.push(budgetQueries.MonthlyBudgetQueries.insertDatabaseObject(changedEntity));
			});
		}

		return queriesList;
	}
}