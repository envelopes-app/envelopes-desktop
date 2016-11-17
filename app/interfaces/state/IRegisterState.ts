import * as budgetEntities from '../budgetEntities';
import { RegisterTransactionObjectsArray } from '../../collections';
import { DateWithoutTime, SimpleObjectMap } from '../../utilities';

export interface IRegisterState {

	accountId:string;
	sortByFields:Array<string>;
	sortOrders:Array<string>;

	// Variables representing filter dialog state
	filterShowReconciledTransactions:boolean;
	filterShowScheduledTransactions:boolean;
	filterSelectedTimeFrame:string;
	filterStartDate:DateWithoutTime;
	filterEndDate:DateWithoutTime;

	// Which columns to show in the register
	showCheckColumn:boolean;
	showClearedColumn:boolean;
	showFlagColumn:boolean;
	showMemoColumn:boolean;
	
	searchPhrase:string;

	// Array of transaction ids that are selected
	selectedTransactions:Array<string>;
	// Contains true/false against transaction ids to indicate whether they are selected or not.
	selectedTransactionsMap:SimpleObjectMap<boolean>;
	// Array of RegisterTransactionObjects that match the filter/search criteria
	registerTransactionObjectsArray:RegisterTransactionObjectsArray;
}