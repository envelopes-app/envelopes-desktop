import { SimpleObjectMap, DateWithoutTime } from '../../utilities';
import * as budgetEntities from '../budgetEntities';

export interface IScheduledTransactionCalculationsData {

	// First month for which we have a monthly subcategory budget entity
	firstMonth:DateWithoutTime;

	// Last month for which we have a monthly subcategory budget entity
	lastMonth:DateWithoutTime;
	
	// Collections for Entities. Do not load any scheduled transactions that are themselves tombstoned, or
	// belong to an account that is tombstoned, or has been closed.
	scheduledTransactions: Array<budgetEntities.IScheduledTransaction>;

	// Account Payee Id's stored in a map by their account id. We need these so that
	// we can create transfer transactions.
	payeesMapByAccountId:SimpleObjectMap<string>;

	// Account onBudget Map
	accountsOnBudgetMap:SimpleObjectMap<boolean>;
	
	// Data related to upcoming transactions loaded from the monthly subcategory budgets table
	monthlySubCategoryBudgets:Array<{entityId:string, month:string, upcomingTransactions:number, upcomingTransactionsCount:number}>;
	
	uncategorizedSubCategoryId:string;
	// This array contains the ids for all default/debt subcategories
	userSubCategoryIds:Array<string>;
}