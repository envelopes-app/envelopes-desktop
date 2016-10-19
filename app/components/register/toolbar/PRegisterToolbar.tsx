/// <reference path="../../../_includes.ts" />

import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { PLinkButton } from '../../common/PLinkButton';
import { IRegisterState } from '../../../interfaces/state';
import * as budgetEntities from '../../../interfaces/budgetEntities';

export interface PRegisterToolbarProps {
	registerState:IRegisterState;
	onAddTransactionSelected:()=>void;
	showEditMenu:()=>void;
	showFilterDialog:(element:HTMLElement)=>void;
}

const RegisterToolbarContainerStyle = {
	flex: '0 0 auto',
	height: '35px',
	width: '100%',
	backgroundColor: '#ffffff',
	paddingLeft: '10px',
	paddingRight: '10px'
}

const RegisterToolbarStyle = {
	display: 'flex',
	flexFlow: 'row nowrap',
	justifyContent: 'flex-start',
	alignItems: 'center',
	height: '100%',
	width: '100%'
}

export class PRegisterToolbar extends React.Component<PRegisterToolbarProps, {}> {
  
	private filterButton:PLinkButton;

  	constructor(props: any) {
        super(props);
		this.showEditMenu = this.showEditMenu.bind(this);
		this.showFilterDialog = this.showFilterDialog.bind(this);
    }

	private showEditMenu():void {

	}

	private showFilterDialog(event:React.MouseEvent):void {
		this.props.showFilterDialog(this.filterButton as any);
	}

	public render() {

		var editButtonText:string = "Edit";
		var selectedTransactionsCount = this.props.registerState.selectedTransactions.length;
		if(selectedTransactionsCount > 0)
			editButtonText += ` (${selectedTransactionsCount})`;

    	return (
			<div style={RegisterToolbarContainerStyle}>
				<div style={RegisterToolbarStyle}>
					<PLinkButton text="Add a transaction" glyphName="glyphicon-plus-sign" clickHandler={this.props.onAddTransactionSelected} />
					<PLinkButton enabled={selectedTransactionsCount > 0} text={editButtonText} 
						glyphName="glyphicon-edit" showDropDown={true} clickHandler={this.showEditMenu} />
					<div className="spacer" />
					<PLinkButton 
						ref={(d)=> this.filterButton = d }
						enabled={true} text="Filter" showDropDown={true} 
						clickHandler={this.showFilterDialog} />
				</div>
			</div>
		);
  	}
}