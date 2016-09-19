/// <reference path="../../../_includes.ts" />

import * as _ from 'lodash';
import * as React from 'react';
import * as ReactDOM from 'react-dom';

import * as budgetEntities from '../../../interfaces/budgetEntities';

export interface PMasterCategoryRowProps {
	masterCategory:budgetEntities.IMasterCategory;
	subCategories:Array<budgetEntities.ISubCategory>;
	monthlySubCategoryBudgets:Array<budgetEntities.IMonthlySubCategoryBudget>;
}

const MasterCategoryRowContainerStyle = {
	height: "25px",
	width: "100%",
	display: "flex",
	flexFlow: 'row nowrap',
	alignItems: "center",
	backgroundColor: "#E5F5F9",
	borderColor: "#DFE4E9",
	borderStyle: "solid",
	borderTopWidth: "0px",
	borderBottomWidth: "1px",
	borderRightWidth: "0px",
	borderLeftWidth: "0px"
}

const SelectionColumnStyle = {
	flex: "0 0 auto",
	width: "25px",
	paddingLeft: "8px"
}

const CategoryLabelContainerStyle = {
	flex: "1 1 auto",
	paddingLeft: "8px"
}

const LabelContainerStyle = {
	flex: "0 0 auto",
	width: "100px"
}

const LableStyle = {
	fontSize: "12px",
	fontWeight: "bold",
	color: "#4D717A",
	marginBottom: "0px"
}

export class PMasterCategoryRow extends React.Component<PMasterCategoryRowProps, {}> {

	public render() {

		var budgeted = 0, activity = 0, balance = 0;
		_.forEach(this.props.monthlySubCategoryBudgets, (monthlySubCategoryBudget)=>{

			budgeted += monthlySubCategoryBudget.budgeted;
			activity += monthlySubCategoryBudget.cashOutflows + monthlySubCategoryBudget.creditOutflows;
			balance += monthlySubCategoryBudget.balance;
		});

    	return (
			<div style={MasterCategoryRowContainerStyle}>
				<div style={SelectionColumnStyle}>
					<input type="checkbox" />
				</div>
				<div style={CategoryLabelContainerStyle}>
					<label style={LableStyle}>{this.props.masterCategory.name}</label>
				</div>
				<div style={LabelContainerStyle}>
					<label style={LableStyle}>{budgeted}</label>
				</div>
				<div style={LabelContainerStyle}>
					<label style={LableStyle}>{activity}</label>
				</div>
				<div style={LabelContainerStyle}>
					<label style={LableStyle}>{balance}</label>
				</div>
			</div>
		);
  	}

}