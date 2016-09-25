/// <reference path="../../../_includes.ts" />

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Button } from 'react-bootstrap';

import { IEntitiesCollection } from '../../../interfaces/state';
import * as budgetEntities from '../../../interfaces/budgetEntities';

export interface PDefaultInspectorProps {
	entitiesCollection:IEntitiesCollection;
	selectedSubCategories:Array<string>;
}

const DefaultInspectorContainerStyle = {
	display: "flex",
	flexFlow: 'column nowrap',
	alignItems: "center",
	justifyContent: "flex-start",
	color: "#588697",
	paddingTop: "10px",
}

const SectionStyle = {
	display: "flex",
	flexFlow: 'column nowrap',
	alignItems: "center",
	paddingTop: "10px",
	width: "100%"
}

const LabelStyle = {
	fontSize: "12px",
	fontWeight: "bold"
}

const ValueStyle = {
	fontSize: "22px",
	fontWeight: "bold"
}

const HRStyle = {
	width: "80%",
	marginTop: "10px",
	marginBottom: "10px",
	borderTop: "1px dashed #588697"
}

const ListStyle = {
	paddingLeft: "20px",
	paddingRight: "20px",
	listStyleType: "none",
	width: "100%"
}

const ListItemStyle = {
	width: "100%"
}

export class PDefaultInspector extends React.Component<PDefaultInspectorProps, {}> {

	public render() {

		var totalBudgeted:number = 123456;
		var totalActivity:number = 234563;
		var totalAvailable:number = 234546;
		var totalInflows:number = 976456;

		var underfundedValue:number = 0;

    	return (
			<div style={DefaultInspectorContainerStyle}>
				<div style={SectionStyle}>
					<label style={LabelStyle}>TOTAL BUDGETED</label>
					<label style={ValueStyle}>{totalBudgeted}</label>
				</div>
				<hr style={HRStyle}/>
				<div style={SectionStyle}>
					<label style={LabelStyle}>TOTAL ACTIVTY</label>
					<label style={ValueStyle}>{totalActivity}</label>
				</div>
				<hr style={HRStyle}/>
				<div style={SectionStyle}>
					<label style={LabelStyle}>TOTAL AVAILABLE</label>
					<label style={ValueStyle}>{totalAvailable}</label>
				</div>
				<hr style={HRStyle}/>
				<div style={SectionStyle}>
					<label style={LabelStyle}>TOTAL INFLOWS</label>
					<label style={ValueStyle}>{totalInflows}</label>
				</div>
				<hr style={HRStyle}/>
				<div style={SectionStyle}>
					<label style={LabelStyle}>QUICK BUDGET</label>
					<ul style={ListStyle}>
						<li style={ListItemStyle}>
							<Button className="quick-budget-button">
								Underfunded: {underfundedValue}
							</Button>
						</li>
						<li style={ListItemStyle}>
							<Button className="quick-budget-button">
								Budgeted Last Month: {underfundedValue}
							</Button>
						</li>
						<li style={ListItemStyle}>
							<Button className="quick-budget-button">
								Spent Last Month: {underfundedValue}
							</Button>
						</li>
						<li style={ListItemStyle}>
							<Button className="quick-budget-button">
								Average Budgeted: {underfundedValue}
							</Button>
						</li>
						<li style={ListItemStyle}>
							<Button className="quick-budget-button">
								Average Spent: {underfundedValue}
							</Button>
						</li>
					</ul>
				</div>
			</div>
		);
  	}

}