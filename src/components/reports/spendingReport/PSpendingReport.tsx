/// <reference path="../../../_includes.ts" />

import * as _ from 'lodash';
import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { PSpendingTotals } from './PSpendingTotals';
import { PSpendingTrends } from './PSpendingTrends';
import { PSpendingInspector } from './PSpendingInspector';
import { DataFormatter, DateWithoutTime, SimpleObjectMap } from '../../../utilities';
import * as budgetEntities from '../../../interfaces/budgetEntities';
import { IEntitiesCollection, IReportState } from '../../../interfaces/state';
import { ISpendingReportItemData } from '../../../interfaces/reports';
import { SpendingReportTotalsData } from './SpendingReportTotalsData';
import { SpendingReportTrendsData } from './SpendingReportTrendsData';

export interface PSpendingReportProps {
	dataFormatter:DataFormatter;
	reportState:IReportState;
	entitiesCollection:IEntitiesCollection;
}

export interface PSpendingReportState {
	showingTotals:boolean;
	masterCategoryId:string;
	totalsData:SpendingReportTotalsData;
	trendsData:any;
}

const ReportsContainerStyle:React.CSSProperties = {
	flex: "1 1 auto",
	display: "flex",
	flexFlow: "row nowrap",
	width: "100%",
	height: "100%",
}

export class PSpendingReport extends React.Component<PSpendingReportProps, PSpendingReportState> {

	constructor(props:PSpendingReportProps) {
		super(props);
		this.state = {
			showingTotals: true,
			masterCategoryId: null,
			totalsData: null,
			trendsData: null
		}
	}

	private calculateTopLevelChartData():{totalsData:SpendingReportTotalsData, trendsData:SpendingReportTrendsData} {

		var totalsData = new SpendingReportTotalsData();
		var trendsData = new SpendingReportTrendsData();

		var subCategoriesArray = this.props.entitiesCollection.subCategories;
		var masterCategoriesArray = this.props.entitiesCollection.masterCategories;
		var transactionsArray = this.props.entitiesCollection.transactions;

		// In order to ascertain if a transaction should be included, we need maps for 
		// accounts and categories that contain true for those entities that are to be included.
		// We also need a map of masterCategoryId for each included subCategory
		var reportState = this.props.reportState;
		var accountInclusionMap:SimpleObjectMap<boolean> = {};
		var categoryInclusionMap:SimpleObjectMap<boolean> = {};
		var hiddenCategoryInclusionMap:SimpleObjectMap<boolean> = {};
		var subCategoryToMasterCategoryMap:SimpleObjectMap<budgetEntities.IMasterCategory> = {};
		var spendingReportItemDataMap:SimpleObjectMap<ISpendingReportItemData> = {};

		// Put a true in the above maps for included accounts and categories
		_.forEach(reportState.selectedAccountIds, (accountId)=>{
			accountInclusionMap[accountId] = true;
		});

		_.forEach(reportState.selectedCategoryIds, (subCategoryId)=>{
			let subCategory = subCategoriesArray.getEntityById(subCategoryId);
			categoryInclusionMap[subCategoryId] = true;
			if(!subCategoryToMasterCategoryMap[subCategoryId])
				subCategoryToMasterCategoryMap[subCategoryId] = masterCategoriesArray.getEntityById(subCategory.masterCategoryId);
		});

		_.forEach(subCategoriesArray.getHiddenSubCategories(), (subCategory)=>{
			hiddenCategoryInclusionMap[subCategory.entityId] = true;
		});

		var currentMonth = reportState.startDate.clone();
		var endMonth = reportState.endDate;

		while(currentMonth.isAfter(endMonth) == false) {

			var monthName = currentMonth.toISOString();
			var transactions = transactionsArray.getTransactionsByMonth(currentMonth);
			_.forEach(transactions, (transaction)=>{

				// Is the accountId for this transaction included?
				if(accountInclusionMap[transaction.accountId] == true) {

					var itemId, itemName:string;

					// If this is an uncategorized transaction, and the report settings include those
					if(!transaction.subCategoryId && reportState.uncategorizedTransactionsSelected) {

						// Add the amount of this transaction to the "uncategorized_transactions" item
						itemId = "uncategorized_transactions";
						itemName = "Uncategorized Transactions";
					}
					// If the category on this transaction is not hidden, and is included by the report setttings
					else if(categoryInclusionMap[transaction.subCategoryId] == true) {

						// Add the amount of this transaction to the item corresponding to master category of this subcategory
						var masterCategory = subCategoryToMasterCategoryMap[transaction.subCategoryId];
						itemId = masterCategory.entityId;
						itemName = masterCategory.name;
					}
					// If the category on this transaction is a hidden category, and the report settings include those
					else if(reportState.hiddenCategoriesSelected && hiddenCategoryInclusionMap[transaction.subCategoryId] == true) {

						// Add the amount of this transaction to the "hidden_categories" item
						itemId = "uncategorized_transactions";
						itemName = "Uncategorized Transactions";
					}

					var totalsItemData = totalsData.getSpendingReportItemData(itemId, itemName);
					var trendsItemData = trendsData.getSpendingReportItemData(itemId, itemName, monthName);
					totalsItemData.value += (-transaction.amount);
					trendsItemData.value += (-transaction.amount);
				}
			});

			currentMonth.addMonths(1);
		}

		return {totalsData, trendsData};
	}

	private calculateSecondLevelChartData():SimpleObjectMap<ISpendingReportItemData> {

		return null;
	}

	public render() {

		var reportData;
		var masterCategoryId = this.state.masterCategoryId;

		if(!masterCategoryId)
			reportData = this.calculateTopLevelChartData();

		if(this.state.showingTotals) {
			return (
				<div style={ReportsContainerStyle}>
					<PSpendingTotals 
						dataFormatter={this.props.dataFormatter}	
						reportState={this.props.reportState}
						masterCategoryId={masterCategoryId}
						totalsData={reportData.totalsData}
					/>
					<PSpendingInspector />
				</div>
			);
		}
		else {
			return (
				<div style={ReportsContainerStyle}>
					<PSpendingTrends />
					<PSpendingInspector />
				</div>
			);
		}
	}
}