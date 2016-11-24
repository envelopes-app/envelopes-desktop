import * as budgetEntities from '../../interfaces/budgetEntities';

export interface IScheduledTransactionCalculationsResult {

	database_rows_affected:number;
	transactions?: Array<budgetEntities.ITransaction>;
	scheduledTransactions?: Array<budgetEntities.IScheduledTransaction>;
}