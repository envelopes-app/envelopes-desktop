import * as _ from 'lodash';

import { IEntitiesCollectionWithMaps } from '../interfaces/state';
import { ActionNames } from '../constants';
import { OpenBudgetCompletedAction, SyncDataWithDatabaseCompletedAction } from '../interfaces/actions';

export class GlobalReducers {

	public static entitiesCollection(previousValue:IEntitiesCollectionWithMaps, action:Redux.Action):IEntitiesCollectionWithMaps {

		var newValue:IEntitiesCollectionWithMaps;
		if(!previousValue)
			newValue = {};
		else
			newValue = _.assign({}, previousValue);

		switch(action.type) {

			case ActionNames.GLOBAL_LOAD_BUDGET_COMPLETED:
				GlobalReducers.replaceCollections(newValue, action as OpenBudgetCompletedAction);
				break;

			case ActionNames.GLOBAL_SYNC_DATA_WITH_DATABASE_COMPLETED:
				GlobalReducers.updateCollection(newValue, action as SyncDataWithDatabaseCompletedAction, "accounts", "accountsMap");
				break;
		}

		return newValue;
	}

	private static replaceCollections(newValue:IEntitiesCollectionWithMaps, action:OpenBudgetCompletedAction):void {

		// We have data for a new budget coming in through the action. Replace all data in the state
		// with the this new data.
		newValue.budget = action.budget;
		newValue.accounts = action.entities.accounts;
		newValue.accountMappings = action.entities.accountMappings;
		newValue.masterCategories = action.entities.masterCategories;
		newValue.monthlyBudgets = action.entities.monthlyBudgets;
		newValue.monthlySubCategoryBudgets = action.entities.monthlySubCategoryBudgets;
		newValue.payees = action.entities.payees;
		newValue.payeeLocations = action.entities.payeeLocations;
		newValue.payeeRenameConditions = action.entities.payeeRenameConditions;
		newValue.scheduledSubTransactions = action.entities.scheduledSubTransactions;
		newValue.scheduledTransactions = action.entities.scheduledTransactions;
		newValue.settings = action.entities.settings;
		newValue.subCategories = action.entities.subCategories;
		newValue.subTransactions = action.entities.subTransactions;
		newValue.transactions = action.entities.transactions;
		// Build the map objects for each of the entity collections
		newValue.accountsMap = _.keyBy(newValue.accounts, 'entityId');
		newValue.accountMappingsMap = _.keyBy(newValue.accountMappings, 'entityId');
		newValue.masterCategoriesMap = _.keyBy(newValue.masterCategories, 'entityId');
		newValue.monthlyBudgetsMap = _.keyBy(newValue.monthlyBudgets, 'entityId');
		newValue.monthlySubCategoryBudgetsMap = _.keyBy(newValue.monthlySubCategoryBudgets, 'entityId');
		newValue.payeesMap = _.keyBy(newValue.payees, 'entityId');
		newValue.payeeLocationsMap = _.keyBy(newValue.payeeLocations, 'entityId');
		newValue.payeeRenameConditionsMap = _.keyBy(newValue.payeeRenameConditions, 'entityId');
		newValue.scheduledSubTransactionsMap = _.keyBy(newValue.scheduledSubTransactions, 'entityId');
		newValue.scheduledTransactionsMap = _.keyBy(newValue.scheduledTransactions, 'entityId');
		newValue.settingsMap = _.keyBy(newValue.settings, 'entityId');
		newValue.subCategoriesMap = _.keyBy(newValue.subCategories, 'entityId');
		newValue.subTransactionsMap = _.keyBy(newValue.subTransactions, 'entityId');
		newValue.transactionsMap = _.keyBy(newValue.transactions, 'entityId');
	}

	private static updateCollection(newValue:IEntitiesCollectionWithMaps, action:SyncDataWithDatabaseCompletedAction, collectionName:string, collectionMapName:string):void {

		// Do we have any updated entities coming in. If no new entities are coming in, then we don't need to do anything.  
		if(action.entities[collectionName]) {

			if(!newValue[collectionName])
				newValue[collectionName] = [];

			// Get a new array that does not contain any of the items that we have received in the action
			newValue[collectionName] = _.differenceBy(newValue[collectionName], action.entities[collectionName], 'entityId');
			// Add the entities from the action into the state array
			newValue[collectionName] = _.concat(newValue[collectionName], action.entities[collectionName]);
			// Also update the map
			newValue[collectionMapName] = _.keyBy(newValue[collectionName], 'entityId');
		}
	}
}