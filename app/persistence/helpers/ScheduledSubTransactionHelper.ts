/// <reference path='../../_includes.ts' />

import * as _ from 'lodash';

import { BudgetKnowledge } from '../KnowledgeObjects';
import { IDatabaseQuery } from '../../interfaces/persistence'; 
import * as budgetEntities from '../../interfaces/budgetEntities';
import * as budgetQueries from '../queries/budgetQueries';
import { IEntitiesCollection, ISimpleEntitiesCollection } from '../../interfaces/state';

export class ScheduledSubTransactionHelper {

	public getPersistenceQueries(budgetId:string,
				changedEntities:ISimpleEntitiesCollection,
				originalEntities:IEntitiesCollection,
				budgetKnowledge:BudgetKnowledge):Array<IDatabaseQuery> {

		var queriesList:Array<IDatabaseQuery> = [];

		if(changedEntities.scheduledSubTransactions) {

			_.forEach(changedEntities.scheduledSubTransactions, function(changedEntity:budgetEntities.IScheduledSubTransaction) {

				// Set the budgetId and update the deviceKnowledge value on the entity
				changedEntity.budgetId = budgetId;
				changedEntity.deviceKnowledge = budgetKnowledge.getNextValue();

				// Add the query to the list to update this entity in the database
				queriesList.push(budgetQueries.ScheduledSubTransactionQueries.insertDatabaseObject(changedEntity));
			});
		}

		return queriesList;
	}
}