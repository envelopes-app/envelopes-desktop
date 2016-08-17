/// <reference path='../../../_includes.ts' />

import { IDatabaseQuery } from '../../../interfaces/persistence';
import { CatalogKnowledge, BudgetKnowledge } from '../../KnowledgeObjects';

export class KnowledgeValueQueries {

	public static getLoadCatalogKnowledgeValueQuery():IDatabaseQuery {

		return {
			name: "catalogKnowledge",
			query: "SELECT currentDeviceKnowledge, serverKnowledgeOfDevice, deviceKnowledgeOfServer FROM CatalogKnowledge",
			arguments: []
		};
	}

	public static getSaveCatalogKnowledgeValueQuery(catalogKnowledge:CatalogKnowledge):IDatabaseQuery {

		return {
			query: "UPDATE CatalogKnowledge SET currentDeviceKnowledge = ?, serverKnowledgeOfDevice = ?, deviceKnowledgeOfServer = ?",
			arguments: [catalogKnowledge.currentDeviceKnowledge, catalogKnowledge.serverKnowledgeOfDevice, catalogKnowledge.deviceKnowledgeOfServer]
		};
	}

	public static getLoadBudgetKnowledgeValueQuery(budgetId:string):IDatabaseQuery {

		return {
			name: "budgetKnowledge",
			query: `SELECT currentDeviceKnowledge, 
						currentDeviceKnowledgeForCalculations, 
						serverKnowledgeOfDevice, 
						deviceKnowledgeOfServer
					FROM BudgetKnowledge WHERE budgetId = ?`,
			arguments: [budgetId]
		};
	}

	public static getSaveBudgetKnowledgeValueQuery(budgetId:string, budgetKnowledge:BudgetKnowledge):IDatabaseQuery {

		return {
			query: `REPLACE INTO BudgetKnowledge (
						budgetId,
						currentDeviceKnowledge, 
						currentDeviceKnowledgeForCalculations, 
						serverKnowledgeOfDevice, 
						deviceKnowledgeOfServer
					) 
					VALUES (?,?,?,?,?)`,
			arguments: [
				budgetId,
				budgetKnowledge.currentDeviceKnowledge,
				budgetKnowledge.currentDeviceKnowledgeForCalculations,
				budgetKnowledge.serverKnowledgeOfDevice,
				budgetKnowledge.deviceKnowledgeOfServer
			]
		};
	}

	public static getMaxDeviceKnowledgeFromBudgetEntities(budgetId:string):IDatabaseQuery {

		return {
			name: "budgetKnowledgeFromEntities",
			query: `SELECT MAX(deviceKnowledge) as deviceKnowledge FROM (
				SELECT COALESCE(MAX(deviceKnowledge), 0) as deviceKnowledge FROM Accounts WHERE budgetId = ?1 UNION ALL
				SELECT COALESCE(MAX(deviceKnowledge), 0) as deviceKnowledge FROM AccountMonthlyCalculations WHERE budgetId = ?1 UNION ALL
				SELECT COALESCE(MAX(deviceKnowledge), 0) as deviceKnowledge FROM AccountMappings WHERE budgetId = ?1 UNION ALL
				SELECT COALESCE(MAX(deviceKnowledge), 0) as deviceKnowledge FROM MasterCategories WHERE budgetId = ?1 UNION ALL
				SELECT COALESCE(MAX(deviceKnowledge), 0) as deviceKnowledge FROM MonthlyBudgets WHERE budgetId = ?1 UNION ALL
				SELECT COALESCE(MAX(deviceKnowledge), 0) as deviceKnowledge FROM MonthlySubCategoryBudgets WHERE budgetId = ?1 UNION ALL
				SELECT COALESCE(MAX(deviceKnowledge), 0) as deviceKnowledge FROM Payees WHERE budgetId = ?1 UNION ALL
				SELECT COALESCE(MAX(deviceKnowledge), 0) as deviceKnowledge FROM PayeeLocations WHERE budgetId = ?1 UNION ALL
				SELECT COALESCE(MAX(deviceKnowledge), 0) as deviceKnowledge FROM PayeeRenameConditions WHERE budgetId = ?1 UNION ALL
				SELECT COALESCE(MAX(deviceKnowledge), 0) as deviceKnowledge FROM ScheduledSubTransactions WHERE budgetId = ?1 UNION ALL
				SELECT COALESCE(MAX(deviceKnowledge), 0) as deviceKnowledge FROM ScheduledTransactions WHERE budgetId = ?1 UNION ALL
				SELECT COALESCE(MAX(deviceKnowledge), 0) as deviceKnowledge FROM Settings WHERE budgetId = ?1 UNION ALL
				SELECT COALESCE(MAX(deviceKnowledge), 0) as deviceKnowledge FROM SubCategories WHERE budgetId = ?1 UNION ALL
				SELECT COALESCE(MAX(deviceKnowledge), 0) as deviceKnowledge FROM SubTransactions WHERE budgetId = ?1 UNION ALL
				SELECT COALESCE(MAX(deviceKnowledge), 0) as deviceKnowledge FROM Transactions WHERE budgetId = ?1
			)`,
			arguments: [budgetId]
		}
	}
}