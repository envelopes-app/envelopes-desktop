/// <reference path='../../_includes.ts' />

import * as _ from 'lodash';

import { InternalCategories, SubCategoryType } from '../../constants';
import { DateWithoutTime, Logger, KeyGenerator } from '../../utilities';
import { BudgetKnowledge } from '../KnowledgeObjects'; 
import { IDatabaseQuery } from '../../interfaces/persistence';
import * as budgetEntities from '../../interfaces/budgetEntities';
import { IReferenceDataForCalculations, IMonthlyCalculationsData } from '../../interfaces/calculations';
import { executeSqlQueries, executeSqlQueriesAndSaveKnowledge } from '../QueryExecutionUtility';
import { MonthlyBudgetQueries } from '../queries/budgetQueries';

export class MonthlyCalculations {

	// *************************************************************************************************************
	// Methods for loading and saving the data
	// *************************************************************************************************************
	protected loadData(budgetId:string, 
		referenceData:IReferenceDataForCalculations,
		startMonth:DateWithoutTime,
		endMonth:DateWithoutTime):Promise<IMonthlyCalculationsData> {

		var queryList:Array<IDatabaseQuery> = [
			this.fetchMonthlyDataForCalculations(budgetId, referenceData, startMonth, endMonth)
		];
		
		if (referenceData.firstMonth.isBefore(startMonth)){
			// base month
			queryList.push(MonthlyBudgetQueries.findMonthlyBudgetByMonth(budgetId, startMonth.clone().subtractMonths(1)));    
		}
		
		return executeSqlQueries(queryList);
	}

	protected saveData(budgetId:string,
		budgetKnowledge:BudgetKnowledge,
		monthlyBudgets:Array<budgetEntities.IMonthlyBudget>):Promise<boolean> {

		var queryList:Array<IDatabaseQuery> = [];

		// Iterate through all the entities and build persistence queries
		_.forEach(monthlyBudgets, (monthlyBudget:budgetEntities.IMonthlyBudget)=>{

			monthlyBudget.deviceKnowledgeForCalculatedFields = budgetKnowledge.getNextValueForCalculations();
			queryList.push( MonthlyBudgetQueries.insertDatabaseObject(monthlyBudget));
		});

		return executeSqlQueriesAndSaveKnowledge(queryList, budgetId, budgetKnowledge);
	}

	private fetchMonthlyDataForCalculations(budgetId:string, 
		referenceData:IReferenceDataForCalculations,
		startMonth:DateWithoutTime,
		endMonth:DateWithoutTime):IDatabaseQuery {
		
		return {
			name: "monthlySubCategoryBudgetsAggregated",
			query: `
SELECT m.month, m.note, m.deviceKnowledge,
    SUM(CASE WHEN (subCategoryType IN (?4, ?5) OR subCategoryId = ?6) THEN COALESCE(s.cashOutflows,0) ELSE 0 END) as cashOutflows,
    SUM(CASE WHEN (subCategoryType IN (?4, ?5) OR subCategoryId = ?6) THEN COALESCE(s.creditOutflows,0) ELSE 0 END) as creditOutflows, 
    SUM(CASE WHEN (subCategoryType IN (?4, ?5)) THEN COALESCE(s.budgeted,0) ELSE 0 END) as budgeted,
    SUM(CASE WHEN (subCategoryType IN (?4, ?5) OR subCategoryId = ?6) THEN COALESCE(s.balance,0) ELSE 0 END) as balance,
    SUM(CASE WHEN subCategoryId = ?7 THEN COALESCE(s.cashOutflows,0) ELSE 0 END) as immediateIncome,
    SUM(CASE WHEN subCategoryId = ?8 THEN COALESCE(s.cashOutflows,0) ELSE 0 END) as deferredIncome,
    SUM(CASE WHEN subCategoryId = ?6 THEN COALESCE(s.cashOutflows,0) ELSE 0 END) as uncategorizedCashOutflows,
    SUM(CASE WHEN subCategoryId = ?6 THEN COALESCE(s.creditOutflows,0) ELSE 0 END) as uncategorizedCreditOutflows,
    SUM(CASE WHEN subCategoryId = ?6 THEN COALESCE(s.balance,0) ELSE 0 END) as uncategorizedBalance,
    SUM(CASE WHEN masterCategoryInternalName = ?9 THEN COALESCE(s.budgeted,0) ELSE 0 END) as hiddenBudgeted,
    SUM(CASE WHEN masterCategoryInternalName = ?9 THEN COALESCE(s.cashOutflows,0) ELSE 0 END) as hiddenCashOutflows,
    SUM(CASE WHEN masterCategoryInternalName = ?9 THEN COALESCE(s.creditOutflows,0) ELSE 0 END) as hiddenCreditOutflows,
    SUM(CASE WHEN masterCategoryInternalName = ?9 THEN COALESCE(s.balance,0) ELSE 0 END) as hiddenBalance,
    SUM(COALESCE(s.additionalToBeBudgeted,0)) as additionalToBeBudgeted,
    
    SUM(CASE WHEN ((subCategoryType IN (?4, ?5) OR subCategoryId = ?6) AND COALESCE(overspendingAffectsBuffer = 1,1) AND COALESCE(s.balance,0) < 0) THEN (COALESCE(s.balance,0) - COALESCE(s.unbudgetedCreditOutflows,0)) ELSE 0 END) as overSpent
FROM MonthlySubCategoryBudgets s
    INNER JOIN MonthlyBudgets m ON m.entityId = s.monthlyBudgetId
WHERE s.budgetId = ?1	
    AND s.month >= ?2 AND s.month <= ?3
    AND s.isTombstone = 0
GROUP BY s.month
ORDER BY m.month
			`,
			arguments: [budgetId, startMonth.toISOString(), endMonth.toISOString(), SubCategoryType.Default, SubCategoryType.Debt, referenceData.uncategorizedSubCategoryId, referenceData.immediateIncomeSubCategoryId, referenceData.deferredIncomeSubCategoryId, InternalCategories.HiddenMasterCategory]
		};
	}   
	
	// *************************************************************************************************************
	// Main Calculation Performing Method
	// *************************************************************************************************************
	public performCalculations(budgetId:string,
								budgetKnowledge:BudgetKnowledge,
								referenceData:IReferenceDataForCalculations,
								startMonth:DateWithoutTime,
								endMonth:DateWithoutTime):Promise<boolean> {

		Logger.info(`MonthlyCalculations::Performing calculations (startMonth: ${startMonth.toISOString()}; endMonth: ${endMonth})`);
		
		return this.loadData(budgetId, referenceData, startMonth, endMonth)
			.then((data:IMonthlyCalculationsData)=>{
				var previousMonthlyBudget:budgetEntities.IMonthlyBudget = null;
				
				if (data.monthlyBudgets && data.monthlyBudgets.length) {
					//previousMonthlyBudget will initially be base month
					previousMonthlyBudget = data.monthlyBudgets[0];
				}
				
				// NOTE: The following code ASSUMES data.monthlySubcategoryBudgets are ordered by: 
				//    (month)
				_.forEach(data.monthlySubCategoryBudgetsAggregated, (monthlyBudget:budgetEntities.IMonthlyBudget)=>{
					var month:DateWithoutTime = DateWithoutTime.createFromISOString(monthlyBudget.month);
					
					var previousAvailableToBudget:number = 0;
					var previousDeferredIncome:number = 0;
					var previousOverSpent:number = 0;
					
					if (previousMonthlyBudget) {
						previousAvailableToBudget = previousMonthlyBudget.availableToBudget; 
						previousOverSpent = previousMonthlyBudget.overSpent;
					}
					
					monthlyBudget.budgetId = budgetId;
					monthlyBudget.entityId = KeyGenerator.getMonthlyBudgetIdentity(budgetId, month);
					monthlyBudget.isTombstone = 0;

					monthlyBudget.availableToBudget = (previousAvailableToBudget + previousDeferredIncome + previousOverSpent)
						+ (monthlyBudget.immediateIncome - monthlyBudget.budgeted + monthlyBudget.additionalToBeBudgeted);
					
					previousMonthlyBudget = monthlyBudget;
				});
				
				return this.saveData(budgetId, budgetKnowledge, data.monthlySubCategoryBudgetsAggregated);
			});
	}
}