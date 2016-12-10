import { IAccountMonthlyBalance, ICalculationTransactionAmount } from '../../interfaces/calculations';

export interface ITransactionCalculationsData {

	// Balance of the account at the start of the month for which we are performing calculations
	accountBalancesAtStartOfMonth:Array<IAccountMonthlyBalance>;
	// Transactions. These are ordered by ascending date then ascending amount
	transactions:Array<ICalculationTransactionAmount>;
}
