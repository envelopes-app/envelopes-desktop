/// <reference path='../../_includes.ts' />

import * as _ from 'lodash';

import { DateWithoutTime, KeyGenerator, Logger } from '../../utilities';
import { AccountTypes, ClearedFlag, SubCategoryType } from '../../constants';
import { BudgetKnowledge } from '../KnowledgeObjects';
import { IDatabaseQuery } from '../../interfaces/persistence'; 
import * as budgetEntities from '../../interfaces/budgetEntities';
import * as budgetQueries from '../queries/budgetQueries';
import { CalculationQueries } from '../queries/miscQueries';
import { EntityFactory } from '../EntityFactory';
import { IEntitiesCollection, ISimpleEntitiesCollection } from '../../interfaces/state';

export class AccountHelper {

	public getPersistenceQueries(budgetId:string,
				changedEntities:ISimpleEntitiesCollection,
				originalEntities:IEntitiesCollection,
				budgetKnowledge:BudgetKnowledge):Array<IDatabaseQuery> {

		var query:IDatabaseQuery;
		var queriesList:Array<IDatabaseQuery> = [];

		if(changedEntities.accounts) {

			_.forEach(changedEntities.accounts, (changedEntity:budgetEntities.IAccount)=> {

				// Set the budgetId and update the deviceKnowledge value on the entity
				changedEntity.budgetId = budgetId;
				changedEntity.deviceKnowledge = budgetKnowledge.getNextValue();

				// Add the query to the list to update this entity in the database
				queriesList.push( budgetQueries.AccountQueries.insertDatabaseObject(changedEntity) );

				// Get the original entity against this changed entity
				var originalEntity:budgetEntities.IAccount = originalEntities.accounts.getEntityById(changedEntity.entityId);
				if(originalEntity) {

					// Check whether the changes to this entity would require a recalculation
					query = this.getCalculationInvalidationQuery(budgetId, originalEntity, changedEntity);
					if(query)
						queriesList.push(query);

					// If the tombstone property of the account changes, update the tombstone properties on the
					// associated entities of the account as well.
					if(originalEntity.isTombstone != changedEntity.isTombstone) {

						queriesList.push({
							query:"UPDATE Payees SET isTombstone = ?, deviceKnowledge = ? WHERE budgetId = ? AND accountId = ?",
							arguments: [changedEntity.isTombstone, budgetKnowledge.getNextValue(), budgetId, changedEntity.entityId]
						});

						queriesList.push({
							query:"UPDATE SubCategories SET isTombstone = ?, deviceKnowledge = ? WHERE budgetId = ? AND accountId = ?",
							arguments: [changedEntity.isTombstone, budgetKnowledge.getNextValue(), changedEntity.budgetId, changedEntity.entityId]
						});

						// If the name of the account changes, update the name of the associated payee and subcategory as well
						if(originalEntity.accountName != changedEntity.accountName) {

							queriesList.push({
								query:"UPDATE Payees SET name = ?, deviceKnowledge = ? WHERE budgetId = ? AND accountId = ?",
								arguments: ["Transfer : " + changedEntity.accountName, budgetKnowledge.getNextValue(), changedEntity.budgetId, changedEntity.entityId]
							});

							queriesList.push({
								query:"UPDATE SubCategories SET name = ?, deviceKnowledge = ? WHERE budgetId = ? AND accountId = ?",
								arguments: [changedEntity.accountName, budgetKnowledge.getNextValue(), changedEntity.budgetId, changedEntity.entityId]
							});
						}
					}
				}
				else {

					// Queue account calculations for this new entity
					queriesList.push(
						this.getCalculationInvalidationQuery(budgetId, null, changedEntity)
					);

					// Create a "transfer" payee entity for the new account
					queriesList.push(
						this.getTransferPayeeCreationQuery(budgetId, changedEntity, budgetKnowledge.getNextValue())
					);

					// Check if we are being passed a starting balance transaction entity in the changed entities.
					// If we are not being passed one, then create a "starting balance" transaction entity for this account.
					var startingBalanceTransaction = null;
					if(changedEntities.transactions && changedEntities.transactions.length > 0) {

						var startingBalancePayeeId = originalEntities.payees.getStartingBalancePayee().entityId;
						startingBalanceTransaction = _.find(changedEntities.transactions, { accountId: changedEntity.entityId, payeeId: startingBalancePayeeId });
					} 

					if(!startingBalanceTransaction) {
						queriesList.push(
							this.getStartingBalanceTransactionCreationQuery(budgetId, changedEntity, budgetKnowledge.getNextValue(), originalEntities.payees.getStartingBalancePayee(), originalEntities.subCategories.getImmediateIncomeSubCategory())
						);
					}					

					// If this account is onBudget and a liability account, then create a debt subcategory for it.
					// Also queue monthly subcategory budget calculations for the created debt category
					var isAssetAccount:boolean = AccountTypes.isAssetAccount(changedEntity.accountType);
					if (changedEntity.onBudget && !isAssetAccount) {
						queriesList = queriesList.concat(
							this.getDebtSubCategoryCreationQueries(budgetId, changedEntity, budgetKnowledge.getNextValue(), originalEntities.masterCategories.getDebtPaymentMasterCategory())
						);
					}
				}
			});
		}

		return queriesList;
	}

	private getTransferPayeeCreationQuery(budgetId:string, account:budgetEntities.IAccount, deviceKnowledge:number):IDatabaseQuery {

		var accountPayee = EntityFactory.createNewPayee(budgetId);
		accountPayee.accountId = account.entityId;
		accountPayee.name = "Transfer : " + account.accountName;
		accountPayee.deviceKnowledge = deviceKnowledge;
		return budgetQueries.PayeeQueries.insertDatabaseObject(accountPayee);
	}

	private getStartingBalanceTransactionCreationQuery(
			budgetId:string,
			account:budgetEntities.IAccount, 
			deviceKnowledge:number, 
			startingBalancePayee:budgetEntities.IPayee, 
			immediateIncomeSubCategory:budgetEntities.ISubCategory
		):IDatabaseQuery {

		var accountTransaction = EntityFactory.createNewTransaction(budgetId);
		accountTransaction.accountId = account.entityId;
		accountTransaction.payeeId = startingBalancePayee.entityId;
		accountTransaction.subCategoryId = immediateIncomeSubCategory.entityId;
		accountTransaction.date = DateWithoutTime.createForToday().getUTCTime();
		accountTransaction.deviceKnowledge = deviceKnowledge;
		accountTransaction.deviceKnowledgeForCalculatedFields = deviceKnowledge;

		return budgetQueries.TransactionQueries.insertDatabaseObject(accountTransaction);
	}

	private getDebtSubCategoryCreationQueries(budgetId:string, account:budgetEntities.IAccount, deviceKnowledge:number, debtMasterCategory:budgetEntities.IMasterCategory):Array<IDatabaseQuery> {

		var accountSubCategory = EntityFactory.createNewSubCategory(budgetId);
		accountSubCategory.masterCategoryId = debtMasterCategory.entityId;
		accountSubCategory.accountId = account.entityId;
		accountSubCategory.name = account.accountName;
		accountSubCategory.type = SubCategoryType.Debt;
		accountSubCategory.deviceKnowledge = deviceKnowledge;

		var queries = [
			budgetQueries.SubCategoryQueries.insertDatabaseObject(accountSubCategory),
			CalculationQueries.getQueueMonthlySubCategoryBudgetCalculationQuery(budgetId, accountSubCategory.entityId, null)
		]

		return queries;
	}

	private getCalculationInvalidationQuery(budgetId:string, originalEntity:budgetEntities.IAccount, updatedEntity:budgetEntities.IAccount):IDatabaseQuery {

		// If this is a new account, or the onBudget property of an existing account changes, then
		// invalidate the calculations for this account entity
		if(!originalEntity || originalEntity.onBudget != updatedEntity.onBudget) {
			Logger.info(`Queued account calculation for ${updatedEntity.accountName}`);
			return CalculationQueries.getQueueAccountCalculationQuery(budgetId, updatedEntity.entityId);
		}

		return null;
	}
}