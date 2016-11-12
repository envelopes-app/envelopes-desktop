/// <reference path="../../../_includes.ts" />

import * as _ from 'lodash';
import * as React from 'react';
import * as ReactDOM from 'react-dom';

import * as budgetEntities from '../../../interfaces/budgetEntities';
import { IEntitiesCollection, ISimpleEntitiesCollection } from '../../../interfaces/state';

export interface PUpcomingTransactionsDialogProps {
	entitiesCollection:IEntitiesCollection
	// Dispatcher Functions
	updateEntities:(entities:ISimpleEntitiesCollection)=>void;
}

export interface PUpcomingTransactionsDialogState {
	show:boolean;
	target:HTMLElement;
	placement:string;
}

const PopoverStyle:React.CSSProperties = {
	maxWidth: 'none',
	width:'400px'
}

export class PUpcomingTransactionsDialog extends React.Component<PUpcomingTransactionsDialogProps, PUpcomingTransactionsDialogState> {

	public render() {
		return <div />;		
	}
}