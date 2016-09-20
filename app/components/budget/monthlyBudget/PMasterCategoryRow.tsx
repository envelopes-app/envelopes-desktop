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

export interface PMasterCategoryRowState {
	expanded:boolean;
	hoverState:boolean;
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

const GlyphStyle = {
	fontSize: "12px",
	cursor: 'pointer'
}

export class PMasterCategoryRow extends React.Component<PMasterCategoryRowProps, PMasterCategoryRowState> {

	constructor(props: any) {
        super(props);
		this.onGlyphClick = this.onGlyphClick.bind(this);
		this.handleMouseEnter = this.handleMouseEnter.bind(this);
		this.handleMouseLeave = this.handleMouseLeave.bind(this);
		this.state = {hoverState:false, expanded:true};
	}

	private handleMouseEnter() {
		var state = _.assign({}, this.state) as PMasterCategoryRowState;
		state.hoverState = true;
		this.setState(state);
	}

	private handleMouseLeave() {
		var state = _.assign({}, this.state) as PMasterCategoryRowState;
		state.hoverState = false;
		this.setState(state);
	}

	private onGlyphClick():void {
		var state = _.assign({}, this.state) as PMasterCategoryRowState;
		state.expanded = !state.expanded;
		this.setState(state);
	}

	public render() {

		var glyphiconClass, containerClass:string;
		var collapseContainerIdentity = "subCategoriesContainer_" + this.props.masterCategory.entityId;

		var budgeted = 0, activity = 0, balance = 0;
		_.forEach(this.props.monthlySubCategoryBudgets, (monthlySubCategoryBudget)=>{

			budgeted += monthlySubCategoryBudget.budgeted;
			activity += monthlySubCategoryBudget.cashOutflows + monthlySubCategoryBudget.creditOutflows;
			balance += monthlySubCategoryBudget.balance;
		});

		if(this.state.expanded == true) {
			glyphiconClass = "glyphicon glyphicon-triangle-bottom";
			containerClass = "collapse in";
		}
		else {
			glyphiconClass = "glyphicon glyphicon-triangle-right";
			containerClass = "collapse";
		}

    	return (
			<div>
				<div style={MasterCategoryRowContainerStyle} onMouseEnter={this.handleMouseEnter} onMouseLeave={this.handleMouseLeave}>
					<div style={SelectionColumnStyle}>
						<input type="checkbox" />
					</div>
					<span className={glyphiconClass} style={GlyphStyle} onClick={this.onGlyphClick}></span>
					<div style={CategoryLabelContainerStyle}>
						<label className="master-category-row-categoryname">{this.props.masterCategory.name}</label>
					</div>
					<div style={LabelContainerStyle}>
						<label className={this.state.hoverState ? "master-category-row-value-hover" : "master-category-row-value"}>{budgeted}</label>
					</div>
					<div style={LabelContainerStyle}>
						<label className={this.state.hoverState ? "master-category-row-value-hover" : "master-category-row-value"}>{activity}</label>
					</div>
					<div style={LabelContainerStyle}>
						<label className={this.state.hoverState ? "master-category-row-value-hover" : "master-category-row-value"}>{balance}</label>
					</div>
				</div>
				<div className={containerClass} id={collapseContainerIdentity}>
					{this.props.children}
				</div>
			</div>
		);
  	}
}