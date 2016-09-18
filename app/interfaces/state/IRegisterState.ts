import * as budgetEntities from '../budgetEntities';
import { SimpleObjectMap } from '../../utilities';

export interface IRegisterState {
	// This would contain true/false against the transaction ids to indicate whether they
	// are selected or not.
	selectedTransactions:SimpleObjectMap<boolean>;
}