/// <reference path="../../../_includes.ts" />

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Button } from 'react-bootstrap';

import { IEntitiesCollection } from '../../../interfaces/state';
import * as budgetEntities from '../../../interfaces/budgetEntities';

export interface PDebtCategoryInspectorProps {
	entitiesCollection:IEntitiesCollection;
	subCategory:budgetEntities.ISubCategory;
}

const DebtCategoryInspectorContainerStyle = {
	display: "flex",
	flexFlow: 'column nowrap',
	alignItems: "center",
	justifyContent: "flex-start",
	color: "#588697",
	paddingTop: "10px",
}

export class PDebtCategoryInspector extends React.Component<PDebtCategoryInspectorProps, {}> {

	public render() {
		return (
			<div style={DebtCategoryInspectorContainerStyle}/>
		);
	}
}