export interface ICalculationQueueSummary {
	queueCount:number;
	transactionCalculationsMinMonth?:string;
	transactionCalculationAccountIds?:string;
	accountCalculationsMinMonth?:string;
	accountCalculationIds?:string;
	subCategoryCalculationsMinMonth?:string;
	subCategoryCalculationIds?:string;
	unCategoriedSubCategoryQueued?:boolean;
	scheduledTransactionCalculationIds?:string;
	runFullCalculations?:boolean;
}
