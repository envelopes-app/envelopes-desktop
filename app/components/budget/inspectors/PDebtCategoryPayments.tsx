/// <reference path="../../../_includes.ts" />

import * as _ from 'lodash';
import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { DateWithoutTime } from '../../../utilities';
import { IEntitiesCollection, ISimpleEntitiesCollection } from '../../../interfaces/state';
import * as budgetEntities from '../../../interfaces/budgetEntities';

export interface PDebtCategoryPaymentsProps {
	subCategory:budgetEntities.ISubCategory;
	monthlySubCategoryBudget:budgetEntities.IMonthlySubCategoryBudget;
	// Dispatcher Functions
	updateEntities:(entities:ISimpleEntitiesCollection)=>void;
}

export interface PDebtCategoryPaymentsState { }

const PaymentsContainerStyle:React.CSSProperties = {
	display: "flex",
	flexFlow: "column nowrap",
	justifyContent: "flex-start",
	width: "100%",
	paddingTop: "10px",
	paddingLeft: "10px",
	paddingRight: "10px"
}

export class PDebtCategoryPayments extends React.Component<PDebtCategoryPaymentsProps, PDebtCategoryPaymentsState> {

	constructor(props:any) {
        super(props);
	}

	public render() {

		// Get the subcategory entity
		var subCategory = this.props.subCategory;
		var monthlySubCategoryBudget = this.props.monthlySubCategoryBudget;

		return (
			<div style={PaymentsContainerStyle}>
				<div className="inspector-section-header">
					PAYMENTS
				</div>
			</div>
		);
	}
}