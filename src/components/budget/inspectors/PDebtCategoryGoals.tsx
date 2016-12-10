/// <reference path="../../../_includes.ts" />

import * as _ from 'lodash';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { ControlLabel, FormGroup, FormControl, Glyphicon, ProgressBar, Radio } from 'react-bootstrap';

import { PLinkButton } from '../../common/PLinkButton';
import { SubCategoryGoalType } from '../../../constants';
import { DataFormatter, DateWithoutTime } from '../../../utilities';
import { IEntitiesCollection, ISimpleEntitiesCollection } from '../../../interfaces/state';
import * as budgetEntities from '../../../interfaces/budgetEntities';

export interface PDebtCategoryGoalsProps {
	dataFormatter:DataFormatter;
	subCategory:budgetEntities.ISubCategory;
	monthlySubCategoryBudget:budgetEntities.IMonthlySubCategoryBudget;
	// Dispatcher Functions
	updateEntities:(entities:ISimpleEntitiesCollection)=>void;
}

export interface PDebtCategoryGoalsState {
	showEditor:boolean;
	goalType:string;
	monthlyFunding:number;
	targetBalanceMonth:string;
	targetBalanceYear:string;
	monthlyFundingHasFocus:boolean;
}

const OrangeColor = "#E59100";
const GreenColor = "#16A336";

const GoalsContainerStyle:React.CSSProperties = {
	display: "flex",
	flexFlow: "column nowrap",
	justifyContent: "flex-start",
	width: "100%",
	paddingTop: "10px",
	paddingLeft: "10px",
	paddingRight: "10px"
}

const GoalTypeSelectionContainerStyle:React.CSSProperties = {
	flex: "0 0 auto",
	paddingLeft: "10px",
	paddingRight: "10px",
	paddingBottom: "10px"
}

const GoalTypeSelectionRadioStyle:React.CSSProperties = {
	marginTop: "5px",
	marginBottom: "5px",
	color: "#588697"
}

const FormControlStyle:React.CSSProperties = {
	borderColor: "#2FA2B5",
	borderWidth: "2px",
	borderRadius: "3px"
}

const MonthSelectionFormControlStyle:React.CSSProperties = Object.assign({}, FormControlStyle, {
	width: "65%"
});

const YearSelectionFormControlStyle:React.CSSProperties = Object.assign({}, FormControlStyle, {
	width: "32%"
});

export class PDebtCategoryGoals extends React.Component<PDebtCategoryGoalsProps, PDebtCategoryGoalsState> {

	constructor(props:PDebtCategoryGoalsProps) {
        super(props);
		this.handleCreateGoalClicked = this.handleCreateGoalClicked.bind(this);
		this.onGoalTypeSelectionChange = this.onGoalTypeSelectionChange.bind(this);
		this.onTargetBalanceMonthChange = this.onTargetBalanceMonthChange.bind(this);
		this.onTargetBalanceYearChange = this.onTargetBalanceYearChange.bind(this);
		this.onMonthlyFundingChange = this.onMonthlyFundingChange.bind(this);
		this.onMonthlyFundingFocus = this.onMonthlyFundingFocus.bind(this);
		this.onMonthlyFundingBlur = this.onMonthlyFundingBlur.bind(this);
		this.handleEditClicked = this.handleEditClicked.bind(this);
		this.handleDeleteClicked = this.handleDeleteClicked.bind(this);
		this.handleCancelClicked = this.handleCancelClicked.bind(this);
		this.handleOkClicked = this.handleOkClicked.bind(this);

		var currentMonth = DateWithoutTime.createForCurrentMonth();
		this.state = {
			showEditor: false,
			goalType: null,
			monthlyFunding: 0,
			targetBalanceMonth: currentMonth.getMonth().toString(),
			targetBalanceYear: currentMonth.getYear().toString(),
			monthlyFundingHasFocus: false
		};
	}

	public showEditor():void {

		// Get the SubCategory set the values for editor in the state
		var subCategory = this.props.subCategory;
		var targetBalanceMonth = subCategory.targetBalanceMonth ? DateWithoutTime.createFromISOString(subCategory.targetBalanceMonth) : DateWithoutTime.createForCurrentMonth();

		var state = Object.assign({}, this.state);
		state.showEditor = true;
		state.goalType = subCategory.goalType ? subCategory.goalType : SubCategoryGoalType.TargetBalanceOnDate;
		state.monthlyFunding = subCategory.monthlyFunding ? subCategory.monthlyFunding : 0;
		state.targetBalanceMonth = targetBalanceMonth.getMonth().toString();
		state.targetBalanceYear = targetBalanceMonth.getYear().toString();
		this.setState(state);
	}

	private handleCreateGoalClicked():void {
		// Switch to showing the editor
		this.showEditor();
	}

	private onGoalTypeSelectionChange(goalType:string):void {

		// Update the selectedGoalType value in the state
		var state = Object.assign({}, this.state);
		state.goalType = goalType;
		this.setState(state);
	}

	private onTargetBalanceMonthChange(event:React.FormEvent<any>):void {

		var value = (event.target as HTMLInputElement).value;
		var state = Object.assign({}, this.state);
		state.targetBalanceMonth = value;
		this.setState(state);
	}

	private onTargetBalanceYearChange(event:React.FormEvent<any>):void {

		var value = (event.target as HTMLInputElement).value;
		var state = Object.assign({}, this.state);
		state.targetBalanceYear = value;
		this.setState(state);
	}

	private onMonthlyFundingChange(event:React.FormEvent<any>):void {

		var state = Object.assign({}, this.state);
		state.monthlyFunding = this.props.dataFormatter.unformatCurrency((event.target as HTMLInputElement).value);
		this.setState(state);
	}

	private onMonthlyFundingFocus(event:React.FocusEvent<any>):void {

		var state = Object.assign({}, this.state);
		state.monthlyFundingHasFocus = true;
		this.setState(state);
	}

	private onMonthlyFundingBlur(event:React.FocusEvent<any>):void {

		var state = Object.assign({}, this.state);
		state.monthlyFundingHasFocus = false;
		this.setState(state);
	}

	private handleEditClicked(event:React.MouseEvent<any>):void {
		// Switching to show the editor
		this.showEditor();
	}

	private handleDeleteClicked(event:React.MouseEvent<any>):void {

		// Update the state to hide the goal editor
		var state = Object.assign({}, this.state);
		state.showEditor = false;
		this.setState(state);

		// Get the subcategory entity
		var subCategory = this.props.subCategory;
		// We are going to nul out all the goal related values from the subcategory if they exist
		if(subCategory.goalType) {

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
	}

	private handleCancelClicked(event:React.MouseEvent<any>):void {

		// Update the state to hide the goal editor
		var state = Object.assign({}, this.state);
		state.showEditor = false;
		this.setState(state);
	}

	private handleOkClicked(event:React.MouseEvent<any>):void {

		// Update the state to hide the goal editor
		var state = Object.assign({}, this.state);
		state.showEditor = false;
		this.setState(state);

		// Get the subcategory entity
		var subCategory = this.props.subCategory;
		var monthlySubCategoryBudget = this.props.monthlySubCategoryBudget;
		// We are going to update all the goal related values in the subcategory
		var subCategoryClone = Object.assign({}, subCategory);
		subCategoryClone.goalType = this.state.goalType;
		subCategoryClone.goalCreationMonth = monthlySubCategoryBudget.month;

		if(this.state.goalType == SubCategoryGoalType.MonthlyFunding) {
			subCategoryClone.monthlyFunding = this.state.monthlyFunding;
		}
		else {
			subCategoryClone.monthlyFunding = null;
		}

		if(this.state.goalType == SubCategoryGoalType.TargetBalanceOnDate) {
			// Unlike the Default Category Goals, the target balance for Debt Categories is always zero.
			subCategoryClone.targetBalance = 0;
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

	private getGoalsHeader(subCategory:budgetEntities.ISubCategory):JSX.Element {

		var goalsHeader:JSX.Element;

		// Only show the edit link in the header if we have a goal defined, and we are 
		// not currently showing the editor.
		if(subCategory.goalType && this.state.showEditor == false) {
			goalsHeader = (
				<div className="inspector-section-header">
					<span>GOALS</span>
					<PLinkButton text="Edit" enabled={true} clickHandler={this.handleEditClicked} />
				</div>
			);
		}
		else {
			goalsHeader = (
				<div className="inspector-section-header">
					GOALS
				</div>
			);
		}

		return goalsHeader;
	}
	
	private getGoalEditorForTargetBalanceOnDate():JSX.Element {

		var yearOptions:Array<JSX.Element> = [];
		var currentMonth = DateWithoutTime.createForCurrentMonth();
		for(var i = currentMonth.getYear(), j = 0; j < 20; i++,j++) {
			var option = <option key={j} value={i}>{i.toString()}</option>;
			yearOptions.push(option);
		}

		return (
			<div>
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
	
	private getGoalEditorForMonthlyFunding():JSX.Element {

		var dataFormatter = this.props.dataFormatter;
		var monthlySubCategoryBudget = this.props.monthlySubCategoryBudget;
		var monthlyFunding = dataFormatter.formatCurrency(this.state.monthlyFunding, this.state.monthlyFundingHasFocus);

		return (
			<div>
				<FormGroup key="formgroup">
					<ControlLabel>Target Budgeted Amount:</ControlLabel>
					<FormControl type="text" componentClass="input" style={FormControlStyle} 
						value={monthlyFunding} onChange={this.onMonthlyFundingChange}
						onFocus={this.onMonthlyFundingFocus} onBlur={this.onMonthlyFundingBlur}
					/>
				</FormGroup>
			</div>
		);
	}

	private getGoalViewerForTargetBalanceOnDate():JSX.Element {

		return null;
	}

	private getGoalViewerForMonthlyFunding():JSX.Element {

		return null;
	}

	public componentWillReceiveProps(nextProps:PDebtCategoryGoalsProps):void {

		// If the subCategory or the monthlySubCategoryBudget entity changes, update the values in the state.
		if(this.props.subCategory !== nextProps.subCategory || this.props.monthlySubCategoryBudget != nextProps.monthlySubCategoryBudget) {
			var state = Object.assign({}, this.state);
			state.showEditor = false;
			this.setState(state);
		}
	} 

	public render() {

		// Get the subcategory entity
		var subCategory = this.props.subCategory;
		var monthlySubCategoryBudget = this.props.monthlySubCategoryBudget;
		var header = this.getGoalsHeader(subCategory);

		if(this.state.showEditor == false) {

			// If a goal has not yet been created for the subcategory, then just show the create goal button.
			if(!subCategory.goalType) {
				return (
					<div style={GoalsContainerStyle}>
						{header}
						<PLinkButton 
							text="Create a goal" glyphNames={["glyphicon-plus-sign"]} 
							enabled={true} clickHandler={this.handleCreateGoalClicked} 
						/>
					</div>
				);
			}
			else {
				// Show the goal progress
				// Note: When viewing goals, use values directly from the entities in the props.
				var viewer:JSX.Element;
				if(subCategory.goalType == SubCategoryGoalType.TargetBalanceOnDate)
					viewer = this.getGoalViewerForTargetBalanceOnDate();
				else
					viewer = this.getGoalViewerForMonthlyFunding();
				
				return (
					<div style={GoalsContainerStyle}>
						{header}
						{viewer}
					</div>
				);
			}
		}
		else {
			// Show the Goals Editor
			// Use values from the state when editing instead of from the entities in the props.
			var editor:JSX.Element;
			if(this.state.goalType == SubCategoryGoalType.TargetBalanceOnDate)
				editor = this.getGoalEditorForTargetBalanceOnDate();
			else
				editor = this.getGoalEditorForMonthlyFunding();

			return (
				<div style={GoalsContainerStyle}>
					{header}
					<div style={GoalTypeSelectionContainerStyle}>
						<Radio checked={this.state.goalType == SubCategoryGoalType.TargetBalanceOnDate} onChange={this.onGoalTypeSelectionChange.bind(this, "TBD")} style={GoalTypeSelectionRadioStyle}>Pay Off Balance by Date</Radio>
						<Radio checked={this.state.goalType == SubCategoryGoalType.MonthlyFunding} onChange={this.onGoalTypeSelectionChange.bind(this, "MF")} style={GoalTypeSelectionRadioStyle}>Pay Specific Amount Each Month</Radio>
					</div>
					<hr className="inspector-horizontal-rule" />
					{editor}
					<hr className="inspector-horizontal-rule" />
					<div className="buttons-container">
						<PLinkButton text="Delete" enabled={true} clickHandler={this.handleDeleteClicked} />
						<div style={{width:"8px"}} />
						<PLinkButton text="Cancel" enabled={true} clickHandler={this.handleCancelClicked} />
						<div className="spacer" />
						<button className="dialog-primary-button" onClick={this.handleOkClicked}>
							OK&nbsp;<Glyphicon glyph="ok-circle"/>
						</button>
					</div>
				</div>
			);
		}
	}
}