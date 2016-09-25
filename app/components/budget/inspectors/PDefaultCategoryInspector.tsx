/// <reference path="../../../_includes.ts" />

import * as _ from 'lodash';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Button, Glyphicon } from 'react-bootstrap';

import { DateWithoutTime } from '../../../utilities';
import { IEntitiesCollection } from '../../../interfaces/state';
import * as budgetEntities from '../../../interfaces/budgetEntities';

export interface PDefaultCategoryInspectorProps {
	entitiesCollection:IEntitiesCollection;
	subCategory:budgetEntities.ISubCategory;
}

const DefaultCategoryInspectorContainerStyle = {
	display: "flex",
	flexFlow: 'column nowrap',
	alignItems: "center",
	justifyContent: "flex-start",
	color: "#588697",
}

const HRStyle = {
	width: "100%",
	marginTop: "0px",
	marginBottom: "10px",
	borderTop: "1px dashed #588697"
}

const RowStyle = {
	width: "100%",
	display: "flex",
	flexFlow: 'row nowrap',
	alignItems: "center",
	paddingLeft: "10px",
	paddingRight: "10px"
}

const RowItemStyle = {
	flex: "0 0 auto"
}

const SpacerStyle = {
	flex: "1 1 auto"
}

const CategoryNameStyle = {
	flex: "0 0 auto",
	color: "#003440",
	fontSize: "22px",
	fontWeight: "normal"
}

const CategoryMenuStyle = {
	flex: "0 0 auto",
	color: "#009CC2",
}

const CategoryPropertyNameStyle = _.assign({}, RowItemStyle, {
	fontSize: "14px",
	fontWeight: "normal",
	color: "#003440"
});

const CategoryPropertyValueStyle = _.assign({}, RowItemStyle, {
	fontSize: "14px",
	fontWeight: "bold",
	color: "#003440"
});

const PillHeaderRowStyle = _.assign({}, RowStyle, {
	paddingTop: "10px"
});

const PillHeaderStyle = _.assign({}, RowItemStyle, {
	width: "100%",
	backgroundColor: "#FFFFFF",
	color: "#003440",
	fontWeight: "bold",
	fontSize: "14px",
	borderRadius: "1000px",
	paddingTop: "5px",
	paddingBottom: "5px",
	paddingLeft: "10px",
	paddingRight: "10px",
});

const ListStyle = {
	paddingTop: "10px",
	paddingLeft: "20px",
	paddingRight: "20px",
	listStyleType: "none",
	width: "100%"
}

const ListItemStyle = {
	width: "100%"
}

export class PDefaultCategoryInspector extends React.Component<PDefaultCategoryInspectorProps, {}> {

	public render() {

		var prevMonth = DateWithoutTime.createForCurrentMonth().subtractMonths(1);
		var prevMonthName = prevMonth.getMonthFullName();

		var cashLeftOver = 0;
		var budgetedThisMonth = 0;
		var cashSpending = 0;
		var creditSpending = 0;
		var available = 0;

		var budgetedLastMonthValue:number = 0;
		var spentLastMonthValue:number = 0;
		var averageBudgetedValue:number = 0;
		var averageSpentValue:number = 0;

		return (
			<div style={DefaultCategoryInspectorContainerStyle}>
				<div style={RowStyle}>
					<label style={CategoryNameStyle}>{this.props.subCategory.name}</label>
					<div style={SpacerStyle}/>
					<label style={CategoryMenuStyle}><Glyphicon glyph="triangle-bottom" />&nbsp;Edit</label>
				</div>

				<hr style={HRStyle}/>
				<div style={RowStyle}>
					<label style={CategoryPropertyNameStyle}>Cash Left Over from {prevMonthName}</label>
					<span style={SpacerStyle}/>
					<label style={CategoryPropertyValueStyle}>{cashLeftOver}</label>
				</div>
				<div style={RowStyle}>
					<label style={CategoryPropertyNameStyle}>Budgeted This Month</label>
					<span style={SpacerStyle}/>
					<label style={CategoryPropertyValueStyle}>{budgetedThisMonth}</label>
				</div>
				<div style={RowStyle}>
					<label style={CategoryPropertyNameStyle}>Cash Spending</label>
					<span style={SpacerStyle}/>
					<label style={CategoryPropertyValueStyle}>{cashSpending}</label>
				</div>
				<div style={RowStyle}>
					<label style={CategoryPropertyNameStyle}>Credit Spending</label>
					<span style={SpacerStyle}/>
					<label style={CategoryPropertyValueStyle}>{creditSpending}</label>
				</div>
				<hr style={HRStyle}/>
				<div style={RowStyle}>
					<label style={CategoryPropertyNameStyle}>Available</label>
					<span style={SpacerStyle}/>
					<label style={CategoryPropertyValueStyle}>{available}</label>
				</div>

				<div style={PillHeaderRowStyle}>
					<div style={PillHeaderStyle}>
						QUICK BUDGET
					</div>
				</div>
				<ul style={ListStyle}>
					<li style={ListItemStyle}>
						<Button className="quick-budget-button">
							Budgeted Last Month: {budgetedLastMonthValue}
						</Button>
					</li>
					<li style={ListItemStyle}>
						<Button className="quick-budget-button">
							Spent Last Month: {spentLastMonthValue}
						</Button>
					</li>
					<li style={ListItemStyle}>
						<Button className="quick-budget-button">
							Average Budgeted: {averageBudgetedValue}
						</Button>
					</li>
					<li style={ListItemStyle}>
						<Button className="quick-budget-button">
							Average Spent: {averageSpentValue}
						</Button>
					</li>
				</ul>

				<div style={PillHeaderRowStyle}>
					<div style={PillHeaderStyle}>
						GOALS
					</div>
				</div>

				<div style={PillHeaderRowStyle}>
					<div style={PillHeaderStyle}>
						NOTES
					</div>
				</div>
				
			</div>
		);
	}
}