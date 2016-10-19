import * as budgetEntities from '../../interfaces/budgetEntities';

export interface IScheduledTransactionCalculationsResult {

	database_rows_affected:number;
	
	transactions?: Array<budgetEntities.ITransaction>;
	subTransactions?: Array<budgetEntities.ISubTransaction>;
	scheduledTransactions?: Array<budgetEntities.IScheduledTransaction>;
}