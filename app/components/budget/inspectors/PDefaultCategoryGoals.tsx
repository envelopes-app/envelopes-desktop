/// <reference path="../../../_includes.ts" />

import * as _ from 'lodash';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Button, Col, ControlLabel, FormGroup, FormControl, Glyphicon, ProgressBar, Radio } from 'react-bootstrap';

import { PLinkButton } from '../../common/PLinkButton';
import { SubCategoryGoalType } from '../../../constants';
import { DateWithoutTime } from '../../../utilities';
import { IEntitiesCollection, ISimpleEntitiesCollection } from '../../../interfaces/state';
import * as budgetEntities from '../../../interfaces/budgetEntities';

export interface PDefaultCategoryGoalsProps {
	subCategoryId:string;
	currentMonth:DateWithoutTime;
	entitiesCollection:IEntitiesCollection;
	// Dispatcher Functions
	updateEntities:(entities:ISimpleEntitiesCollection)=>void;
}

export interface PDefaultCategoryGoalsState {
	showEditor:boolean;
	goalType:string;
	monthlyFunding:string;
	targetBalance:string;
	targetBalanceMonth:string;
	targetBalanceYear:string;
}

const GoalsContainerStyle = {
	display: "flex",
	flexFlow: "column nowrap",
	justifyContent: "flex-start",
	width: "100%",
	paddingTop: "10px",
	paddingLeft: "10px",
	paddingRight: "10px"
}

const GoalTypeSelectionContainerStyle = {
	flex: "0 0 auto",
	paddingLeft: "10px",
	paddingRight: "10px"
}

const GoalTypeSelectionRadioStyle = {
	marginTop: "5px",
	marginBottom: "5px",
	color: "#588697"
}

const HRStyle = {
	width: "100%",
	marginTop: "10px",
	marginBottom: "10px",
	borderTop: "1px dotted #588697"
}

const FormControlStyle = {
	borderColor: "#2FA2B5",
	borderWidth: "2px",
	borderRadius: "3px"
}

const MonthSelectionFormControlStyle = Object.assign({}, FormControlStyle, {
	width: "65%"
});

const YearSelectionFormControlStyle = Object.assign({}, FormControlStyle, {
	width: "32%"
});

const ButtonsContainerStyle = {
	display: "flex",
	flexFlow: "row nowrap",	
	alignItems: "center",
	width: "100%",
	justifyContent: "space-between"
}

const ButtonStyle = {
	flex: "0 0 auto",
	fontSize:"14px",
	paddingLeft: "6px",
	paddingRight: "6px",
}

const SpacerStyle = {
	flex: "1 1 auto"
}

const OkButtonStyle = {
	flex: "0 0 auto",
	fontSize:"14px",
	marginLeft: "10px"
}

export class PDefaultCategoryGoals extends React.Component<PDefaultCategoryGoalsProps, PDefaultCategoryGoalsState> {

	constructor(props:any) {
        super(props);
		this.handleCreateGoalClicked = this.handleCreateGoalClicked.bind(this);
		this.handleGoalTypeSelectionChange = this.handleGoalTypeSelectionChange.bind(this);
		this.onTargetBalanceChange = this.onTargetBalanceChange.bind(this);
		this.onTargetBalanceMonthChange = this.onTargetBalanceMonthChange.bind(this);
		this.onTargetBalanceYearChange = this.onTargetBalanceYearChange.bind(this);
		this.onMonthlyFundingChange = this.onMonthlyFundingChange.bind(this);
		this.handleDeleteClicked = this.handleDeleteClicked.bind(this);
		this.handleCancelClicked = this.handleCancelClicked.bind(this);
		this.handleOkClicked = this.handleOkClicked.bind(this);

		var currentMonth = DateWithoutTime.createForCurrentMonth();
		this.state = {
			showEditor: false,
			goalType: SubCategoryGoalType.TargetBalance,
			monthlyFunding: "",
			targetBalance: "",
			targetBalanceMonth: currentMonth.getMonth().toString(),
			targetBalanceYear: currentMonth.getYear().toString()
		};
	}

	public showEditor():void {

		// Get the SubCategory set the values for editor in the state
		var currentMonth = this.props.currentMonth;
		var subCategoryId = this.props.subCategoryId;
		var entitiesCollection = this.props.entitiesCollection;
		var subCategory = entitiesCollection.subCategories.getEntityById(subCategoryId);
		var targetBalanceMonth = subCategory.targetBalanceMonth ? DateWithoutTime.createFromISOString(subCategory.targetBalanceMonth) : DateWithoutTime.createForCurrentMonth();

		var state = Object.assign({}, this.state);
		state.showEditor = true;
		state.goalType = subCategory.goalType ? subCategory.goalType : SubCategoryGoalType.TargetBalance;
		state.monthlyFunding = subCategory.monthlyFunding ? subCategory.monthlyFunding.toString() : "";
		state.targetBalance = subCategory.targetBalance ? subCategory.targetBalance.toString() : "";
		state.targetBalanceMonth = targetBalanceMonth.getMonth().toString();
		state.targetBalanceYear = targetBalanceMonth.getYear().toString();
		this.setState(state);
	}

	private handleCreateGoalClicked():void {
		// Switch to showing the editor
		this.showEditor();
	}

	private handleGoalTypeSelectionChange(goalType:string):void {

		// Update the selectedGoalType value in the state
		var state = Object.assign({}, this.state);
		state.goalType = goalType;
		this.setState(state);
	}

	private onTargetBalanceChange(event:React.SyntheticEvent):void {

		var updatedValue = this.state.targetBalance;
		var target = event.target as HTMLInputElement;
		if(target.value == "")
			updatedValue = "";
		else {
			var parsedValue = Number.parseInt(target.value);
			if(!isNaN(parsedValue))
				updatedValue = parsedValue.toString();
		}

		var state = Object.assign({}, this.state);
		state.targetBalance = updatedValue;
		this.setState(state);
	}

	private onTargetBalanceMonthChange(event:React.SyntheticEvent):void {

		var value = (event.target as HTMLInputElement).value;
		var state = Object.assign({}, this.state);
		state.targetBalanceMonth = value;
		this.setState(state);
	}

	private onTargetBalanceYearChange(event:React.SyntheticEvent):void {

		var value = (event.target as HTMLInputElement).value;
		var state = Object.assign({}, this.state);
		state.targetBalanceYear = value;
		this.setState(state);
	}

	private onMonthlyFundingChange(event:React.SyntheticEvent):void {

		var updatedValue = this.state.monthlyFunding;
		var target = event.target as HTMLInputElement;
		if(target.value == "")
			updatedValue = "";
		else {
			var parsedValue = Number.parseInt(target.value);
			if(!isNaN(parsedValue))
				updatedValue = parsedValue.toString();
		}

		var state = Object.assign({}, this.state);
		state.monthlyFunding = updatedValue;
		this.setState(state);
	}

	private handleDeleteClicked(event:React.MouseEvent):void {

		// Update the state to hide the goal editor
		var state = Object.assign({}, this.state);
		state.showEditor = false;
		this.setState(state);

		// Get the subcategory entity
		var subCategoryId = this.props.subCategoryId;
		var entitiesCollection = this.props.entitiesCollection;
		var subCategory = entitiesCollection.subCategories.getEntityById(subCategoryId);
		// We are going to nul out all the goal related values from the subcategory
		var subCategoryClone = Object.assign({}, subCategory);
		subCategoryClone.goalType = null;
		subCategoryClone.goalCreationMonth = null;
		subCategoryClone.monthlyFunding = null;
		subCategoryClone.targetBalance = null;
		subCategoryClone.targetBalanceMonth = null;
		
		this.props.updateEntities({
			subCategories: [subCategoryClone]
		});
	}

	private handleCancelClicked(event:React.MouseEvent):void {

		// Update the state to hide the goal editor
		var state = Object.assign({}, this.state);
		state.showEditor = false;
		this.setState(state);
	}

	private handleOkClicked(event:React.MouseEvent):void {

		// Update the state to hide the goal editor
		var state = Object.assign({}, this.state);
		state.showEditor = false;
		this.setState(state);

		// Get the subcategory entity
		var subCategoryId = this.props.subCategoryId;
		var entitiesCollection = this.props.entitiesCollection;
		var subCategory = entitiesCollection.subCategories.getEntityById(subCategoryId);
		// We are going to update all the goal related values in the subcategory
		var subCategoryClone = Object.assign({}, subCategory);
		subCategoryClone.goalType = this.state.goalType;
		subCategoryClone.goalCreationMonth = DateWithoutTime.createForCurrentMonth().toISOString();

		if(this.state.goalType == SubCategoryGoalType.MonthlyFunding) {
			subCategoryClone.monthlyFunding = this.state.monthlyFunding ? Number.parseInt(this.state.monthlyFunding) : 0;
		}
		else {
			subCategoryClone.monthlyFunding = null;
		}

		if(this.state.goalType == SubCategoryGoalType.TargetBalance || 
			this.state.goalType == SubCategoryGoalType.TargetBalanceOnDate) {
			subCategoryClone.targetBalance = this.state.targetBalance ? Number.parseInt(this.state.targetBalance) : 0;
		}
		else {
			subCategoryClone.targetBalance = null;
		}

		if(this.state.goalType == SubCategoryGoalType.TargetBalanceOnDate) {
			var month = Number.parseInt(this.state.targetBalanceMonth);
			var year = Number.parseInt(this.state.targetBalanceYear);
			var date = DateWithoutTime.createForCurrentMonth().setYear(year).setMonth(month);
			subCategoryClone.targetBalanceMonth = date.toISOString();
		}
		else {
			subCategoryClone.targetBalanceMonth = null;
		}

		this.props.updateEntities({
			subCategories: [subCategoryClone]
		});

	}
	
	private getGoalValuesContainerForTargetBalance():JSX.Element {

		return (
			<div>
				<FormGroup key="formgroup">
					<ControlLabel>Target Balance:</ControlLabel>
					<FormControl type="text" componentClass="input" style={FormControlStyle} 
						value={this.state.targetBalance} onChange={this.onTargetBalanceChange}
					/>
				</FormGroup>
			</div>
		);
	}
	
	private getGoalValuesContainerForTargetBalanceOnDate():JSX.Element {

		var yearOptions:Array<JSX.Element> = [];
		var currentMonth = DateWithoutTime.createForCurrentMonth();
		for(var i = currentMonth.getYear(), j = 0; j < 20; i++,j++) {
			var option = <option key={j} value={i}>{i.toString()}</option>;
			yearOptions.push(option);
		}

		return (
			<div>
				<FormGroup>
					<ControlLabel>Target Balance:</ControlLabel>
					<FormControl type="text" componentClass="input" style={FormControlStyle} 
						value={this.state.targetBalance} onChange={this.onTargetBalanceChange}
					/>
				</FormGroup>
				<FormGroup>
					<ControlLabel>Target Month & Year:</ControlLabel>
					<div style={{ display:"flex", flexFlow:"row nowrap", justifyContent:"space-between"}}>
						<FormControl type="text" componentClass="select" style={MonthSelectionFormControlStyle} 
							value={this.state.targetBalanceMonth} onChange={this.onTargetBalanceMonthChange}>
							<option value="0">January</option>
							<option value="1">February</option>
							<option value="2">March</option>
							<option value="3">April</option>
							<option value="4">May</option>
							<option value="5">June</option>
							<option value="6">July</option>
							<option value="7">August</option>
							<option value="8">September</option>
							<option value="9">October</option>
							<option value="10">November</option>
							<option value="11">December</option>
						</FormControl>
						<FormControl type="text" componentClass="select" style={YearSelectionFormControlStyle} 
							value={this.state.targetBalanceYear} onChange={this.onTargetBalanceYearChange}>
							{yearOptions}
						</FormControl>
					</div>
				</FormGroup>
			</div>
		);
	}
	
	private getGoalValuesContainerForMonthlyFunding():JSX.Element {

		return (
			<div>
				<FormGroup key="formgroup">
					<ControlLabel>Target Budgeted Amount:</ControlLabel>
					<FormControl type="text" componentClass="input" style={FormControlStyle} 
						value={this.state.targetBalance} onChange={this.onMonthlyFundingChange}
					/>
				</FormGroup>
			</div>
		);
	}

	public render() {

		// Get the subcategory entity
		var currentMonth = this.props.currentMonth;
		var subCategoryId = this.props.subCategoryId;
		var entitiesCollection = this.props.entitiesCollection;
		var subCategory = entitiesCollection.subCategories.getEntityById(subCategoryId);

		if(this.state.showEditor == false) {

			// If a goal has not yet been created for the subcategory, then just show the create goal button.
			if(!subCategory.goalType) {
				return (
					<div style={GoalsContainerStyle}>
						<PLinkButton 
							text="Create a goal" glyphName="glyphicon-plus-sign" 
							clickHandler={this.handleCreateGoalClicked} 
						/>
					</div>
				);
			}
			else {
				// Get the monthlySubCategoryBudget to display the goal progress.
				var monthlySubCategoryBudget = entitiesCollection.monthlySubCategoryBudgets.getMonthlySubCategoryBudgetsForSubCategoryInMonth(subCategoryId, currentMonth.toISOString());
				var target = monthlySubCategoryBudget.goalTarget;
				var completed = monthlySubCategoryBudget.goalOverallFunded;
				var percentageCompleted = Math.round(completed / target * 100); 
				return (
					<div style={GoalsContainerStyle}>
						<ProgressBar now={percentageCompleted} />
					</div>
				);
			}
		}
		else {
			// Show the Goals Editor
			var editor:JSX.Element;
			if(this.state.goalType == SubCategoryGoalType.TargetBalance)
				editor = this.getGoalValuesContainerForTargetBalance();
			else if(this.state.goalType == SubCategoryGoalType.TargetBalanceOnDate)
				editor = this.getGoalValuesContainerForTargetBalanceOnDate();
			else
				editor = this.getGoalValuesContainerForMonthlyFunding();

			return (
				<div style={GoalsContainerStyle}>
					<div style={GoalTypeSelectionContainerStyle}>
						<Radio checked={this.state.goalType == SubCategoryGoalType.TargetBalance} onChange={this.handleGoalTypeSelectionChange.bind(this, "TB")} style={GoalTypeSelectionRadioStyle}>Target Category Balance</Radio>
						<Radio checked={this.state.goalType == SubCategoryGoalType.TargetBalanceOnDate} onChange={this.handleGoalTypeSelectionChange.bind(this, "TBD")} style={GoalTypeSelectionRadioStyle}>Target Category Balance by Date</Radio>
						<Radio checked={this.state.goalType == SubCategoryGoalType.MonthlyFunding} onChange={this.handleGoalTypeSelectionChange.bind(this, "MF")} style={GoalTypeSelectionRadioStyle}>Monthly Funding Goal</Radio>
					</div>
					<hr style={HRStyle} />
					{editor}
					<hr style={HRStyle} />
					<div style={ButtonsContainerStyle}>
						<PLinkButton text="Delete" clickHandler={this.handleDeleteClicked} />
						<PLinkButton text="Cancel" clickHandler={this.handleCancelClicked} />
						<div style={SpacerStyle} />
						<Button className="dialog-primary-button" style={OkButtonStyle} onClick={this.handleOkClicked}>
							OK&nbsp;<Glyphicon glyph="ok-circle"/>
						</Button>
					</div>
				</div>
			);
		}
	}
}