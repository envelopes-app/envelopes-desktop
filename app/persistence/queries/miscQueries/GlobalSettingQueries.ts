/// <reference path='../../../_includes.ts' />

import { IDatabaseQuery } from '../../../interfaces/persistence';

export class GlobalSettingQueries {

	public static getUpdateLastLoggedInUserQuery(userId:string):IDatabaseQuery {

		return {
			query: `REPLACE INTO GlobalSettings (settingName, settingValue) VALUES ('lastLoggedInUser', ?);`,
			arguments: [userId]
		};
	}

	public static getUpdateLastOpenedBudgetQuery(budgetId:string):IDatabaseQuery {

		return {
			query: `REPLACE INTO GlobalSettings (settingName, settingValue) VALUES ('lastOpenedBudget', ?);`,
			arguments: [budgetId]
		};
	}
}