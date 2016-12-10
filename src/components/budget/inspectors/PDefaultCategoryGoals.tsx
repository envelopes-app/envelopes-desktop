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

export interface PDefaultCategoryGoalsProps {
	dataFormatter:DataFormatter;
	subCategory:budgetEntities.ISubCategory;
	monthlySubCategoryBudget:budgetEntities.IMonthlySubCategoryBudget;
	// Dispatcher Functions
	updateEntities:(entities:ISimpleEntitiesCollection)=>void;
}

export interface PDefaultCategoryGoalsState {
	showEditor:boolean;
	goalType:string;
	monthlyFunding:number;
	targetBalance:number;
	targetBalanceMonth:string;
	targetBalanceYear:string;
	targetBalanceHasFocus:boolean;
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

const ProgressViewContainerStyle:React.CSSProperties = {
	display: "flex",
	flexFlow: "column nowrap",
	justifyContent: "flex-start",
	width: "100%",
}

const ProgressBarStyle:React.CSSProperties = {
	height: "10px",
	marginBottom: "10px",
	backgroundColor: "#FFFFFF"
}

const ProgressPercentageLabelStyle:React.CSSProperties = {
	fontSize: "20px",
	color: "#003440",
	width: "100%",
	textAlign: "center",
	marginTop: "10px",
	marginBottom: "10px"
}

const ProgressPercentageGreenLabelStyle:React.CSSProperties = Object.assign({}, ProgressPercentageLabelStyle, {
	color: GreenColor
});

const ProgressPercentageOrangeLabelStyle:React.CSSProperties = Object.assign({}, ProgressPercentageLabelStyle, {
	color: OrangeColor
});

const ProgressSummaryContainerStyle:React.CSSProperties = {
	display: "flex",
	flexFlow: "row nowrap",
	justifyContent: "space-between",
	width: "100%",
	marginBottom: "10px"
}

const ProgressSummaryLeftItemsStyle:React.CSSProperties = {
	display: "flex",
	flexFlow: "column nowrap",
	alignItems: "flex-start",
}

const ProgressSummaryLeftItemLabelStyle:React.CSSProperties = {
	fontSize: "14px",
	fontStyle: "italic",
	fontWeight: "normal",
	color: "#003440",
	width: "100%",
	textAlign: "left",
	marginBottom: "0px"
}

const ProgressSummaryLeftItemValueStyle:React.CSSProperties = Object.assign({}, ProgressSummaryLeftItemLabelStyle, {
	fontWeight: "bold"
});

const ProgressSummaryRightItemsStyle:React.CSSProperties = {
	display: "flex",
	flexFlow: "column nowrap",
	alignItems: "flex-end",
}

const ProgressSummaryRightItemLabelStyle:React.CSSProperties = {
	fontSize: "14px",
	fontStyle: "italic",
	fontWeight: "normal",
	color: "#003440",
	width: "100%",
	textAlign: "right",
	marginBottom: "0px"
}

const ProgressSummaryRightItemValueStyle:React.CSSProperties = Object.assign({}, ProgressSummaryRightItemLabelStyle, {
	fontWeight: "bold"
});

const ProgressMessageStyle:React.CSSProperties = {
	fontSize: "14px",
	fontStyle: "italic",
	fontWeight: "normal",
	color: "#003440",
	width: "100%",
	textAlign: "left"
}

export class PDefaultCategoryGoals extends React.Component<PDefaultCategoryGoalsProps, PDefaultCategoryGoalsState> {

	constructor(props:PDefaultCategoryGoalsProps) {
        super(props);
		this.handleCreateGoalClicked = this.handleCreateGoalClicked.bind(this);
		this.onGoalTypeSelectionChange = this.onGoalTypeSelectionChange.bind(this);
		this.onTargetBalanceChange = this.onTargetBalanceChange.bind(this);
		this.onTargetBalanceFocus = this.onTargetBalanceFocus.bind(this);
		this.onTargetBalanceBlur = this.onTargetBalanceBlur.bind(this);
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
			targetBalance: 0,
			targetBalanceMonth: currentMonth.getMonth().toString(),
			targetBalanceYear: currentMonth.getYear().toString(),
			targetBalanceHasFocus: false,
			monthlyFundingHasFocus: false
		};
	}

	public showEditor():void {

		// Get the SubCategory set the values for editor in the state
		var subCategory = this.props.subCategory;
		var targetBalanceMonth = subCategory.targetBalanceMonth ? DateWithoutTime.createFromISOString(subCategory.targetBalanceMonth) : DateWithoutTime.createForCurrentMonth();

		var state = Object.assign({}, this.state);
		state.showEditor = true;
		state.goalType = subCategory.goalType ? subCategory.goalType : SubCategoryGoalType.TargetBalance;
		state.monthlyFunding = subCategory.monthlyFunding ? subCategory.monthlyFunding : 0;
		state.targetBalance = subCategory.targetBalance ? subCategory.targetBalance : 0;
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

	private onTargetBalanceChange(event:React.FormEvent<any>):void {

		var state = Object.assign({}, this.state);
		state.targetBalance = this.props.dataFormatter.unformatCurrency((event.target as HTMLInputElement).value);
		this.setState(state);
	}

	private onTargetBalanceFocus(event:React.FocusEvent<any>):void {

		var state = Object.assign({}, this.state);
		state.targetBalanceHasFocus = true;
		this.setState(state);
	}

	private onTargetBalanceBlur(event:React.FocusEvent<any>):void {

		var state = Object.assign({}, this.state);
		state.targetBalanceHasFocus = false;
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

		var dataFormatter = this.props.dataFormatter;
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

		if(this.state.goalType == SubCategoryGoalType.TargetBalance || 
			this.state.goalType == SubCategoryGoalType.TargetBalanceOnDate) {
			subCategoryClone.targetBalance = this.state.targetBalance;
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

	private getGoalEditorForTargetBalance():JSX.Element {

		var dataFormatter = this.props.dataFormatter;
		var monthlySubCategoryBudget = this.props.monthlySubCategoryBudget;
		var targetBalance = dataFormatter.formatCurrency(this.state.targetBalance, this.state.targetBalanceHasFocus);
		return (
			<div key={monthlySubCategoryBudget.entityId + "_targetBalanceEditor"}>
				<FormGroup key="formgroup">
					<ControlLabel>Target Balance:</ControlLabel>
					<FormControl type="text" componentClass="input" style={FormControlStyle} 
						value={targetBalance} onChange={this.onTargetBalanceChange}
						onFocus={this.onTargetBalanceFocus} onBlur={this.onTargetBalanceBlur}
					/>
				</FormGroup>
			</div>
		);
	}
	
	private getGoalEditorForTargetBalanceOnDate():JSX.Element {

		var dataFormatter = this.props.dataFormatter;
		var monthlySubCategoryBudget = this.props.monthlySubCategoryBudget;
		var targetBalance = dataFormatter.formatCurrency(this.state.targetBalance, this.state.targetBalanceHasFocus);

		var yearOptions:Array<JSX.Element> = [];
		var currentMonth = DateWithoutTime.createForCurrentMonth();
		for(var i = currentMonth.getYear(), j = 0; j < 20; i++,j++) {
			var option = <option key={j} value={i}>{i.toString()}</option>;
			yearOptions.push(option);
		}

		return (
			<div key={monthlySubCategoryBudget.entityId + "_targetBalanceOnDateEditor"}>
				<FormGroup>
					<ControlLabel>Target Balance:</ControlLabel>
					<FormControl type="text" componentClass="input" style={FormControlStyle} 
						value={targetBalance} onChange={this.onTargetBalanceChange}
						onFocus={this.onTargetBalanceFocus} onBlur={this.onTargetBalanceBlur}
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
	
	private getGoalEditorForMonthlyFunding():JSX.Element {

		var dataFormatter = this.props.dataFormatter;
		var monthlySubCategoryBudget = this.props.monthlySubCategoryBudget;
		var monthlyFunding = dataFormatter.formatCurrency(this.state.monthlyFunding, this.state.monthlyFundingHasFocus);

		return (
			<div key={monthlySubCategoryBudget.entityId + "_monthlyFundingEditor"}>
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

	private getGoalViewerForTargetBalance():JSX.Element {

		var dataFormatter = this.props.dataFormatter;
		var subCategory = this.props.subCategory;
		var monthlySubCategoryBudget = this.props.monthlySubCategoryBudget;
		var currentMonth = DateWithoutTime.createFromISOString(monthlySubCategoryBudget.month);
		var goalCreationMonth = DateWithoutTime.createFromISOString(subCategory.goalCreationMonth);
		var target = subCategory.targetBalance;
		var budgetedThisMonth = monthlySubCategoryBudget.budgeted;
		var overallBudgeted = monthlySubCategoryBudget.goalOverallFunded;
		var overallLeft = monthlySubCategoryBudget.goalOverallLeft;
		var completed = monthlySubCategoryBudget.goalOverallFunded;
		var percentageCompleted = (target != 0 && target >= completed) ? Math.round(completed / target * 100) : 100; 
		var percentageCompletedString = percentageCompleted.toString() + "%";

		// Did we budget some money this month towards the goal target 
		var messageNodes:Array<JSX.Element> = [];
		if(goalCreationMonth.isAfter(currentMonth) == false && budgetedThisMonth > 0) {
			messageNodes = [
				<hr key="separator" className="inspector-horizontal-rule" />,
				<label key="message" style={ProgressMessageStyle}>If you budget <strong>{dataFormatter.formatCurrency(budgetedThisMonth)}</strong> each month, you will reach your <strong>{dataFormatter.formatCurrency(target)}</strong> goal in {monthlySubCategoryBudget.goalExpectedCompletion} months.</label>
			]
		}

		var progressView = (
			<div key={monthlySubCategoryBudget.entityId + "_targetBalanceView"} style={ProgressViewContainerStyle}>
				<label style={ProgressPercentageGreenLabelStyle}>{percentageCompleted}% COMPLETED</label>
				<div className="progress" style={ProgressBarStyle}>
					<div className="progress-bar" role="progressbar" style={{width: percentageCompletedString, backgroundColor: GreenColor}} />
				</div>
				<div style={ProgressSummaryContainerStyle}>
					<div style={ProgressSummaryLeftItemsStyle}>
						<label style={ProgressSummaryLeftItemLabelStyle}>BUDGETED</label>
						<label style={ProgressSummaryLeftItemValueStyle}>{dataFormatter.formatCurrency(overallBudgeted)}</label>
					</div>
					<div style={ProgressSummaryRightItemsStyle}>
						<label style={ProgressSummaryRightItemLabelStyle}>TO GO</label>
						<label style={ProgressSummaryRightItemValueStyle}>{dataFormatter.formatCurrency(overallLeft)}</label>
					</div>
				</div>
				{messageNodes}
			</div>
		);

		return progressView;
	}

	private getGoalViewerForTargetBalanceOnDate():JSX.Element {

		var dataFormatter = this.props.dataFormatter;
		var subCategory = this.props.subCategory;
		var monthlySubCategoryBudget = this.props.monthlySubCategoryBudget;
		var currentMonth = DateWithoutTime.createFromISOString(monthlySubCategoryBudget.month);
		var goalCreationMonth = DateWithoutTime.createFromISOString(subCategory.goalCreationMonth);
		var target = subCategory.targetBalance;
		var budgetedThisMonth = monthlySubCategoryBudget.budgeted;
		var overallBudgeted = monthlySubCategoryBudget.goalOverallFunded;
		var overallLeft = monthlySubCategoryBudget.goalOverallLeft;
		var completed = monthlySubCategoryBudget.goalOverallFunded;
		var percentageCompleted = (target != 0 && target >= completed) ? Math.round(completed / target * 100) : 100; 
		var percentageCompletedString = percentageCompleted.toString() + "%";
		var currentMonthUnderFunded = monthlySubCategoryBudget.goalUnderFunded;

		var messageNodes:Array<JSX.Element> = [];
		if(goalCreationMonth.isAfter(currentMonth) == false) {

			if(currentMonthUnderFunded > 0) {
				messageNodes = [
					<hr key="separator" className="inspector-horizontal-rule" />,
					<label key="message" style={ProgressMessageStyle}>Budget <strong>{dataFormatter.formatCurrency(currentMonthUnderFunded)}</strong> more to stay on track towards reaching your <strong>{dataFormatter.formatCurrency(target)}</strong> goal.</label>
				];
			}
			else {
				var targetBalanceMonth = DateWithoutTime.createFromISOString(subCategory.targetBalanceMonth);
				messageNodes = [
					<hr key="separator" className="inspector-horizontal-rule" />,
					<label key="message" style={ProgressMessageStyle}>You're on track to reach your <strong>{dataFormatter.formatCurrency(target)}</strong> goal by {targetBalanceMonth.format("MMMM")} of {targetBalanceMonth.format("YYYY")}.</label>
				];
			}
		}

		var progressView = (
			<div key={monthlySubCategoryBudget.entityId + "_targetBalanceOndateView"} style={ProgressViewContainerStyle}>
				<label style={ProgressPercentageGreenLabelStyle}>{percentageCompleted}% COMPLETED</label>
				<div className="progress" style={ProgressBarStyle}>
					<div className="progress-bar" role="progressbar" style={{width: percentageCompletedString, backgroundColor: GreenColor}} />
				</div>
				<div style={ProgressSummaryContainerStyle}>
					<div style={ProgressSummaryLeftItemsStyle}>
						<label style={ProgressSummaryLeftItemLabelStyle}>BUDGETED</label>
						<label style={ProgressSummaryLeftItemValueStyle}>{dataFormatter.formatCurrency(overallBudgeted)}</label>
					</div>
					<div style={ProgressSummaryRightItemsStyle}>
						<label style={ProgressSummaryRightItemLabelStyle}>TO GO</label>
						<label style={ProgressSummaryRightItemValueStyle}>{dataFormatter.formatCurrency(overallLeft)}</label>
					</div>
				</div>
				{messageNodes}
			</div>
		);

		return progressView;
	}

	private getGoalViewerForMonthlyFunding():JSX.Element {

		var dataFormatter = this.props.dataFormatter;
		var subCategory = this.props.subCategory;
		var monthlySubCategoryBudget = this.props.monthlySubCategoryBudget;
		var currentMonth = DateWithoutTime.createFromISOString(monthlySubCategoryBudget.month);
		var goalCreationMonth = DateWithoutTime.createFromISOString(subCategory.goalCreationMonth);
		var target = subCategory.monthlyFunding;
		var budgetedThisMonth = monthlySubCategoryBudget.budgeted;
		var overallBudgeted = monthlySubCategoryBudget.goalOverallFunded;
		var overallLeft = monthlySubCategoryBudget.goalOverallLeft;
		var completed = monthlySubCategoryBudget.goalOverallFunded;
		var percentageCompleted = (target != 0 && target >= completed) ? Math.round(completed / target * 100) : 100; 
		var percentageCompletedString = percentageCompleted.toString() + "%";
		var currentMonthUnderFunded = monthlySubCategoryBudget.goalUnderFunded;

		var messageNodes:Array<JSX.Element> = [];
		if(goalCreationMonth.isAfter(currentMonth) == false) {

			if(currentMonthUnderFunded > 0) {
				messageNodes = [
					<hr key="separator" className="inspector-horizontal-rule" />,
					<label key="message" style={ProgressMessageStyle}>Budget <strong>{dataFormatter.formatCurrency(currentMonthUnderFunded)}</strong> more to reach your <strong>{dataFormatter.formatCurrency(target)}</strong> monthly goal.</label>
				];
			}
			else {
				messageNodes = [
					<hr key="separator" className="inspector-horizontal-rule" />,
					<label key="message" style={ProgressMessageStyle}>You've reached your <strong>{dataFormatter.formatCurrency(target)}</strong> goal for the month.</label>
				];
			}
		}

		var progressView = (
			<div key={monthlySubCategoryBudget.entityId + "_monthlyFundingView"} style={ProgressViewContainerStyle}>
				<label style={ProgressPercentageGreenLabelStyle}>{percentageCompleted}% COMPLETED</label>
				<div className="progress" style={ProgressBarStyle}>
					<div className="progress-bar" role="progressbar" style={{width: percentageCompletedString, backgroundColor: GreenColor}} />
				</div>
				<div style={ProgressSummaryContainerStyle}>
					<div style={ProgressSummaryLeftItemsStyle}>
						<label style={ProgressSummaryLeftItemLabelStyle}>BUDGETED</label>
						<label style={ProgressSummaryLeftItemValueStyle}>{dataFormatter.formatCurrency(overallBudgeted)}</label>
					</div>
					<div style={ProgressSummaryRightItemsStyle}>
						<label style={ProgressSummaryRightItemLabelStyle}>TO GO</label>
						<label style={ProgressSummaryRightItemValueStyle}>{dataFormatter.formatCurrency(overallLeft)}</label>
					</div>
				</div>
				{messageNodes}
			</div>
		);

		return progressView;
	}

	public componentWillReceiveProps(nextProps:PDefaultCategoryGoalsProps):void {

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
				if(subCategory.goalType == SubCategoryGoalType.TargetBalance)
					viewer = this.getGoalViewerForTargetBalance();
				else if(subCategory.goalType == SubCategoryGoalType.TargetBalanceOnDate)
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
			if(this.state.goalType == SubCategoryGoalType.TargetBalance)
				editor = this.getGoalEditorForTargetBalance();
			else if(this.state.goalType == SubCategoryGoalType.TargetBalanceOnDate)
				editor = this.getGoalEditorForTargetBalanceOnDate();
			else
				editor = this.getGoalEditorForMonthlyFunding();

			return (
				<div style={GoalsContainerStyle}>
					{header}
					<div style={GoalTypeSelectionContainerStyle}>
						<Radio checked={this.state.goalType == SubCategoryGoalType.TargetBalance} onChange={this.onGoalTypeSelectionChange.bind(this, "TB")} style={GoalTypeSelectionRadioStyle}>Target Category Balance</Radio>
						<Radio checked={this.state.goalType == SubCategoryGoalType.TargetBalanceOnDate} onChange={this.onGoalTypeSelectionChange.bind(this, "TBD")} style={GoalTypeSelectionRadioStyle}>Target Category Balance by Date</Radio>
						<Radio checked={this.state.goalType == SubCategoryGoalType.MonthlyFunding} onChange={this.onGoalTypeSelectionChange.bind(this, "MF")} style={GoalTypeSelectionRadioStyle}>Monthly Funding Goal</Radio>
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