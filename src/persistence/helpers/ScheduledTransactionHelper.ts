/// <reference path='../../_includes.ts' />

import * as _ from 'lodash';

import { BudgetKnowledge } from '../KnowledgeObjects';
import { IDatabaseQuery } from '../../interfaces/persistence'; 
import * as budgetEntities from '../../interfaces/budgetEntities';
import * as budgetQueries from '../queries/budgetQueries';
import { CalculationQueries } from '../queries/miscQueries';
import { IEntitiesCollection, ISimpleEntitiesCollection } from '../../interfaces/state';

export class ScheduledTransactionHelper {

	public getPersistenceQueries(budgetId:string,
				changedEntities:ISimpleEntitiesCollection,
				originalEntities:IEntitiesCollection,
				budgetKnowledge:BudgetKnowledge):Array<IDatabaseQuery> {

		var query:IDatabaseQuery;
		var queriesList:Array<IDatabaseQuery> = [];

		if(changedEntities.scheduledTransactions) {

			_.forEach(changedEntities.scheduledTransactions, (changedEntity:budgetEntities.IScheduledTransaction)=> {

				// Set the budgetId and update the deviceKnowledge value on the entity
				changedEntity.budgetId = budgetId;
				changedEntity.deviceKnowledge = budgetKnowledge.getNextValue();

				// Get the original entity against this changed entity.
				var originalEntity:budgetEntities.IScheduledTransaction = originalEntities.scheduledTransactions.getEntityById(changedEntity.entityId);

				// If the date or frequency of this scheduled transaction has changed, then clear out it's upcomingInstanceDates as
				// they need to be recalculated.
				if(originalEntity && (changedEntity.frequency != originalEntity.frequency || changedEntity.date != originalEntity.date)) {
					changedEntity.upcomingInstances = null;
				}

				// Add the query to the list to update this entity in the database
				queriesList.push(budgetQueries.ScheduledTransactionQueries.insertDatabaseObject(changedEntity));

				// Check whether the changes to this entity would require a recalculation
				query = this.getCalculationInvalidationQuery(budgetId, originalEntity, changedEntity);
				if(query)
					queriesList.push(query);
			});
		}

		return queriesList;
	}

	private getCalculationInvalidationQuery(budgetId:string, originalEntity:budgetEntities.IScheduledTransaction, updatedEntity:budgetEntities.IScheduledTransaction):IDatabaseQuery {

		// If this is a new entity, or the frequency/date property changes, then invalidate the calculations for this scheduled transaction entity
		if(!originalEntity || updatedEntity.frequency != originalEntity.frequency || updatedEntity.date != originalEntity.date) {
			return CalculationQueries.getQueueScheduledTransactionCalculationQuery(budgetId, updatedEntity.entityId);
		}

		return null;
	}
}