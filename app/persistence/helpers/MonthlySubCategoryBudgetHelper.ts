/// <reference path='../../_includes.ts' />

import * as _ from 'lodash';

import { KeyGenerator } from '../../utilities';
import { BudgetKnowledge } from '../KnowledgeObjects';
import { IDatabaseQuery } from '../../interfaces/persistence'; 
import * as budgetEntities from '../../interfaces/budgetEntities';
import * as budgetQueries from '../queries/budgetQueries';
import { CalculationQueries } from '../queries/miscQueries';
import { IEntitiesCollection, ISimpleEntitiesCollection } from '../../interfaces/state';

export class MonthlySubCategoryBudgetHelper {

	public getPersistenceQueries(budgetId:string,
				changedEntities:ISimpleEntitiesCollection,
				originalEntities:IEntitiesCollection,
				budgetKnowledge:BudgetKnowledge):Array<IDatabaseQuery> {

		var query:IDatabaseQuery;
		var queriesList:Array<IDatabaseQuery> = [];

		if(changedEntities.monthlySubCategoryBudgets) {

			_.forEach(changedEntities.monthlySubCategoryBudgets, (changedEntity:budgetEntities.IMonthlySubCategoryBudget)=> {

				// Set the budgetId and update the deviceKnowledge value on the entity
				changedEntity.budgetId = budgetId;
				changedEntity.deviceKnowledge = budgetKnowledge.getNextValue();

				// Add the query to the list to update this entity in the database
				queriesList.push(budgetQueries.MonthlySubCategoryBudgetQueries.insertDatabaseObject(changedEntity));

				// Get the original entity against this changed entity.
				var originalEntity:budgetEntities.IMonthlySubCategoryBudget = originalEntities.monthlySubCategoryBudgets.getEntityById(changedEntity.entityId);
				// Check whether the changes to this entity would require a recalculation
				query = this.getCalculationInvalidationQuery(budgetId, originalEntity, changedEntity);
				if(query)
					queriesList.push(query);
			});
		}

		return queriesList;
	}

	private getCalculationInvalidationQuery(budgetId:string, originalEntity:budgetEntities.IMonthlySubCategoryBudget, updatedEntity:budgetEntities.IMonthlySubCategoryBudget):IDatabaseQuery {

		// If this is a new entity, or the budgeted property changes, then invalidate the calculations for this monthly subcategory budget entity
		if(!originalEntity) {
			var month = KeyGenerator.extractMonthFromMonthlySubCategoryBudgetIdentity(updatedEntity.entityId);
			return CalculationQueries.getQueueMonthlySubCategoryBudgetCalculationQuery(budgetId, updatedEntity.subCategoryId, month.toISOString());
		}
		else if(updatedEntity.budgeted != originalEntity.budgeted) {
			return CalculationQueries.getQueueMonthlySubCategoryBudgetCalculationQuery(budgetId, updatedEntity.subCategoryId, originalEntity.month);
		}

		return null;
	}
}