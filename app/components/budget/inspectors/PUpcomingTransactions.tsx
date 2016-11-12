/// <reference path="../../../_includes.ts" />

import * as _ from 'lodash';
import * as React from 'react';
import * as ReactDOM from 'react-dom';

import * as budgetEntities from '../../../interfaces/budgetEntities';
import { IEntitiesCollection, ISimpleEntitiesCollection } from '../../../interfaces/state';

export interface PUpcomingTransactionsProps {
	subCategory:budgetEntities.ISubCategory;
	monthlySubCategoryBudget:budgetEntities.IMonthlySubCategoryBudget;
	entitiesCollection:IEntitiesCollection
	// Dispatcher Functions
	updateEntities:(entities:ISimpleEntitiesCollection)=>void;
}

export interface PUpcomingTransactionsState {
	show:boolean;
	target:HTMLElement;
	placement:string;
}

const PopoverStyle:React.CSSProperties = {
	maxWidth: 'none',
	width:'400px'
}

export class PUpcomingTransactions extends React.Component<PUpcomingTransactionsProps, PUpcomingTransactionsState> {

	public render() {
		return (
			<div className="inspector-section-header">
				UPCOMING TRANSACTIONS
			</div>
		);		
	}
}