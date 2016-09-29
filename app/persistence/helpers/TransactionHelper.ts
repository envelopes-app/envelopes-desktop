/// <reference path='../../_includes.ts' />

import * as _ from 'lodash';

import { DateWithoutTime } from '../../utilities';
import { BudgetKnowledge } from '../KnowledgeObjects';
import { IDatabaseQuery } from '../../interfaces/persistence'; 
import * as budgetEntities from '../../interfaces/budgetEntities';
import * as budgetQueries from '../queries/budgetQueries';
import { CalculationQueries } from '../queries/miscQueries';
import { IEntitiesCollection, ISimpleEntitiesCollection } from '../../interfaces/state';

export class TransactionHelper {

	public getPersistenceQueries(budgetId:string,
				changedEntities:ISimpleEntitiesCollection,
				originalEntities:IEntitiesCollection,
				budgetKnowledge:BudgetKnowledge):Array<IDatabaseQuery> {

		var queriesList:Array<IDatabaseQuery> = [];

		if(changedEntities.transactions) {

			_.forEach(changedEntities.transactions, function(changedEntity:budgetEntities.ITransaction) {

				// Set the budgetId and update the deviceKnowledge value on the entity
				changedEntity.budgetId = budgetId;
				changedEntity.deviceKnowledge = budgetKnowledge.getNextValue();

				// Add the query to the list to update this entity in the database
				queriesList.push(budgetQueries.TransactionQueries.insertDatabaseObject(changedEntity));

				// Get the original entity against this changed entity.
				var originalEntity:budgetEntities.ITransaction = originalEntities.transactions.getEntityById(changedEntity.entityId);

				// Check whether the changes to this entity would require a recalculation
				queriesList = queriesList.concat(this.getCalculationInvalidationQuery(budgetId, originalEntity, changedEntity));
			});
		}

		return queriesList;
	}

	private getCalculationInvalidationQuery(budgetId:string, originalEntity:budgetEntities.ITransaction, updatedEntity:budgetEntities.ITransaction):Array<IDatabaseQuery> {

		var queries:Array<IDatabaseQuery> = [];

		if(!originalEntity) {

			var date = DateWithoutTime.createFromUTCTime(updatedEntity.date);
			date.startOfMonth();

			// This is a new transaction. Queue an account and transaction calculation for the account that this belongs to
			queries.push(CalculationQueries.getQueueAccountCalculationQuery(budgetId, updatedEntity.accountId, date.toISOString()));
			queries.push(CalculationQueries.getQueueTransactionCalculationQuery(budgetId, updatedEntity.accountId, date.toISOString()));

			// Queue a monthly budget calculation.
			queries.push(CalculationQueries.getQueueMonthlySubCategoryBudgetCalculationQuery(budgetId, updatedEntity.subCategoryId, date.toISOString()));
		}
		else {

			var date1 = DateWithoutTime.createFromUTCTime(originalEntity.date);
			var date2 = DateWithoutTime.createFromUTCTime(updatedEntity.date);
			var month1 = date1.clone().startOfMonth();
			var month2 = date2.clone().startOfMonth();

			var transactionCalculationsInvalidated:boolean = false;

			if(originalEntity.accountId != updatedEntity.accountId ||
				originalEntity.subCategoryId != updatedEntity.subCategoryId ||
				!month1.equalsDateWithoutTime(month2) ||
				originalEntity.amount != updatedEntity.amount ||
				originalEntity.cleared != updatedEntity.cleared ||
				originalEntity.isTombstone != updatedEntity.isTombstone) {

				queries.push(CalculationQueries.getQueueAccountCalculationQuery(budgetId, originalEntity.accountId, month1.toISOString()));
				queries.push(CalculationQueries.getQueueAccountCalculationQuery(budgetId, updatedEntity.accountId, month2.toISOString()));
			}

			// Queue transactions calculations for both the accounts of server and device entity, if any values of the transaction
			// that affect transaction calculations have been changed.
			if(originalEntity.accountId != updatedEntity.accountId ||
				!date1.equalsDateWithoutTime(date2) ||
				originalEntity.amount != updatedEntity.amount ||
				// originalEntity.source != updatedEntity.source || // Because we might have changed the source when we imported transactions
				originalEntity.isTombstone != updatedEntity.isTombstone) {  

				queries.push(CalculationQueries.getQueueTransactionCalculationQuery(budgetId, originalEntity.accountId, month1.toISOString()));
				queries.push(CalculationQueries.getQueueTransactionCalculationQuery(budgetId, updatedEntity.accountId, month2.toISOString()));
				transactionCalculationsInvalidated = true;
			}

			if(originalEntity.accountId != updatedEntity.accountId ||
				originalEntity.subCategoryId != updatedEntity.subCategoryId ||
				!month1.equalsDateWithoutTime(month2) ||
				originalEntity.amount != updatedEntity.amount ||
				originalEntity.isTombstone != updatedEntity.isTombstone ||
				// originalEntity.source != updatedEntity.source || // Because we might have changed the source when we imported transactions
				transactionCalculationsInvalidated) {

				queries.push(CalculationQueries.getQueueMonthlySubCategoryBudgetCalculationQuery(budgetId, originalEntity.subCategoryId, month1.toISOString()));
				queries.push(CalculationQueries.getQueueMonthlySubCategoryBudgetCalculationQuery(budgetId, updatedEntity.subCategoryId, month2.toISOString()));
			}
		}

		return queries;
	}
}