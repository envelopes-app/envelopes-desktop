/// <reference path='../../_includes.ts' />

import * as _ from 'lodash';

import { BudgetKnowledge } from '../KnowledgeObjects';
import { IDatabaseQuery } from '../../interfaces/persistence'; 
import * as budgetEntities from '../../interfaces/budgetEntities';
import * as budgetQueries from '../queries/budgetQueries';
import { CalculationQueries } from '../queries/miscQueries';
import { IEntitiesCollection, ISimpleEntitiesCollection } from '../../interfaces/state';

export class SubCategoryHelper {

	public getPersistenceQueries(budgetId:string,
				changedEntities:ISimpleEntitiesCollection,
				originalEntities:IEntitiesCollection,
				budgetKnowledge:BudgetKnowledge):Array<IDatabaseQuery> {

		var query:IDatabaseQuery;
		var queriesList:Array<IDatabaseQuery> = [];

		if(changedEntities.subCategories) {

			_.forEach(changedEntities.subCategories, (changedEntity:budgetEntities.ISubCategory)=> {

				// Set the budgetId and update the deviceKnowledge value on the entity
				changedEntity.budgetId = budgetId;
				changedEntity.deviceKnowledge = budgetKnowledge.getNextValue();

				// Add the query to the list to update this entity in the database
				queriesList.push(budgetQueries.SubCategoryQueries.insertDatabaseObject(changedEntity));

				// Get the original entity against this changed entity.
				var originalEntity:budgetEntities.ISubCategory = originalEntities.subCategories.getEntityById(changedEntity.entityId);

				// Check whether the changes to this entity would require a recalculation
				query = this.getCalculationInvalidationQuery(budgetId, originalEntity, changedEntity);
				if(query)
					queriesList.push(query);
			});
		}

		return queriesList;
	}

	private getCalculationInvalidationQuery(budgetId:string, originalEntity:budgetEntities.ISubCategory, updatedEntity:budgetEntities.ISubCategory):IDatabaseQuery {

		if(!originalEntity || updatedEntity.masterCategoryId != originalEntity.masterCategoryId ||
			updatedEntity.goalType != originalEntity.goalType ||
			updatedEntity.goalCreationMonth != originalEntity.goalCreationMonth ||
			updatedEntity.targetBalance != originalEntity.targetBalance ||
			updatedEntity.targetBalanceMonth != originalEntity.targetBalanceMonth ||
			updatedEntity.monthlyFunding != originalEntity.monthlyFunding ||
			updatedEntity.isTombstone != originalEntity.isTombstone) {

			return CalculationQueries.getQueueMonthlySubCategoryBudgetCalculationQuery(budgetId, updatedEntity.entityId, null);
		}

		return null;
	}
}