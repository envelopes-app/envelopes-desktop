/// <reference path="../../_includes.ts" />

import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { PRegisterHeader } from './PRegisterHeader';
import { PRegisterToolbar } from './PRegisterToolbar';
import { PRegisterDataGrid } from './PRegisterDataGrid';

import * as budgetEntities from '../../interfaces/budgetEntities';
import { IRegisterState } from '../../interfaces/state';

export interface PRegisterProps {

	transactions: Array<budgetEntities.ITransaction>,
	subTransactions: Array<budgetEntities.ISubTransaction>,
	scheduledTransactions: Array<budgetEntities.IScheduledTransaction>,
	scheduledSubTransactions: Array<budgetEntities.IScheduledSubTransaction>,
	payees: Array<budgetEntities.IPayee>,
	masterCategories: Array<budgetEntities.IMasterCategory>,
	subCategories: Array<budgetEntities.ISubCategory>,
	registerState: IRegisterState
}

const RegisterContainerStyle = {
	display: 'flex',
	flexFlow: 'column nowrap',
	height: '100%',
	width: '100%'
}

export class PRegister extends React.Component<PRegisterProps, {}> {
  
	public render() {
    	return (
			<div style={RegisterContainerStyle}>
				<PRegisterHeader accounts={null} />
				<PRegisterToolbar />
				<PRegisterDataGrid />
			</div>
		);
  	}
}