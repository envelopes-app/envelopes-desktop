/// <reference path='../../_includes.ts' />

import * as _ from 'lodash';

import { DateWithoutTime } from '../../utilities';
import { BudgetKnowledge } from '../KnowledgeObjects';
import { IDatabaseQuery } from '../../interfaces/persistence'; 
import * as budgetEntities from '../../interfaces/budgetEntities';
import * as budgetQueries from '../queries/budgetQueries';
import { CalculationQueries } from '../queries/miscQueries';
import { IEntitiesCollection, ISimpleEntitiesCollection } from '../../interfaces/state';

export class SubTransactionHelper {

	public getPersistenceQueries(budgetId:string,
				changedEntities:ISimpleEntitiesCollection,
				originalEntities:IEntitiesCollection,
				budgetKnowledge:BudgetKnowledge):Array<IDatabaseQuery> {

		var queriesList:Array<IDatabaseQuery> = [];
		var calcQueries:Array<IDatabaseQuery>;

		if(changedEntities.subTransactions) {

			_.forEach(changedEntities.subTransactions, (changedEntity:budgetEntities.ISubTransaction)=> {

				// Set the budgetId and update the deviceKnowledge value on the entity
				changedEntity.budgetId = budgetId;
				changedEntity.deviceKnowledge = budgetKnowledge.getNextValue();

				// Add the query to the list to update this entity in the database
				queriesList.push(budgetQueries.SubTransactionQueries.insertDatabaseObject(changedEntity));

				// Get the parent transaction entity of this changed subtransaction, if it has been passed in the transaction
				// collection of the changed entities
				var changedParentEntity:budgetEntities.ITransaction;
				changedParentEntity = _.find(changedEntities.transactions, {entityId: changedEntity.transactionId});
				if(!changedParentEntity)
					throw new Error("Parent transaction entity of the subtransaction was not passed in.");

				// Get the original entity against this changed entity and parent entity.
				var originalEntity:budgetEntities.ISubTransaction = originalEntities.subTransactions.getEntityById(changedEntity.entityId);
				var originalParentEntity:budgetEntities.ITransaction = originalEntities.transactions.getEntityById(changedEntity.transactionId);
				if(originalEntity && !originalParentEntity)
					throw new Error("Parent transaction entity of the subtransaction was not loaded.");

				// Check whether the changes to this entity would require a recalculation
				calcQueries = this.getCalculationInvalidationQuery(budgetId, originalEntity, changedEntity, originalParentEntity, changedParentEntity);
				queriesList = queriesList.concat(calcQueries);
			});
		}

		return queriesList;
	}

	private getCalculationInvalidationQuery(budgetId:string,
				originalEntity:budgetEntities.ISubTransaction,
				updatedEntity:budgetEntities.ISubTransaction,
				originalParentEntity:budgetEntities.ITransaction,
				updatedParentEntity:budgetEntities.ITransaction):Array<IDatabaseQuery> {

		var queryList:Array<IDatabaseQuery> = [];

		var updatedEntityDate = DateWithoutTime.createFromUTCTime(updatedParentEntity.date);
		var updatedEntityMonth:string = updatedEntityDate.startOfMonth().toISOString();

		if(!originalEntity) {

			queryList.push(CalculationQueries.getQueueTransactionCalculationQuery(budgetId, updatedParentEntity.accountId, updatedEntityMonth));

			// This is a new entity. Queue a monthly subcategory budget calculation for that subcategory.
			queryList.push( CalculationQueries.getQueueMonthlySubCategoryBudgetCalculationQuery(budgetId, updatedEntity.subCategoryId, updatedEntityMonth) );
		}
		else {

			var originalEntityDate = DateWithoutTime.createFromUTCTime(originalParentEntity.date);
			var originalEntityMonth:string = originalEntityDate.startOfMonth().toISOString();
			var transactionCalculationsInvalidated:boolean = false;

			// Queue transactions calculations for both the accounts of server and device entity, if any values of the transaction
			// that affect transaction calculations have been changed.
			if(originalEntity.amount != updatedEntity.amount ||
				originalEntity.isTombstone != updatedEntity.isTombstone) {

				queryList.push(CalculationQueries.getQueueTransactionCalculationQuery(budgetId, originalParentEntity.accountId, originalEntityMonth));
				queryList.push(CalculationQueries.getQueueTransactionCalculationQuery(budgetId, updatedParentEntity.accountId, updatedEntityMonth));
				transactionCalculationsInvalidated = true;
			}

			// If the subcategory or the tombstone properties of the subtransactions have changed,
			if(originalEntity.subCategoryId != updatedEntity.subCategoryId ||
				originalEntity.isTombstone != updatedEntity.isTombstone ||
				originalEntity.amount != updatedEntity.amount ||
				originalEntity.transferAccountId != updatedEntity.transferAccountId ||
				originalEntity.transferTransactionId != updatedEntity.transferTransactionId ||
				originalParentEntity.accountId != updatedParentEntity.accountId ||
				transactionCalculationsInvalidated) {

				queryList.push( CalculationQueries.getQueueAccountCalculationQuery(budgetId, updatedParentEntity.accountId, updatedEntityMonth) );
				queryList.push( CalculationQueries.getQueueAccountCalculationQuery(budgetId, originalParentEntity.accountId, originalEntityMonth) );
				queryList.push( CalculationQueries.getQueueMonthlySubCategoryBudgetCalculationQuery(budgetId, updatedEntity.subCategoryId, updatedEntityMonth) );
				queryList.push( CalculationQueries.getQueueMonthlySubCategoryBudgetCalculationQuery(budgetId, originalEntity.subCategoryId, originalEntityMonth) );
			}
		}

		return queryList;
	}
}