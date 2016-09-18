import * as budgetEntities from '../budgetEntities';
import { SimpleObjectMap } from '../../utilities';

export interface IRegisterState {

	// Array of transaction ids that are selected
	selectedTransactions:Array<string>;
	// Contains true/false against transaction ids to indicate whether they are selected or not.
	selectedTransactionsMap:SimpleObjectMap<boolean>;
}