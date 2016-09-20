/// <reference path="../../../_includes.ts" />

import * as _ from 'lodash';
import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { SimpleObjectMap } from '../../../utilities';
import * as budgetEntities from '../../../interfaces/budgetEntities';

export interface PSubCategoryRowProps {
	subCategory:budgetEntities.ISubCategory;
	monthlySubCategoryBudget:budgetEntities.IMonthlySubCategoryBudget;
	selectedSubCategories:Array<string>;
	selectedSubCategoriesMap:SimpleObjectMap<boolean>;

	selectSubCategory:(subCategoryId:string, unselectAllOthers:boolean)=>void;
	unselectSubCategory:(subCategoryId:string)=>void;
}

export interface PSubCategoryRowState {
	expanded:boolean;
	hoverState:boolean;
}

const SubCategoryRowContainerStyle = {
	height: "31px",
	width: "100%",
	display: "flex",
	flexFlow: 'row nowrap',
	alignItems: "center",
	color: "#003440",
	backgroundColor: "#FFFFFF",
	borderColor: "#DFE4E9",
	borderStyle: "solid",
	borderTopWidth: "0px",
	borderBottomWidth: "1px",
	borderRightWidth: "0px",
	borderLeftWidth: "0px",
	paddingTop: "3px",
	paddingBottom: "3px"
}

const SelectionColumnStyle = {
	flex: "0 0 auto",
	width: "25px",
	paddingLeft: "8px"
}

const CategoryNameColumnStyle = {
	flex: "1 1 auto",
	paddingLeft: "20px"
}

const CategoryNameStyle = {
	fontSize: "14px",
	fontWeight: "normal",
	marginBottom: "0px"
}

const ValueColumnStyle = {
	flex: "0 0 auto",
	width: "100px",
	textAlign: "right",
	paddingRight: "8px"
}

const ValueColumnHoverStyle = {
	flex: "0 0 auto",
	width: "100px",
	textAlign: "right",
	paddingRight: "8px",
	borderStyle: "solid",
	borderWidth: "2px",
	borderRadius: "4px",
	borderColor: "#009CC2",
	backgroundColor: "#FFFFFF"
}

const ValueStyle = {
	fontSize: "14px",
	fontWeight: "normal",
	color: "#4D717A",
	marginBottom: "0px"
}

export class PSubCategoryRow extends React.Component<PSubCategoryRowProps, PSubCategoryRowState> {

	constructor(props: any) {
        super(props);
		this.onClick = this.onClick.bind(this);
		this.onCheckBoxSelectionChange = this.onCheckBoxSelectionChange.bind(this);
		this.handleMouseEnter = this.handleMouseEnter.bind(this);
		this.handleMouseLeave = this.handleMouseLeave.bind(this);
		this.state = {hoverState:false, expanded:true};
	}

	private onClick(event:React.MouseEvent):void {

		var subCategory = this.props.subCategory;
		var selectedSubCategoriesMap = this.props.selectedSubCategoriesMap;
		var isSelected = selectedSubCategoriesMap[subCategory.entityId];

		if(isSelected)
			this.props.unselectSubCategory(subCategory.entityId);
		else
			this.props.selectSubCategory(subCategory.entityId, true);
	}

	private onCheckBoxSelectionChange(event:React.SyntheticEvent):void {

		var subCategory = this.props.subCategory;
		var selectedSubCategoriesMap = this.props.selectedSubCategoriesMap;
		var isSelected = selectedSubCategoriesMap[subCategory.entityId];

		if(isSelected)
			this.props.unselectSubCategory(subCategory.entityId);
		else
			this.props.selectSubCategory(subCategory.entityId, false);
	}

	private handleMouseEnter() {
		var state = _.assign({}, this.state) as PSubCategoryRowState;
		state.hoverState = true;
		this.setState(state);
	}

	private handleMouseLeave() {
		var state = _.assign({}, this.state) as PSubCategoryRowState;
		state.hoverState = false;
		this.setState(state);
	}

	public render() {

		var monthlySubCategoryBudget = this.props.monthlySubCategoryBudget;
		var budgeted = monthlySubCategoryBudget.budgeted;
		var activity = monthlySubCategoryBudget.cashOutflows + monthlySubCategoryBudget.creditOutflows;
		var balance = monthlySubCategoryBudget.balance;

		var subCategory = this.props.subCategory;
		var selectedSubCategoriesMap = this.props.selectedSubCategoriesMap;
		var isSelected = selectedSubCategoriesMap[subCategory.entityId];

		var subCategoryRowContainerStyle = _.assign({}, SubCategoryRowContainerStyle);
		if(isSelected) {
			subCategoryRowContainerStyle["color"] = "#FFFFFF";
			subCategoryRowContainerStyle["backgroundColor"] = "#005A6E";
		}

    	return (
			<div style={subCategoryRowContainerStyle} onMouseEnter={this.handleMouseEnter} onMouseLeave={this.handleMouseLeave} 
					onClick={this.onClick}>
				<div style={SelectionColumnStyle}>
					<input type="checkbox" checked={isSelected} onChange={this.onCheckBoxSelectionChange} />
				</div>
				<div style={CategoryNameColumnStyle}>
					<label style={CategoryNameStyle}>{this.props.subCategory.name}</label>
				</div>
				<div style={this.state.hoverState ? ValueColumnHoverStyle : ValueColumnStyle}>
					<label style={ValueStyle}>{budgeted}</label>
				</div>
				<div style={ValueColumnStyle}>
					<label style={ValueStyle}>{activity}</label>
				</div>
				<div style={ValueColumnStyle}>
					<label style={ValueStyle}>{balance}</label>
				</div>
			</div>
		);
  	}
}
