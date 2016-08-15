import * as _ from 'lodash';
import { IDatabaseQuery } from '../../../interfaces/persistence';
import { ICalculationQueueItem } from '../../../interfaces/calculations';
import { CalculationQueueItemType } from '../../../constants';
import { KeyGenerator } from '../../../utilities';

export class CalculationQueries {

	public static getClearCalculationQueueQuery(budgetId:string):IDatabaseQuery {

		return {
			query: "DELETE FROM CalculationQueue WHERE budgetId = ?",
			arguments: [budgetId]
		};
	}

	public static getAllQueuedCalculationIdsQuery(budgetId:string):IDatabaseQuery {

		return {
			name:"calculationQueue",
			query: "SELECT queueId FROM CalculationQueue WHERE budgetId = ?",
			arguments: [budgetId]
		};
	}
	
	public static getQueuedCalculationSummaryQuery(budgetId:string):IDatabaseQuery {

		return {
			name:"calculationQueueSummary",
			query: `
SELECT
COUNT(queueId) as queueCount,
MIN(CASE WHEN calculationType = '${CalculationQueueItemType.TransactionCalculation}' THEN month ELSE NULL END) 
	as transactionCalculationsMinMonth,
GROUP_CONCAT(CASE WHEN calculationType = '${CalculationQueueItemType.TransactionCalculation}' THEN entityId ELSE NULL END)
	as transactionCalculationAccountIds,
MIN(CASE WHEN calculationType = '${CalculationQueueItemType.AccountCalculation}' THEN month ELSE NULL END)
	as accountCalculationsMinMonth,
GROUP_CONCAT(CASE WHEN calculationType = '${CalculationQueueItemType.AccountCalculation}' THEN entityId ELSE NULL END)
	as accountCalculationIds,
MIN(CASE WHEN calculationType = '${CalculationQueueItemType.MonthlySubCategoryBudgetCalculation}' THEN month ELSE NULL END)
	as subCategoryCalculationsMinMonth,
GROUP_CONCAT(CASE WHEN calculationType = '${CalculationQueueItemType.MonthlySubCategoryBudgetCalculation}' THEN entityId ELSE NULL END)
	as subCategoryCalculationIds,
MAX(CASE WHEN calculationType = '${CalculationQueueItemType.MonthlySubCategoryBudgetCalculation}' AND entityId IS NULL THEN 1 ELSE 0 END)
	as unCategoriedSubCategoryQueued,
GROUP_CONCAT(CASE WHEN calculationType = '${CalculationQueueItemType.ScheduledTransactionCalculation}' THEN entityId ELSE NULL END)
	as scheduledTransactionCalculationIds,
MAX(CASE WHEN calculationType = '${CalculationQueueItemType.CompleteCalculation}' THEN 1 ELSE 0 END)
	as runFullCalculations
FROM CalculationQueue                
WHERE budgetId = ?
			`,
			arguments: [budgetId]
		};
	}

	public static getHasQueuedCalculationsQuery(budgetId:string):IDatabaseQuery {

		return {
			name:"calculationQueue",
			query: "SELECT COUNT(*) AS count FROM CalculationQueue WHERE budgetId = ?",
			arguments: [budgetId]
		};
	}

	public static getSaveCalculationQueueItemQuery(calculationQueueItem:ICalculationQueueItem):IDatabaseQuery {

		var queueId:string = KeyGenerator.generateUUID();
		return {
			query: "INSERT INTO CalculationQueue (queueId, budgetId, calculationType, entityId, month) VALUES (?,?,?,?,?)",
			arguments: [
				calculationQueueItem.queueId,
				calculationQueueItem.budgetId,
				calculationQueueItem.calculationType,
				calculationQueueItem.entityId,
				calculationQueueItem.month
			]
		};
	}

	public static getQueueCompleteCalculationQuery(budgetId:string):IDatabaseQuery {

		var queueId:string = KeyGenerator.generateUUID();
		return {
			query: "INSERT INTO CalculationQueue (queueId, budgetId, calculationType, entityId, month) VALUES (?,?,?,?,?)",
			arguments: [
				queueId,
				budgetId,
				CalculationQueueItemType.CompleteCalculation,
				null,
				null
			]
		};
	}

	public static getQueueScheduledTransactionCalculationQuery(budgetId:string, scheduledTransactionId:string):IDatabaseQuery {

		var queueId:string = KeyGenerator.generateUUID();
		return {
			query: "INSERT INTO CalculationQueue (queueId, budgetId, calculationType, entityId, month) VALUES (?,?,?,?,?)",
			arguments: [
				queueId,
				budgetId,
				CalculationQueueItemType.ScheduledTransactionCalculation,
				scheduledTransactionId,
				null
			]
		};
	}

	public static getQueueAccountCalculationQuery(budgetId:string, accountId:string, month:string = null):IDatabaseQuery {

		var queueId:string = KeyGenerator.generateUUID();
		return {
			query: "INSERT INTO CalculationQueue (queueId, budgetId, calculationType, entityId, month) VALUES (?,?,?,?,?)",
			arguments: [
				queueId,
				budgetId,
				CalculationQueueItemType.AccountCalculation,
				accountId,
				month
			]
		};
	}

	public static getQueueMonthlySubCategoryBudgetCalculationQuery(budgetId:string, subCategoryId:string, month:string):IDatabaseQuery {

		var queueId:string = KeyGenerator.generateUUID();
		return {
			query: "INSERT INTO CalculationQueue (queueId, budgetId, calculationType, entityId, month) VALUES (?,?,?,?,?)",
			arguments: [
				queueId,
				budgetId,
				CalculationQueueItemType.MonthlySubCategoryBudgetCalculation,
				subCategoryId,
				month
			]
		};
	}

	public static getQueueTransactionCalculationQuery(budgetId:string, accountId:string, month:string=null):IDatabaseQuery {

		var queueId:string = KeyGenerator.generateUUID();
		return {
			query: "INSERT INTO CalculationQueue (queueId, budgetId, calculationType, entityId, month) VALUES (?,?,?,?,?)",
			arguments: [
				queueId,
				budgetId,
				CalculationQueueItemType.TransactionCalculation,
				accountId,
				month
			]
		};
	}

	public static getRemoveCalculationQueueItemsQuery(budgetId:string, calculationQueueItemIds:Array<string>):Array<IDatabaseQuery> {

		var queriesList:Array<IDatabaseQuery> = [];

		for(var i = 0, j = calculationQueueItemIds.length; i < j; i += 50) {

			var tempArray = calculationQueueItemIds.slice(i, i + 50);

			var questionMarksStr = "";
			_.forEach(tempArray, function (entityId) {
				questionMarksStr += (questionMarksStr == "" ? "" : ", ") + "?";
			});
			var argumentsArray = [budgetId].concat(tempArray);

			var query = {
				query: "DELETE FROM CalculationQueue WHERE budgetId = ? AND queueId IN (" + questionMarksStr + ")",
				arguments: argumentsArray
			};

			queriesList.push(query);
		}

		return queriesList;
	}
}
