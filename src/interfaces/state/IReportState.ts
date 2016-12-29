import { DateWithoutTime, SimpleObjectMap } from '../../utilities';

export interface IReportState {

	allAccountsSelected:boolean;
	noAccountsSelected:boolean;
	selectedAccountIds:Array<string>;

	allCategoriesSelected:boolean;
	noCategoriesSelected:boolean;
	uncategorizedTransactionsSelected:boolean;
	hiddenCategoriesSelected:boolean;
	selectedCategoryIds:Array<string>;

	selectedTimeframe:string;
	startDate:DateWithoutTime;
	endDate:DateWithoutTime;
}