/// <reference path='../../_includes.ts' />

import * as _ from 'lodash';

import { SubCategoryType, SubCategoryGoalType } from '../../constants';
import { BudgetKnowledge } from '../KnowledgeObjects'; 
import * as budgetEntities from '../../interfaces/budgetEntities';
import { IDatabaseQuery } from '../../interfaces/persistence';
import { DateWithoutTime, Logger, KeyGenerator } from '../../utilities';
import { ISimpleEntitiesCollection } from '../../interfaces/state';
import { MonthlySubCategoryBudgetQueries } from '../queries/budgetQueries';
import { executeSqlQueries, executeSqlQueriesAndSaveKnowledge } from '../QueryExecutionUtility';
import { IReferenceDataForCalculations, ISubCategoryCalculationsData, ISubCategoryPaymentCalculationsData } from '../../interfaces/calculations';

export class SubCategoryCalculations {

	// *************************************************************************************************************
	// Methods for loading and saving data
	// *************************************************************************************************************
	protected loadDefaultAndInternalSubCategoryData(budgetId:string,
		referenceData:IReferenceDataForCalculations,
		subCategoryIds:string[],
		startMonth:DateWithoutTime,
		endMonth:DateWithoutTime):Promise<ISubCategoryCalculationsData> {

		// pull from startMonth-1 because we need base values
		var adjustedStartMonth = startMonth.clone();
		if (referenceData.firstMonth.isBefore(startMonth)){
			adjustedStartMonth.subtractMonths(1);
		}
			
		return executeSqlQueries([
			this.fetchMonthlyDefaultAndInternalSubcategoriesForCalculations(budgetId, subCategoryIds, referenceData.runFullCalculations, adjustedStartMonth, endMonth)
		]);
	}
	
	protected loadPaymentSubCategoryData(budgetId:string,
		referenceData:IReferenceDataForCalculations,
		queuedSubCategoryIds:string[], paymentCategoryAccountIdsToInclude:string[],
		startMonth:DateWithoutTime,
		endMonth:DateWithoutTime):Promise<ISubCategoryPaymentCalculationsData> {

		// pull from startMonth-1 because we need base values
		var adjustedStartMonth = startMonth.clone();
		if (referenceData.firstMonth.isBefore(startMonth)){
			adjustedStartMonth.subtractMonths(1);
		}
		
		return executeSqlQueries([
			this.fetchMonthlyPaymentCategoriesForCalculations(budgetId, queuedSubCategoryIds, paymentCategoryAccountIdsToInclude, adjustedStartMonth, endMonth)
		]);
	}

	protected saveData(budgetId:string,
		monthlySubCategoryBudgets:Array<budgetEntities.IMonthlySubCategoryBudget>,            
		budgetKnowledge:BudgetKnowledge):Promise<boolean> {

		var queryList:Array<IDatabaseQuery> = [];

		// Iterate through all the entities and build persistence queries
		_.forEach(monthlySubCategoryBudgets, (monthlySubCategoryBudget:budgetEntities.IMonthlySubCategoryBudget)=>{

			monthlySubCategoryBudget.deviceKnowledgeForCalculatedFields = budgetKnowledge.getNextValueForCalculations();
			// If the MonthlySubCategoryBudget entity does not already exist in the database, the deviceKnowledge would be null.
			if(!monthlySubCategoryBudget.deviceKnowledge)
				monthlySubCategoryBudget.deviceKnowledge = budgetKnowledge.getNextValue();

			queryList.push( MonthlySubCategoryBudgetQueries.insertDatabaseObject(monthlySubCategoryBudget));
		});

		return executeSqlQueriesAndSaveKnowledge(queryList, budgetId, budgetKnowledge);
	}
	
	protected calculateAggregatesFromPriorMonths(budgetId:string,
		subCategoryIds:string[],
		startMonth:DateWithoutTime,
		endMonth:DateWithoutTime):Promise<boolean> {

		return executeSqlQueries([
			this.generateCalculateAggregatesFromPriorMonthsQuery(budgetId, subCategoryIds, startMonth, endMonth)
		]);
	}
        
	private fetchMonthlyDefaultAndInternalSubcategoriesForCalculations(budgetId:string, 
		subCategoryIds:string[], isFullCalcs:boolean,
		startMonth:DateWithoutTime, endMonth:DateWithoutTime):IDatabaseQuery {
		
		var subCategoryIdsINClause = "";
		var includeAllSubCategories = false;
		
		if (isFullCalcs) {
			includeAllSubCategories = true;
		} else {
			var subCategoryIdsWrappedInApostrophes:string[] = _.map(subCategoryIds, function(s) {return `'${s}'`; });
			subCategoryIdsINClause = subCategoryIdsWrappedInApostrophes.join(", ");                
		}

		var monthsApart:number = startMonth.monthsApart(endMonth);
		var monthEpochValues:string[] = []; 
		for(var i = 0; i <= monthsApart; i++){
			monthEpochValues.push(`(${startMonth.clone().addMonths(i).getUTCTimeSeconds()})`);
		}
		var monthsVirtualTable:string = `
(SELECT "" as month_epoch, date(datetime("", 'unixepoch')) as month FROM (VALUES ${monthEpochValues.join(",")}))`;
            
		return {
			name: "monthlySubCategoryBudgets",
			query: `
WITH e_months_categories AS ( 
    SELECT ('mcb/' || strftime('%Y-%m', datetime(m.month_epoch, 'unixepoch')) || '/' || s.entityId) as entityId,
        m.month, m.month_epoch, s.entityId as subCategoryId, COALESCE(COUNT(t.transactionId),0) AS transactionsCount,
        COALESCE(SUM(t.cashAmount),0) AS cashOutflows, COALESCE(SUM(t.creditAmount),0) as creditOutflows,
        -- we will carry SubCategory.isTombtone forward to MonthlySubCategoryBudgets.isTombstone (if SubCategory tombstoned, so will MSCB record)
        s.isTombstone
    FROM ${monthsVirtualTable} m, 
        Subcategories s
        LEFT JOIN TransactionCalculations t ON t.subcategoryId = s.entityId AND t.month_epoch = m.month_epoch 	 
    WHERE (s.budgetId = ?1 AND (?2 = 1 OR s.entityId IN (${subCategoryIdsINClause})))
        AND s.isTombstone = 0
        AND COALESCE(s.type,'') != '${SubCategoryType.Debt}'
    GROUP BY m.month_epoch, s.entityId
)
SELECT mc.*,
    COALESCE(sc.budgeted,0) as budgeted, sc.note, 
    sc.upcomingTransactions, sc.upcomingTransactionsCount, sc.deviceKnowledge,
    -- The following fields are used as a base from previous month
    sc.balance, sc.goalOverallFunded, sc.goalTarget
FROM e_months_categories mc
	LEFT JOIN MonthlySubCategoryBudgets sc ON sc.entityId = mc.entityId
ORDER BY mc.subCategoryId, mc.month
			`,
			arguments: [budgetId, includeAllSubCategories]
		};
	}
        
	private fetchMonthlyPaymentCategoriesForCalculations(budgetId:string, 
		queuedSubCategoryIds:string[], paymentCategoryAccountIdsToInclude:string[],
		startMonth:DateWithoutTime, endMonth:DateWithoutTime):IDatabaseQuery {
			
		var queuedSubCategoryIdsWrappedInApostrophes:string[] = _.map(queuedSubCategoryIds, function(s) {return `'${s}'`; });
		var queuedSubCategoryIdsINClause = queuedSubCategoryIdsWrappedInApostrophes.join(", ");
		
		var paymentCategoryAccountIdsVALUESClause = "";
		if (paymentCategoryAccountIdsToInclude.length > 0) {
			var paymentCategoryAccountIdsToIncludeWrappedInApostrophes:string[] = _.map(paymentCategoryAccountIdsToInclude, function(a) {return `('${a}')`; });
			paymentCategoryAccountIdsVALUESClause = `VALUES ${paymentCategoryAccountIdsToIncludeWrappedInApostrophes.join(", ")} UNION`;
		}
		
		var monthsApart:number = startMonth.monthsApart(endMonth);
		var monthEpochValues:string[] = []; 
		for(var i = 0; i <= monthsApart; i++){
			monthEpochValues.push(`(${startMonth.clone().addMonths(i).getUTCTimeSeconds()})`);
		}
		var monthsVirtualTable:string = `
(SELECT "" as month_epoch, date(datetime("", 'unixepoch')) as month FROM (VALUES ${monthEpochValues.join(",")}))`;
            
		return {
			name: "monthlySubCategoryBudgets",
			query: `
WITH e_liability_accounts AS (
    SELECT "" as accountId FROM (
        -- Explicit list of payment category accounts to include
        ${paymentCategoryAccountIdsVALUESClause}        
        -- List of payment categories to include because transations exist in other subCategories that were queued 
        SELECT DISTINCT t.accountId AS ""
        FROM TransactionCalculations t	
        WHERE t.subCategoryId IN (${queuedSubCategoryIdsINClause})
            AND t.month_epoch >= ${startMonth.getUTCTimeSeconds()}
            AND t.onBudget = 1
            AND t.isLiabilityAccount = 1
    )
), e_liability_account_activity AS ( 
    SELECT t.accountId, t.month_epoch,
        -- budgeted_credit_outflows: at time credit transaction hit the category, what portion was budgeted for
        COALESCE(SUM(CASE WHEN t.isImmediateIncomeSubCategory = 0 AND COALESCE(t.isTransferAccountOnBudget,0) = 0
            THEN (
                MAX(MAX((c.balance - c.cashOutflows - c.creditOutflows) + c.cashOutflows,0) + t.subCategoryCreditAmountPreceding + t.creditAmount, 0)
                - MAX(MAX((c.balance - c.cashOutflows - c.creditOutflows) + c.cashOutflows,0) + t.subCategoryCreditAmountPreceding, 0)
            )
            ELSE 0 END),0) as budgetedCreditOutflows,
        COALESCE(SUM(CASE WHEN t.creditAmount < 0 AND t.isImmediateIncomeSubCategory = 0 AND COALESCE(t.isTransferAccountOnBudget,0) = 0
            THEN (
                MAX(MAX((c.balance - c.cashOutflows - c.creditOutflows) + c.cashOutflows,0) + t.subCategoryCreditAmountPreceding + t.creditAmount, 0)
                - MAX(MAX((c.balance - c.cashOutflows - c.creditOutflows) + c.cashOutflows,0) + t.subCategoryCreditAmountPreceding, 0)
            )
            ELSE 0 END),0) as positiveCashOutflows,
        -- all_spending: everything but incoming amounts from on-budget transfers
        COALESCE(SUM(CASE WHEN t.transferAccountId IS NULL OR t.isTransferAccountOnBudget = 0 OR t.amount < 0 THEN t.creditAmount ELSE 0 END),0) as allSpending,
        -- additional_to_be_budgeted: cash portion of transfers to be added to TbB
        COALESCE(
            -- add cash amount of incoming on-budget transfers and outgoing transfers to asset accounts
              COALESCE(SUM(CASE WHEN t.isTransferAccountOnBudget = 1 AND (t.amount > 0 OR t.isTransferAccountAsset = 1) THEN t.cashAmount ELSE 0 END),0)
            -- add cash portion of inflow on *receiving* side here because only the liability account (sending) side will be interated through
            + COALESCE(SUM(CASE WHEN t.isTransferAccountOnBudget = 1 AND t.amount < 0 AND t.isTransferAccountAsset = 1 THEN COALESCE(tt.cashAmount,0) ELSE 0 END),0) 
        ,0) as additionalToBeBudgeted,
        -- payment_activity: payments received during the month
        COALESCE(SUM(CASE WHEN t.isTransferAccountOnBudget = 1 AND t.amount > 0 THEN COALESCE(tt.cashAmount,0) ELSE 0 END),0) as paymentActivity,
        -- all_spending_since_last_payment: all_spending since last payment (if no payment or spending this month, this will be NULL)
        COALESCE(SUM(CASE WHEN (t.rowid > lastPayments.lastPayment_rowid AND (t.transferAccountId IS NULL OR t.isTransferAccountOnBudget = 0 OR t.amount < 0)) THEN t.creditAmount ELSE NULL END),
            CASE 
                WHEN MAX(lastPayments.lastPayment_rowid) IS NOT NULL THEN 0 -- No spending after last payment
                ELSE NULL -- NULL here means we have no payments this month 
            END
        )
         as allSpendingSinceLastPayment
    FROM TransactionCalculations t
    INNER JOIN MonthlySubCategoryBudgets c 
        ON c.entityId = ('mcb/' || strftime('%Y-%m', datetime(t.month_epoch, 'unixepoch')) || '/' || t.subCategoryId)
    LEFT JOIN TransactionCalculations tt ON t.transferTransactionId = tt.transactionId
    LEFT JOIN (
            -- Last payments by liability account
            SELECT accountId, month_epoch, MAX(rowid) as lastPayment_rowid
            FROM TransactionCalculations
            WHERE accountId IN (SELECT accountId FROM e_liability_accounts)
                AND amount > 0 
                AND transferAccountId IS NOT NULL
            GROUP BY accountId, month_epoch
        ) lastPayments ON t.accountId = lastPayments.accountId AND t.month_epoch = lastPayments.month_epoch
    WHERE t.accountId IN (SELECT accountId FROM e_liability_accounts)
        AND (t.isPayeeStartingBalance = 0 OR t.isImmediateIncomeSubCategory = 0)
    GROUP BY t.month_epoch, t.accountId
), e_months_debt_categories AS ( 
    SELECT ('mcb/' || strftime('%Y-%m', datetime(m.month_epoch, 'unixepoch')) || '/' || s.entityId) as entityId,
        m.month, m.month_epoch, s.entityId as subCategoryId,
        s.accountId,
        -- we will carry SubCategory.isTombtone forward to MonthlySubCategoryBudgets.isTombstone (if SubCategory tombstoned, so will MSCB record)
        s.isTombstone
    FROM ${monthsVirtualTable} m, 
        Subcategories s 
    WHERE s.accountId IN (SELECT accountId FROM e_liability_accounts)
        AND s.type = '${SubCategoryType.Debt}'
    GROUP BY m.month_epoch, s.entityId
)
SELECT mc.entityId, mc.month, mc.subCategoryId,
    (-(lac.budgetedCreditOutflows) + lac.paymentActivity) as cashOutflows, 0 as creditOutflows,
    COALESCE(sc.budgeted,0) as budgeted, sc.note, sc.goalTarget,
    lac.budgetedCreditOutflows as budgetedSpending, 
    -(lac.positiveCashOutflows) as positiveCashOutflows,
    lac.allSpending, lac.additionalToBeBudgeted, lac.allSpendingSinceLastPayment,
    -- The following fields are used as a base from previous month
    sc.balance, sc.goalOverallFunded, sc.deviceKnowledge, mc.isTombstone
FROM e_months_debt_categories mc
	LEFT JOIN e_liability_account_activity lac ON lac.accountId = mc.accountId AND lac.month_epoch = mc.month_epoch
    LEFT JOIN MonthlySubCategoryBudgets sc ON sc.entityId = mc.entityId        
ORDER BY mc.subCategoryId, mc.month_epoch
			`,
			arguments: []
		};
	}
        
	private generateCalculateAggregatesFromPriorMonthsQuery(budgetId:string, subCategoryIds:string[], startMonth:DateWithoutTime, endMonth:DateWithoutTime){

		var subCategoryIdsWrappedInApostrophes:string[] = _.map(subCategoryIds, function(s) {return `'${s}'`; });
		var subCategoryIdsINClause = subCategoryIdsWrappedInApostrophes.join(", ");
		
		return {
			name: "",
			query: `
			WITH e_min_max_activity_months AS (
	SELECT m.subCategoryId, 
		MIN(m.month) minMonthActivity,
		MAX(CASE WHEN s.type = 'DBT' AND m.allSpendingSinceLastPayment != 0 THEN m.month ElSE NULL END) as maxMonthPayment
	FROM MonthlySubCategoryBudgets m 
	INNER JOIN SubCategories s ON m.subCategoryId = s.entityId
	WHERE m.budgetId = ?1
        AND m.subCategoryId IN (${subCategoryIdsINClause})
		AND (m.budgeted != 0 OR m.cashOutflows !=0 OR m.creditOutflows !=0)
	GROUP BY m.subCategoryId
), e_categories_prior_months AS (
	SELECT m.entityId,
		CAST(ROUND(AVG(COALESCE(mp.budgeted,0))) as int) as budgetedAverage,
		CAST(ROUND(AVG(COALESCE(mp.cashOutflows,0) + COALESCE(mp.creditOutflows,0))) as int) as spentAverage,
		CAST(ROUND(AVG(COALESCE(mp.cashOutflows,0) + COALESCE(mp.budgetedSpending,0))) as int) as paymentAverage,
		(
			-- Take all_spending_since_last_payment from last payment month
			COALESCE(SUM(CASE WHEN s.type = 'DBT' AND mp.month = mm.maxMonthPayment THEN COALESCE(mp.allSpendingSinceLastPayment,0) ELSE 0 END),0)
			-- Add all_spending in subsequent months
		  + COALESCE(SUM(CASE WHEN s.type = 'DBT' AND (mm.maxMonthPayment IS NULL OR mp.month > mm.maxMonthPayment) THEN COALESCE(mp.allSpending,0) ELSE 0 END),0)
        ) as allSpendingSinceLastPaymentPreviousMonths
	FROM MonthlySubCategoryBudgets m
	INNER JOIN SubCategories s ON m.subCategoryId = s.entityId
	INNER JOIN MonthlySubCategoryBudgets mp ON mp.subCategoryId = m.subCategoryId AND mp.month < m.month
	LEFT JOIN e_min_max_activity_months mm ON mm.subCategoryId = m.subCategoryId
	WHERE m.budgetId = ?1
        AND m.month >= ?2 AND m.month <= ?3
        AND m.subCategoryId IN (${subCategoryIdsINClause})
		AND mp.month >= date(julianday(m.month), '-12 months')
		AND (m.month = COALESCE(mm.minMonthActivity,m.month) OR mp.month >= COALESCE(mm.minMonthActivity,m.month))
	GROUP BY m.entityId
)
REPLACE INTO MonthlySubCategoryBudgets (
    budgetId, entityId, isTombstone, monthlyBudgetId, month, subCategoryId, budgeted,
    note, cashOutflows, creditOutflows, balance, budgetedCashOutflows, budgetedCreditOutflows,
    unBudgetedCashOutflows, unBudgetedCreditOutflows, budgetedPreviousMonth, spentPreviousMonth, paymentPreviousMonth, 
    balancePreviousMonth, budgetedAverage, spentAverage, paymentAverage, budgetedSpending, upcomingTransactions, goalTarget,
    deviceKnowledge, allSpendingSinceLastPayment, goalOverallFunded, goalUnderFunded, goalOverallLeft, goalExpectedCompletion,
    allSpending, positiveCashOutflows, additionalToBeBudgeted, upcomingTransactionsCount, deviceKnowledgeForCalculatedFields
)
SELECT budgetId, m.entityId, isTombstone, monthlyBudgetId, month, subCategoryId, budgeted,
    note, cashOutflows, creditOutflows, balance,
    budgetedCashOutflows, budgetedCreditOutflows, unBudgetedCashOutflows, unBudgetedCreditOutflows,
    budgetedPreviousMonth, spentPreviousMonth, paymentPreviousMonth, balancePreviousMonth, 
    
    COALESCE(a.budgetedAverage,0) as budgetedAverage,
	COALESCE(a.spentAverage,0) as spentAverage,
	COALESCE(a.paymentAverage,0) as paymentAverage,
    
    budgetedSpending, upcomingTransactions, goalTarget, deviceKnowledge,
    
    -- If there was no spending or payment in the payment category month, c.allSpendingSinceLastPayment will be NULL. -- So, we will pull spending since last payment in previous months (allSpendingSinceLastPaymentPreviousMonths)
    -- and add current month spending to it to come up with allSpendingSinceLastPayment
	COALESCE(m.allSpendingSinceLastPayment, 
        (COALESCE(m.allSpending,0) + COALESCE(a.allSpendingSinceLastPaymentPreviousMonths,0))
    ) as allSpendingSinceLastPayment,  
    
    goalOverallFunded, goalUnderFunded, goalOverallLeft, goalExpectedCompletion,
    allSpending, positiveCashOutflows, additionalToBeBudgeted, upcomingTransactionsCount, deviceKnowledgeForCalculatedFields
FROM MonthlySubCategoryBudgets m
    LEFT JOIN e_categories_prior_months a ON a.entityId = m.entityId
WHERE m.subCategoryId IN (${subCategoryIdsINClause})
    AND m.month >= ?2 AND m.month <= ?3
    AND (COALESCE(a.budgetedAverage,0) != COALESCE(m.budgetedAverage,0)
        OR COALESCE(a.spentAverage,0) != COALESCE(m.spentAverage,0)
        OR COALESCE(a.paymentAverage,0) != COALESCE(m.paymentAverage,0)
        OR m.allSpendingSinceLastPayment IS NULL
    )
			`,
			arguments: [budgetId, startMonth.toISOString(), endMonth.toISOString()]
		}
	}
	
	// *************************************************************************************************************
	// Main Calculation Performing Method
	// *************************************************************************************************************
	public performCalculations(budgetId:string,
		budgetKnowledge:BudgetKnowledge,
		referenceData:IReferenceDataForCalculations,
		subCategoryIds:string[],
		startMonth:DateWithoutTime,
		endMonth:DateWithoutTime):Promise<boolean> {

		var hasPaymentCategories = (referenceData.paymentCategories.length > 0);
		var paymentSubCategoryIds:string[] = null;
		
		Logger.info(`SubcategoryCalculations::Loading data for category calculations (DFT/internal) (startMonth: ${startMonth.toISOString()}; endMonth: ${endMonth}; subcategoryIds: ${subCategoryIds})`);
		
		// DFT/internal calcs start here
		return this.loadDefaultAndInternalSubCategoryData(budgetId, referenceData, subCategoryIds, startMonth, endMonth)
		.then((data:ISubCategoryCalculationsData)=>{
			
			Logger.info(`SubcategoryCalculations::Performing calculations for categories (DFT/internal)`);
			
			return this.performMonthlySubcategoryBudgetCalculations(budgetId, budgetKnowledge, referenceData, startMonth, 
				data.monthlySubCategoryBudgets);
		}).then((retVal:boolean)=>{
			
			Logger.info(`SubCategoryCalculations::Done with category calculations (DFT/internal)`);
							
			if (!hasPaymentCategories) {
				return Promise.resolve(null);
			}
			
			Logger.info(`SubCategoryCalculations::Loading data for payment category calculations (DBT) (startMonth: ${startMonth.toISOString()}; endMonth: ${endMonth};)`);
			
			/* There are 3 ways a payment category can be include in the calculations:
				1. The payment category was explicitly queued (i.e. budgeting in payment category)
				2. The corresponding liability account had transaction calcs queued (i.e. transaction deleted)
				3. The corresponding liability account has transactions in a subcategory that was queued for calcs 
					(i.e. Groceries category has liability account transactions and the budgeted amount for the category was just changed )
			*/ 
			
			// paymentCategoryAccountIdsToInclude: Gather a list of payment category accountIds that will cover #1 and #2 above.  #3 will
			// be handled later inside the query, by deriving from subCategoryIds.
			var paymentCategoryAccountIdsToInclude:string[] = <string[]>_.chain(referenceData.paymentCategories)
				.filter((category:budgetEntities.ISubCategory) => {
					return _.includes(subCategoryIds, category.entityId) //payment category explicity queued
							// transaction calcs for liability account queued (i.e. liability transaction deleted on account) 
						|| _.includes(referenceData.queuedTransactionCalculationAccountIds, category.accountId);
				}).map('accountId').value();
				
			return this.loadPaymentSubCategoryData(budgetId, referenceData, subCategoryIds, paymentCategoryAccountIdsToInclude, startMonth, endMonth);
		}).then((data:ISubCategoryPaymentCalculationsData)=>{
			
			// payment category calcs
			if (!hasPaymentCategories) {
				return Promise.resolve(true);
			}
			
			// even though we only queued calcs on subCategoryIds, the debt calcs will pull back
			// dependent payment categories and  we need to keep track of these b/c we we need to run aggregates on them next
			paymentSubCategoryIds = _.uniq(_.map(data.monthlySubCategoryBudgets, 'subCategoryId')) as Array<string>; 
			
			Logger.info(`SubCategoryCalculations::Performing calculations for payment categories (DBT) (paymentSubCategoryIds: ${paymentSubCategoryIds})`);
			
			return this.performMonthlySubcategoryBudgetCalculations(budgetId, budgetKnowledge, referenceData, startMonth, data.monthlySubCategoryBudgets);
		}).then((retVal:boolean)=>{
			
			Logger.info(`SubCategoryCalculations::Done with payment category calculations (DBT)`);
			
			var aggregateSubCategoryIds = subCategoryIds.concat(paymentSubCategoryIds);

			Logger.info(`SubCategoryCalculations::Performing prior month aggregates (startMonth: ${startMonth.toISOString()}; endMonth: ${endMonth}; aggregateSubCategoryIds: ${aggregateSubCategoryIds})`);
			
			//averages and spending since last payment
			return this.calculateAggregatesFromPriorMonths(budgetId, aggregateSubCategoryIds, startMonth, endMonth);
			});
	}
	
	protected performMonthlySubcategoryBudgetCalculations(budgetId:string, budgetKnowledge:BudgetKnowledge,
		referenceData:IReferenceDataForCalculations,
		startMonth:DateWithoutTime,
		monthlySubcategoryBudgets:Array<budgetEntities.IMonthlySubCategoryBudget>){
			
			var previousMonthlySubcategoryBudget:budgetEntities.IMonthlySubCategoryBudget = null;
			var updatedMonthlySubcategoryBudgets:Array<budgetEntities.IMonthlySubCategoryBudget> = [];
			
			// NOTE: The following code ASSUMES data.monthlySubcategoryBudgets are ordered by: 
			//    (subCategoryId, month)
			
			_.forEach(monthlySubcategoryBudgets, (monthlySubcategoryBudget:budgetEntities.IMonthlySubCategoryBudget)=>{
				var month:DateWithoutTime = DateWithoutTime.createFromISOString(monthlySubcategoryBudget.month);
				
				if (month.isBefore(startMonth) && (month.isAfter(referenceData.firstMonth) || month.equalsByMonth(referenceData.firstMonth))) {
						// monthlySubcategoryBudget.month is < startMonth; do not
						// perform calcs on it but set previousMonthlySubcategoryBudget so we can use on next iteration as a base.
						previousMonthlySubcategoryBudget = monthlySubcategoryBudget;
						return;  
				}
				
				var subCategory:budgetEntities.ISubCategory = referenceData.subCategoriesMap[monthlySubcategoryBudget.subCategoryId];
				var masterSubCategory:budgetEntities.IMasterCategory = referenceData.masterCategoriesMap[subCategory.masterCategoryId];
				
				var baseMonthlySubcategoryBudget:budgetEntities.IMonthlySubCategoryBudget = null;
				if (previousMonthlySubcategoryBudget != null) {
					if (monthlySubcategoryBudget.subCategoryId == previousMonthlySubcategoryBudget.subCategoryId) {
						// we are still on the same category, so use previous month as base
						baseMonthlySubcategoryBudget = previousMonthlySubcategoryBudget;
					}
				}
				
				monthlySubcategoryBudget.budgetId = budgetId;
				monthlySubcategoryBudget.monthlyBudgetId = KeyGenerator.getMonthlyBudgetIdentity(budgetId, month);

				// Note: monthlySubcategoryBudget.isTombstone is being set in load data query as SubCategories.isTombstone
				//       so that if the SubCategory is tombstoned, so will the monthlySubcategoryBudget record;
				
				this.calculateBalance(monthlySubcategoryBudget, baseMonthlySubcategoryBudget);
				this.calculateBudgetedCashCreditOutflows(monthlySubcategoryBudget);
				this.calculateGoals(monthlySubcategoryBudget, baseMonthlySubcategoryBudget, subCategory, month, referenceData);
				this.setPreviousMonthFields(monthlySubcategoryBudget, baseMonthlySubcategoryBudget);
				
				if (subCategory.type != SubCategoryType.Debt){
					monthlySubcategoryBudget.additionalToBeBudgeted = null;
					monthlySubcategoryBudget.budgetedSpending = null;
					monthlySubcategoryBudget.positiveCashOutflows = null;
					monthlySubcategoryBudget.paymentAverage = null;
					monthlySubcategoryBudget.allSpending = null;
					monthlySubcategoryBudget.allSpendingSinceLastPayment = null;
				}
				
				/* The following fields are being retrieved in the data query and will therefore be saved back as is:
					- budgeted, note, upcomingTransactions, upcomingTransactionsCount 
					- isTombstone (pulls SubCategories.isTombstone)
				*/
				
				updatedMonthlySubcategoryBudgets.push(monthlySubcategoryBudget);
				previousMonthlySubcategoryBudget = monthlySubcategoryBudget;
			});
			
			return this.saveData(budgetId, updatedMonthlySubcategoryBudgets, budgetKnowledge);
	}
	
	protected calculateBalance(monthlySubcategoryBudget:budgetEntities.IMonthlySubCategoryBudget,
		baseMonthlySubcategoryBudget:budgetEntities.IMonthlySubCategoryBudget):void {
			
			var baseBalance:number = 0;
				
			if (baseMonthlySubcategoryBudget != null) {
				monthlySubcategoryBudget.balancePreviousMonth = baseMonthlySubcategoryBudget.balance;
					
				if (baseMonthlySubcategoryBudget.balance > 0) {
					// carry forward previous month balance 
					baseBalance = baseMonthlySubcategoryBudget.balance;
				}
			}
			
			monthlySubcategoryBudget.balance = (baseBalance + monthlySubcategoryBudget.budgeted + monthlySubcategoryBudget.cashOutflows + monthlySubcategoryBudget.creditOutflows); 
	}
	
	protected calculateBudgetedCashCreditOutflows(monthlySubcategoryBudget:budgetEntities.IMonthlySubCategoryBudget):void {
		
		var balanceBeforeActivity = (monthlySubcategoryBudget.balance - monthlySubcategoryBudget.cashOutflows - monthlySubcategoryBudget.creditOutflows);
		
		// budgeted_cash_outflows: cash_outflows that were budgeted for
		monthlySubcategoryBudget.budgetedCashOutflows = (monthlySubcategoryBudget.cashOutflows - (Math.min(-balanceBeforeActivity, monthlySubcategoryBudget.cashOutflows, 0) + Math.max(balanceBeforeActivity, 0)));
		
		// unbudgeted_cash_outflows: cash_outflows that were NOT budgeted for (Note: this includes any negative budgeted amount!)
		monthlySubcategoryBudget.unBudgetedCashOutflows = Math.min(balanceBeforeActivity + monthlySubcategoryBudget.cashOutflows, 0)
		
		// budgeted_credit_outflows: credit_outflows that were budgeted for
		monthlySubcategoryBudget.budgetedCreditOutflows = (monthlySubcategoryBudget.creditOutflows - (Math.min(-(balanceBeforeActivity + monthlySubcategoryBudget.cashOutflows), monthlySubcategoryBudget.creditOutflows, 0) + Math.max(balanceBeforeActivity + monthlySubcategoryBudget.cashOutflows, 0)));
		
		// unbudgeted_credit_outflows: credit_outflows that were NOT budgeted for
		monthlySubcategoryBudget.unBudgetedCreditOutflows = Math.min(-(balanceBeforeActivity + monthlySubcategoryBudget.cashOutflows),  monthlySubcategoryBudget.creditOutflows, 0) + Math.max(balanceBeforeActivity + monthlySubcategoryBudget.cashOutflows, 0);
	}
	
	protected calculateGoals(monthlySubcategoryBudget:budgetEntities.IMonthlySubCategoryBudget,
		baseMonthlySubcategoryBudget:budgetEntities.IMonthlySubCategoryBudget,
		subCategory:budgetEntities.ISubCategory,
		currentMonth:DateWithoutTime,
		referenceData:IReferenceDataForCalculations):void{

		if(subCategory.goalCreationMonth) {

			var goalCreationMonth = DateWithoutTime.createFromISOString(subCategory.goalCreationMonth);
			if(currentMonth.isBefore(goalCreationMonth)) {

				// Null out all the goal related values
				monthlySubcategoryBudget.goalOverallFunded = 0;
				monthlySubcategoryBudget.goalTarget = 0;
				monthlySubcategoryBudget.goalUnderFunded = 0;
				monthlySubcategoryBudget.goalOverallLeft = 0;
				monthlySubcategoryBudget.goalExpectedCompletion = 0;
				return;
			}
		}

		if(subCategory.goalType == SubCategoryGoalType.MonthlyFunding) {

			// Overall funded is equal to what we have budgeted this month
			monthlySubcategoryBudget.goalOverallFunded = monthlySubcategoryBudget.budgeted;
			// Target is equal to the monthly funding value set for the goal, or the upcoming transactions, whichever is greater
			monthlySubcategoryBudget.goalTarget = subCategory.monthlyFunding;
			// Under funded is the difference of the above two
			monthlySubcategoryBudget.goalUnderFunded = Math.max(0, subCategory.monthlyFunding - monthlySubcategoryBudget.goalOverallFunded);
			// Overall left for 'monthly funding' is the same as the under funded value
			monthlySubcategoryBudget.goalOverallLeft = monthlySubcategoryBudget.goalUnderFunded;
			// Goal expected completion is not required
			monthlySubcategoryBudget.goalExpectedCompletion = 0;
		}
		else if(subCategory.goalType == SubCategoryGoalType.TargetBalance) {

			monthlySubcategoryBudget.goalOverallFunded = monthlySubcategoryBudget.budgeted;

			if(currentMonth.isAfter(goalCreationMonth) && baseMonthlySubcategoryBudget){
				//If after creation month, add goal_overall_funded from previous month; this gives us cumulative funding for the goal
				monthlySubcategoryBudget.goalOverallFunded += baseMonthlySubcategoryBudget.goalOverallFunded;
			}

			// Calculate the amount we are short of from hitting the goal target
			monthlySubcategoryBudget.goalOverallLeft = Math.max(0, subCategory.targetBalance - monthlySubcategoryBudget.balance);

			// Goal Target and Goal Under Funded are always 0 for this goal type since we don't have a target date
			monthlySubcategoryBudget.goalTarget = 0;
			monthlySubcategoryBudget.goalUnderFunded = 0;

			if (monthlySubcategoryBudget.goalOverallLeft > 0 && monthlySubcategoryBudget.budgeted > 0) {
				// We haven't yet reached our target.
				// Since there is no target date, hence there is no target balance for this goal type
				monthlySubcategoryBudget.goalExpectedCompletion = Math.ceil(monthlySubcategoryBudget.goalOverallLeft / monthlySubcategoryBudget.budgeted);
			} else {
				monthlySubcategoryBudget.goalExpectedCompletion = 0;
			}

		}
		else if(subCategory.goalType == SubCategoryGoalType.TargetBalanceOnDate) {

			monthlySubcategoryBudget.goalOverallFunded = monthlySubcategoryBudget.budgeted;

			if(currentMonth.isAfter(goalCreationMonth) && baseMonthlySubcategoryBudget){
				//If after creation month, add goal_overall_funded from previous month; this gives us cumulative funding for the goal
				monthlySubcategoryBudget.goalOverallFunded += baseMonthlySubcategoryBudget.goalOverallFunded;
			}

			// Calculate the amount we are short of from hitting the target

			//Goal Comletion Date are always 0 for this goal type
			monthlySubcategoryBudget.goalExpectedCompletion = 0;

			var targetBalance:number = subCategory.targetBalance;
			if (subCategory.type == SubCategoryType.Debt) {
				// For debt subcategories, the target balance equals the debt account balance (so it will be paid off)
				targetBalance = Math.abs(Math.min(referenceData.accountBalanacesByAccountId[subCategory.accountId],0));
			}

			monthlySubcategoryBudget.goalOverallLeft = Math.max(0, targetBalance - monthlySubcategoryBudget.balance);

			var targetBalanceMonth = DateWithoutTime.createFromISOString(subCategory.targetBalanceMonth);
			var monthsLeftToTargetMonth:number = currentMonth.monthsApart(targetBalanceMonth);
			var monthsToBudget = monthsLeftToTargetMonth + 1; //you can budget this month as well

			if (monthsToBudget <= 0 || monthlySubcategoryBudget.goalOverallLeft <= 0) {
				// When target date has passed or we have met goal, Target and Underfunded amounts should be 0.
				monthlySubcategoryBudget.goalTarget = 0;
				monthlySubcategoryBudget.goalUnderFunded = 0;
			} else {
				// Distribute the amount left over the month we can budget in
				monthlySubcategoryBudget.goalTarget = Math.ceil((targetBalance - monthlySubcategoryBudget.balance + monthlySubcategoryBudget.budgeted) / monthsToBudget);
				// Any parital pennies cause rounding up
				monthlySubcategoryBudget.goalTarget = (Math.ceil(monthlySubcategoryBudget.goalTarget / 10) * 10);

				monthlySubcategoryBudget.goalUnderFunded = Math.max(0, monthlySubcategoryBudget.goalTarget - monthlySubcategoryBudget.budgeted);
			}
		}
	}
	
	protected setPreviousMonthFields(monthlySubcategoryBudget:budgetEntities.IMonthlySubCategoryBudget,
		baseMonthlySubcategoryBudget:budgetEntities.IMonthlySubCategoryBudget):void {
		
		monthlySubcategoryBudget.budgetedPreviousMonth = 0;
		monthlySubcategoryBudget.spentPreviousMonth = 0;
		monthlySubcategoryBudget.paymentPreviousMonth = 0;
		monthlySubcategoryBudget.balancePreviousMonth = 0;
		
		if (baseMonthlySubcategoryBudget) {
			monthlySubcategoryBudget.budgetedPreviousMonth = baseMonthlySubcategoryBudget.budgeted;
			monthlySubcategoryBudget.spentPreviousMonth = (baseMonthlySubcategoryBudget.cashOutflows + baseMonthlySubcategoryBudget.creditOutflows);
			monthlySubcategoryBudget.paymentPreviousMonth = (baseMonthlySubcategoryBudget.cashOutflows + baseMonthlySubcategoryBudget.budgetedSpending);
			monthlySubcategoryBudget.balancePreviousMonth = baseMonthlySubcategoryBudget.balance;
		}
	}
}