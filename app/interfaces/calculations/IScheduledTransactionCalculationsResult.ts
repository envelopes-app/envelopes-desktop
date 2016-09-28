import * as budgetEntities from '../../interfaces/budgetEntities';

export interface IScheduledTransactionCalculationsResult {

	database_rows_affected:number;
	
	be_transactions?: Array<budgetEntities.ITransaction>;
	be_subtransactions?: Array<budgetEntities.ISubTransaction>;
	be_scheduled_transactions?: Array<budgetEntities.IScheduledTransaction>;
}