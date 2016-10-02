/// <reference path='../../_includes.ts' />

import * as _ from 'lodash';

import { DateWithoutTime, KeyGenerator, Logger } from '../../utilities';
import { AccountTypes, ClearedFlag, SubCategoryType } from '../../constants';
import { BudgetKnowledge } from '../KnowledgeObjects';
import { IDatabaseQuery } from '../../interfaces/persistence'; 
import * as budgetEntities from '../../interfaces/budgetEntities';
import * as budgetQueries from '../queries/budgetQueries';
import { CalculationQueries } from '../queries/miscQueries';
import { IEntitiesCollection, ISimpleEntitiesCollection } from '../../interfaces/state';

export class AccountHelper {

	public getPersistenceQueries(budgetId:string,
				changedEntities:ISimpleEntitiesCollection,
				originalEntities:IEntitiesCollection,
				budgetKnowledge:BudgetKnowledge):Array<IDatabaseQuery> {

		var query:IDatabaseQuery;
		var queriesList:Array<IDatabaseQuery> = [];

		if(changedEntities.accounts) {

			debugger;
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

					// Create a "transfer" payee entity for the new account
					queriesList.push(
						this.getTransferPayeeCreationQuery(changedEntity, budgetKnowledge.getNextValue())
					);

					// Create a "starting balance" transaction entity for the account
					queriesList.push(
						this.getStartingBalanceTransactionCreationQuery(changedEntity, budgetKnowledge.getNextValue(), originalEntities.payees.getStartingBalancePayee(), originalEntities.subCategories.getImmediateIncomeSubCategory())
					);

					// If this account is onBudget and a liability account, then create a debt subcategory for it
					var isAssetAccount:boolean = AccountTypes.isAssetAccount(changedEntity.accountType);
					if (changedEntity.onBudget && !isAssetAccount) {
						queriesList.push(
							this.getDebtSubCategoryCreationQuery(changedEntity, budgetKnowledge.getNextValue(), originalEntities.masterCategories.getDebtPaymentMasterCategory())
						);
					}
				}
			});
		}

		return queriesList;
	}

	private getTransferPayeeCreationQuery(account:budgetEntities.IAccount, deviceKnowledge:number):IDatabaseQuery {

		var accountPayee:budgetEntities.IPayee = {

			budgetId: account.budgetId,
			entityId: KeyGenerator.generateUUID(),
			isTombstone: 0,
			accountId: account.entityId,
			enabled: 1,
			autoFillSubCategoryId: null,
			name: "Transfer : " + account.accountName,
			internalName: null,
			deviceKnowledge: deviceKnowledge
		};

		return budgetQueries.PayeeQueries.insertDatabaseObject(accountPayee);
	}

	private getStartingBalanceTransactionCreationQuery(
			account:budgetEntities.IAccount, 
			deviceKnowledge:number, 
			startingBalancePayee:budgetEntities.IPayee, 
			immediateIncomeSubCategory:budgetEntities.ISubCategory
		):IDatabaseQuery {

		var accountTransaction:budgetEntities.ITransaction = {

			budgetId: account.budgetId,
			entityId: KeyGenerator.generateUUID(),
			isTombstone: 0,
			accountId: account.entityId,
			payeeId: startingBalancePayee.entityId,
			subCategoryId: immediateIncomeSubCategory.entityId,
			date: DateWithoutTime.createForToday().getUTCTime(),
			dateEnteredFromSchedule: null,
			amount: 0,
			cashAmount: 0,
			creditAmount: 0,
			subCategoryCreditAmountPreceding: 0,
			memo: null,
			cleared: ClearedFlag.Cleared,
			accepted: 1,
			flag: null,
			source: null,
			transferAccountId: null,
			transferTransactionId: null,
			transferSubTransactionId: null,
			matchedTransactionId: null,
			scheduledTransactionId: null,
			importId: null,
			importedPayee: null,
			importedDate: null,
			deviceKnowledge: deviceKnowledge,
			deviceKnowledgeForCalculatedFields: deviceKnowledge
		};

		return budgetQueries.TransactionQueries.insertDatabaseObject(accountTransaction);
	}

	private getDebtSubCategoryCreationQuery(account:budgetEntities.IAccount, deviceKnowledge:number, debtMasterCategory:budgetEntities.IMasterCategory):IDatabaseQuery {

		var accountSubCategory:budgetEntities.ISubCategory = {

			budgetId: account.budgetId,
			entityId: KeyGenerator.generateUUID(),
			isTombstone: 0,
			masterCategoryId: debtMasterCategory.entityId,
			accountId: account.entityId,
			internalName: null,
			sortableIndex: 0,
			pinnedIndex: null,
			name: account.accountName,
			type: SubCategoryType.Debt,
			note: null,
			isHidden: 0,
			goalType: null,
			goalCreationMonth: null,
			targetBalance: null,
			targetBalanceMonth: null,
			monthlyFunding: null,
			deviceKnowledge: deviceKnowledge
		};

		return budgetQueries.SubCategoryQueries.insertDatabaseObject(accountSubCategory);
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