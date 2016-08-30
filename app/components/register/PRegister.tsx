/// <reference path="../../_includes.ts" />

import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { PRegisterHeader } from './PRegisterHeader';
import { PRegisterToolbar } from './PRegisterToolbar';
import { PRegisterDataGrid } from './PRegisterDataGrid';
import { PAddTransactionDialog } from './trxDialogs/PAddTransactionDialog';

import './SRegister.css';

import * as budgetEntities from '../../interfaces/budgetEntities';
import { IEntitiesCollection, IRegisterState } from '../../interfaces/state';

export interface PRegisterProps {
	accounts: Array<budgetEntities.IAccount>;
	transactions: Array<budgetEntities.ITransaction>;
	subTransactions: Array<budgetEntities.ISubTransaction>;
	scheduledTransactions: Array<budgetEntities.IScheduledTransaction>;
	scheduledSubTransactions: Array<budgetEntities.IScheduledSubTransaction>;
	payees: Array<budgetEntities.IPayee>;
	masterCategories: Array<budgetEntities.IMasterCategory>;
	subCategories: Array<budgetEntities.ISubCategory>;
	registerState: IRegisterState;
}

const RegisterContainerStyle = {
	display: 'flex',
	flexFlow: 'column nowrap',
	height: '100%',
	width: '100%'
}

export class PRegister extends React.Component<PRegisterProps, {}> {

	private addTransactionDialog:PAddTransactionDialog;

	constructor(props: any) {
        super(props);
		this.onAddTransactionSelected = this.onAddTransactionSelected.bind(this);
    }

	// *******************************************************************************************************
	// Action Handlers for commands in the Regsiter Toolbar
	// *******************************************************************************************************
	private onAddTransactionSelected():void {
		this.addTransactionDialog.show();
	}

	// *******************************************************************************************************
	// *******************************************************************************************************

	private updateEntities(entities:IEntitiesCollection):void {

	}

	public render() {
    	return (
			<div style={RegisterContainerStyle}>
				<PRegisterHeader accounts={null} />
				<PRegisterToolbar 
					onAddTransactionSelected={this.onAddTransactionSelected}
				/>
				<PRegisterDataGrid />

				<PAddTransactionDialog 
					ref={(d)=> this.addTransactionDialog = d }
					accounts={this.props.accounts}
					masterCategories={this.props.masterCategories} 
					subCategories={this.props.subCategories} 
					payees={this.props.payees}
					updateEntities={this.updateEntities} 
				/>
			</div>
		);
  	}
}