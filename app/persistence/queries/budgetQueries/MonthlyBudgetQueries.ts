/// <reference path='../../../_includes.ts' />

import { DateWithoutTime, KeyGenerator } from '../../../utilities';
import { IDatabaseQuery } from '../../../interfaces/persistence';
import * as budgetEntities from '../../../interfaces/budgetEntities';

export class MonthlyBudgetQueries {

	// *********************************************************************************************************
	// Queries for inserting data into the database
	// *********************************************************************************************************
	public static insertDatabaseObject(dbObject:budgetEntities.IMonthlyBudget):IDatabaseQuery {

		var query:IDatabaseQuery = {

			name: "monthlyBudgets",
			query: `REPLACE INTO MonthlyBudgets
					(
						budgetId,
						entityId,
						isTombstone,
						month,
						note,
						previousIncome,
						immediateIncome,
						budgeted,
						cashOutflows,
						creditOutflows,
						balance,
						overSpent,
						availableToBudget,
						uncategorizedCashOutflows,
						uncategorizedCreditOutflows,
						uncategorizedBalance,
						hiddenBudgeted,
						hiddenCashOutflows,
						hiddenCreditOutflows,
						hiddenBalance,
						additionalToBeBudgeted,
						ageOfMoney,
						deviceKnowledge,
						deviceKnowledgeForCalculatedFields
					) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
			arguments: [
				dbObject.budgetId,
				dbObject.entityId,
				dbObject.isTombstone,
				dbObject.month,
				dbObject.note,
				dbObject.previousIncome,
				dbObject.immediateIncome,
				dbObject.budgeted,
				dbObject.cashOutflows,
				dbObject.creditOutflows,
				dbObject.balance,
				dbObject.overSpent,
				dbObject.availableToBudget,
				dbObject.uncategorizedCashOutflows,
				dbObject.uncategorizedCreditOutflows,
				dbObject.uncategorizedBalance,
				dbObject.hiddenBudgeted,
				dbObject.hiddenCashOutflows,
				dbObject.hiddenCreditOutflows,
				dbObject.hiddenBalance,
				dbObject.additionalToBeBudgeted,
				dbObject.ageOfMoney,
				dbObject.deviceKnowledge,
				dbObject.deviceKnowledgeForCalculatedFields
			]
		};

		return query;
	}

	public static loadDatabaseObject(budgetId:string, deviceKnowledge:number, deviceKnowledgeForCalculations:number):IDatabaseQuery {

		var query:IDatabaseQuery = {

			name: "monthlyBudgets",
			query: `SELECT * FROM MonthlyBudgets WHERE budgetId = ?1 AND 
						(deviceKnowledge = 0 OR deviceKnowledge > ?2 OR deviceKnowledgeForCalculatedFields = 0 OR
						deviceKnowledgeForCalculatedFields > ?3) AND isTombstone = 0`,
			arguments: [
				budgetId,
				deviceKnowledge,
				deviceKnowledgeForCalculations
			]
		};

		return query;
	}

	// *********************************************************************************************************
	// Queries for reading data from the database
	// *********************************************************************************************************
	public static getAllMonthlyBudgets(budgetId:string, includeTombstonedEntities:boolean = false):IDatabaseQuery {

		if(includeTombstonedEntities) {
			return {
				name: "monthlyBudgets",
				query: "Select * FROM MonthlyBudgets WHERE budgetId = ?",
				arguments: [budgetId]
			};
		}
		else {
			return {
				name: "monthlyBudgets",
				query: "Select * FROM MonthlyBudgets WHERE budgetId = ? AND isTombstone = 0",
				arguments: [budgetId]
			};
		}
	}

	public static findMonthlyBudgetByMonth(budgetId:string, month:DateWithoutTime):IDatabaseQuery {

		var entityId = KeyGenerator.getMonthlyBudgetIdentity(budgetId, month);
		return {
			name: "monthlyBudgets",
			query: "SELECT * FROM MonthlyBudgets WHERE budgetId = ? AND entityId = ?",
			arguments: [budgetId, entityId]
		};
	}

	// This query allows mobile clients to determine if it's necessary to call ensureDataForMonthExists.
	// The query can be executed synchronously in mobile native code to quickly determine if they need
	// to hold up the UI while the async ensureDataForMonthExists processes.
	//
	// Effectively, the mobile client wants to know if the monthly budget is ready for a given month,
	// but really this translates to having all of the monthly sub category budgets created. If the
	// MSCBs are there, the monthly budget should already be there as well.
	//
	public static dataForMonthExists(budgetId:string, month:string):IDatabaseQuery {

		return {
			name: "dataForMonthExists",
			query: `
				SELECT ?2 as month, CASE WHEN EXISTS (
					SELECT entityId
					FROM SubCategories
					WHERE budgetId = ?1
					AND isTombstone = 0
					AND internalName NOT IN ('Category/__Split__')
					AND entityId NOT IN (
						SELECT subCategoryId
						FROM MonthlySubCategoryBudgets
						WHERE budgetId = ?1
						AND month = ?2
						AND isTombstone = 0
					)
			) THEN 0 ELSE 1 END as dataForMonthExists
			`,
			arguments: [budgetId, month]
		};
	}
}
