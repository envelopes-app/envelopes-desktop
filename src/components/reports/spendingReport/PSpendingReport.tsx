/// <reference path="../../../_includes.ts" />

import * as _ from 'lodash';
import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { PSpendingReportHeader } from './PSpendingReportHeader';
import { PSpendingTotals } from './PSpendingTotals';
import { PSpendingTrends } from './PSpendingTrends';
import { PSpendingInspector } from './PSpendingInspector';
import { PSpendingActivityDialog } from '../dialogs/PSpendingActivityDialog';

import { DataFormatter, DateWithoutTime, SimpleObjectMap } from '../../../utilities';
import * as budgetEntities from '../../../interfaces/budgetEntities';
import { IEntitiesCollection, IReportState } from '../../../interfaces/state';
import { ISpendingReportItemData } from '../../../interfaces/reports';
import { ITransaction } from '../../../interfaces/budgetEntities';
import { SpendingReportData } from './SpendingReportData';

export interface PSpendingReportProps {
	dataFormatter:DataFormatter;
	reportState:IReportState;
	entitiesCollection:IEntitiesCollection;
}

export interface PSpendingReportState {
	showingTotals:boolean;
	masterCategoryId:string;
	reportData:SpendingReportData;
}

const ReportsContainerStyle:React.CSSProperties = {
	flex: "1 1 auto",
	display: "flex",
	flexFlow: "row nowrap",
	width: "100%",
	height: "100%",
}

const ReportsInnerContainerStyle:React.CSSProperties = {
	flex: "1 1 auto",
	display: "flex",
	flexFlow: "column nowrap",
	width: "100%",
	height: "100%",
}

export class PSpendingReport extends React.Component<PSpendingReportProps, PSpendingReportState> {

	private spendingActivityDialog:PSpendingActivityDialog;

	constructor(props:PSpendingReportProps) {
		super(props);
		this.setReportView = this.setReportView.bind(this);
		this.showSpendingActivityDialog = this.showSpendingActivityDialog.bind(this);
		this.state = {
			showingTotals: true,
			masterCategoryId: null,
			reportData: this.calculateTopLevelChartData()
		}
	}

	private setReportView(showTotals:boolean):void {
		var state = Object.assign({}, this.state);
		state.showingTotals = showTotals;
		this.setState(state);
	}

	private setMasterCategoryId(masterCategoryId:string):void {
		var state = Object.assign({}, this.state);
		state.masterCategoryId = masterCategoryId;
		this.setState(state);
	}

	private showSpendingActivityDialog(itemId:string, itemName:string, element:HTMLElement, placement:string = "left"):void {

		// Get the transactions for this item from the report data and pass them to the spending activity dialog
		var transactions:Array<ITransaction> = this.state.reportData.getTransactionsForItem(itemId);
		this.spendingActivityDialog.show(itemName, transactions, element, placement);
	}

	private calculateTopLevelChartData():SpendingReportData {

		var accountsArray = this.props.entitiesCollection.accounts;
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

		var reportData = new SpendingReportData(reportState.startDate, reportState.endDate);

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

						var useTransaction = true;
						// Make sure this is not a transfer between budget accounts 
						// (those are not considered uncategorized transactions) 
						if(transaction.transferAccountId) {
							var account = accountsArray.getEntityById(transaction.accountId);
							var transferAccount = accountsArray.getEntityById(transaction.transferAccountId);
							if(account.onBudget == 1 && transferAccount.onBudget == 1)
								useTransaction = false;
						}

						if(useTransaction == true) {
							// Add the amount of this transaction to the "uncategorized_transactions" item
							itemId = "uncategorized_transactions";
							itemName = "Uncategorized Transactions";
						}
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
						itemId = "hidden_categories";
						itemName = "Hidden Categories";
					}

					if(itemId) {

						if(itemId == "d473314a-2cb5-4be8-9ae9-5e2d04efa46a")
							debugger;
							
						var overallItemData = reportData.getOverallItemData(itemId, itemName);
						overallItemData.value += (-transaction.amount);
						var monthlyItemData = reportData.getMonthlyItemData(itemId, itemName, monthName);
						monthlyItemData.value += (-transaction.amount);

						// Also save a reference to this transaction against the itemId. We would be able to use
						// it later if we want to look at spending transactions for a particular item through the
						// spending activity dialog
						reportData.setTransactionReferenceForItem(itemId, transaction);
					}
				}
			});

			currentMonth.addMonths(1);
		}

		reportData.prepareDataForPresentation();
		return reportData;
	}

	private calculateSecondLevelChartData():SpendingReportData {

		return null;
	}

	public componentWillReceiveProps(nextProps:PSpendingReportProps):void {

		var reportData:SpendingReportData;
		if(!this.state.masterCategoryId)
			reportData = this.calculateTopLevelChartData();
		else
			reportData = this.calculateSecondLevelChartData();

		var state = Object.assign({}, this.state);
		state.reportData = reportData;
		this.setState(state);
	}

	public render() {

		var reportData = this.state.reportData;
		var masterCategoryId = this.state.masterCategoryId;
		var reportView:JSX.Element;

		if(this.state.showingTotals) {
			reportView = (
				<PSpendingTotals 
					dataFormatter={this.props.dataFormatter}	
					reportState={this.props.reportState}
					masterCategoryId={masterCategoryId}
					reportData={reportData}
				/>
			);
		}
		else {
			reportView = (
				<PSpendingTrends 
					dataFormatter={this.props.dataFormatter}	
					reportState={this.props.reportState}
					masterCategoryId={masterCategoryId}
					reportData={reportData}
				/>
			);
		}

		return (
			<div style={ReportsContainerStyle}>
				<div style={ReportsInnerContainerStyle}>
					<PSpendingReportHeader
						reportState={this.props.reportState}
						showingTotals={this.state.showingTotals}
						setReportView={this.setReportView}
					/>
					{reportView}
				</div>
				<PSpendingInspector 
					dataFormatter={this.props.dataFormatter}	
					reportState={this.props.reportState}
					reportData={reportData}
					showSpendingActivityDialog={this.showSpendingActivityDialog}
				/>

				<PSpendingActivityDialog
					ref={(d)=> this.spendingActivityDialog = d }
					dataFormatter={this.props.dataFormatter}
					entitiesCollection={this.props.entitiesCollection}
				/>
			</div>
		);
		
	}
}