import { DateWithoutTime } from '../../utilities';

export interface ITransactionValues {

	entityId: string;
	flag: string;
	accountId: string;
	payeeId: string;
	date: DateWithoutTime;
	frequency: string;
	subCategoryId: string;
	memo: string;
	amount: number;
	cleared: string;
}