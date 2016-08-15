import { IDatabaseQuery } from './IDatabaseQuery';

export interface IDatabaseMigration {

	getDatabaseQueries:()=>Array<IDatabaseQuery>;
	requiresFullCalculations:boolean;
}