/// <reference path='../../_includes.ts' />

module ynab.queries {
    'use strict';

    export class GlobalSettingQueries {

        public static getUpdateLastLoggedInUserQuery(userId:string):ynab.interfaces.adapters.IDatabaseQuery {

            return {
                query: `REPLACE INTO GlobalSettings (settingName, settingValue) VALUES ('lastLoggedInUser', ?);`,
                arguments: [userId]
            };
        }

        public static getUpdateLastOpenedBudgetVersionQuery(budgetVersionId:string):ynab.interfaces.adapters.IDatabaseQuery {

            return {
                query: `REPLACE INTO GlobalSettings (settingName, settingValue) VALUES ('lastOpenedBudgetVersion', ?);`,
                arguments: [budgetVersionId]
            };
        }
    }
}