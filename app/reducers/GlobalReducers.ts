import * as _ from 'lodash';

import * as collections from '../collections';
import * as common from '../interfaces/common';
import * as budgetEntities from '../interfaces/budgetEntities';
import * as catalogEntities from '../interfaces/catalogEntities';
import { IEntitiesCollection } from '../interfaces/state';
import { ActionNames } from '../constants';
import { DateWithoutTime } from '../utilities';

import { OpenBudgetCompletedAction, SyncDataWithDatabaseCompletedAction, EnsureBudgetEntitiesForMonthCompletedAction} from '../interfaces/actions';

export class GlobalReducers {

	public static activeBudgetId(previousValue:string, action:Redux.Action):string {

		var newValue:string;
		if(!previousValue)
			newValue = null;
		else
			newValue = previousValue;

		switch(action.type) {

			case ActionNames.GLOBAL_LOAD_BUDGET_COMPLETED:
				newValue = (action as OpenBudgetCompletedAction).budget.entityId;
				break;
		}

		return newValue;
	}

	public static selectedBudgetMonth(previousValue:DateWithoutTime, action:Redux.Action):DateWithoutTime {

		var newValue:DateWithoutTime;
		if(!previousValue)
			newValue = DateWithoutTime.createForCurrentMonth();
		else
			newValue = previousValue.clone();

		switch(action.type) {

			case ActionNames.GLOBAL_ENSURE_BUDGET_ENTITIES_FOR_MONTH_COMPLETED:
				var createBudgetEntitiesForMonthAction = action as EnsureBudgetEntitiesForMonthCompletedAction;
				newValue = createBudgetEntitiesForMonthAction.month.clone();
				break;
		}

		return newValue;
	}

	public static entitiesCollection(previousValue:IEntitiesCollection, action:Redux.Action):IEntitiesCollection {

		var newValue:IEntitiesCollection;
		if(!previousValue)
			newValue = {};
		else
			newValue = Object.assign({}, previousValue);

		switch(action.type) {

			case ActionNames.GLOBAL_LOAD_BUDGET_COMPLETED:
				GlobalReducers.replaceCollections(newValue, action as OpenBudgetCompletedAction);
				break;

			case ActionNames.GLOBAL_SYNC_DATA_WITH_DATABASE_COMPLETED:
				GlobalReducers.updateCollection(newValue, action as SyncDataWithDatabaseCompletedAction);
				break;
		}

		return newValue;
	}

	private static replaceCollections(newValue:IEntitiesCollection, action:OpenBudgetCompletedAction):void {

		// This method is called when we are loading a new budget, and want to replace all the loaded
		// entities of the previous budget with the entities of the new budget.
		// The catalog entitie arrays however are not replaced, but updated.
		if(newValue.budgets)
			GlobalReducers.updateCollectionArray(newValue.budgets, action.entities.budgets);
		else 
			newValue.budgets = new collections.BudgetsArray(action.entities.budgets);
		
		if(newValue.globalSettings)
			GlobalReducers.updateCollectionArray(newValue.globalSettings, action.entities.globalSettings);
		else 
			newValue.globalSettings = new collections.GlobalSettingsArray(action.entities.globalSettings);

		// We have data for a new budget coming in through the action. Replace all data in the state
		// with the this new data.
		newValue.accounts = new collections.AccountsArray(action.entities.accounts);
		newValue.accountMappings = new collections.AccountMappingsArray(action.entities.accountMappings);
		newValue.masterCategories = new collections.MasterCategoriesArray(action.entities.masterCategories);
		newValue.monthlyBudgets = new collections.MonthlyBudgetsArray(action.entities.monthlyBudgets);
		newValue.monthlySubCategoryBudgets = new collections.MonthlySubCategoryBudgetsArray(action.entities.monthlySubCategoryBudgets);
		newValue.payees = new collections.PayeesArray(action.entities.payees);
		newValue.payeeLocations = new collections.PayeeLocationsArray(action.entities.payeeLocations);
		newValue.payeeRenameConditions = new collections.PayeeRenameConditionsArray(action.entities.payeeRenameConditions);
		newValue.scheduledSubTransactions = new collections.ScheduledSubTransactionsArray(action.entities.scheduledSubTransactions);
		newValue.scheduledTransactions = new collections.ScheduledTransactionsArray(action.entities.scheduledTransactions);
		newValue.settings = new collections.SettingsArray(action.entities.settings);
		newValue.subCategories = new collections.SubCategoriesArray(action.entities.subCategories);
		newValue.subTransactions = new collections.SubTransactionsArray(action.entities.subTransactions);
		newValue.transactions = new collections.TransactionsArray(action.entities.transactions);
	}

	private static updateCollection(newValue:IEntitiesCollection, action:SyncDataWithDatabaseCompletedAction):void {

		GlobalReducers.updateCollectionArray(newValue.budgets, action.entities.budgets);
		GlobalReducers.updateCollectionArray(newValue.globalSettings, action.entities.globalSettings);

		GlobalReducers.updateCollectionArray(newValue.accounts, action.entities.accounts);
		GlobalReducers.updateCollectionArray(newValue.accountMappings, action.entities.accountMappings);
		GlobalReducers.updateCollectionArray(newValue.masterCategories, action.entities.masterCategories);
		GlobalReducers.updateCollectionArray(newValue.monthlyBudgets, action.entities.monthlyBudgets);
		GlobalReducers.updateCollectionArray(newValue.monthlySubCategoryBudgets, action.entities.monthlySubCategoryBudgets);
		GlobalReducers.updateCollectionArray(newValue.payees, action.entities.payees);
		GlobalReducers.updateCollectionArray(newValue.payeeLocations, action.entities.payeeLocations);
		GlobalReducers.updateCollectionArray(newValue.payeeRenameConditions, action.entities.payeeRenameConditions);
		GlobalReducers.updateCollectionArray(newValue.scheduledSubTransactions, action.entities.scheduledSubTransactions);
		GlobalReducers.updateCollectionArray(newValue.scheduledTransactions, action.entities.scheduledTransactions);
		GlobalReducers.updateCollectionArray(newValue.settings, action.entities.settings);
		GlobalReducers.updateCollectionArray(newValue.subCategories, action.entities.subCategories);
		GlobalReducers.updateCollectionArray(newValue.subTransactions, action.entities.subTransactions);
		GlobalReducers.updateCollectionArray(newValue.transactions, action.entities.transactions);
	}

	private static updateCollectionArray(entitiesArray:collections.EntitiesArray<common.IEntity>, newValues:Array<common.IEntity>):void {

		if(newValues && newValues.length > 0) {
			_.forEach(newValues, (newValue)=>{
				entitiesArray.addOrReplaceEntity(newValue);
			});
		}		
	}
}