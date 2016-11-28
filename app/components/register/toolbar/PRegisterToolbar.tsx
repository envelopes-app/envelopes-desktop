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
	showEditMenuDialog:(element:HTMLElement)=>void;
	showRegisterSettingsDialog:(element:HTMLElement, placement?:string)=>void;
}

const RegisterToolbarContainerStyle:React.CSSProperties = {
	flex: '0 0 auto',
	height: '35px',
	width: '100%',
	backgroundColor: '#ffffff',
	paddingLeft: '10px',
	paddingRight: '10px'
}

const RegisterToolbarStyle:React.CSSProperties = {
	display: 'flex',
	flexFlow: 'row nowrap',
	justifyContent: 'flex-start',
	alignItems: 'center',
	height: '100%',
	width: '100%'
}

export class PRegisterToolbar extends React.Component<PRegisterToolbarProps, {}> {
  
	private editButton:PLinkButton;
	private filterButton:PLinkButton;
	private settingsButton:PLinkButton;

  	constructor(props:PRegisterToolbarProps) {
        super(props);
		this.showEditMenuDialog = this.showEditMenuDialog.bind(this);
		this.showFilterDialog = this.showFilterDialog.bind(this);
		this.showSettingsDialog = this.showSettingsDialog.bind(this);
    }

	private showEditMenuDialog():void {

		var selectedTransactionsCount = this.props.registerState.selectedTransactions.length;
		if(selectedTransactionsCount > 0) {
			this.props.showEditMenuDialog(this.editButton.getRootElement());
		}
	}

	private showFilterDialog(event:React.MouseEvent<any>):void {
		this.props.showFilterDialog(this.filterButton.getRootElement());
	}

	private showSettingsDialog(event:React.MouseEvent<any>):void {
		this.props.showRegisterSettingsDialog(this.settingsButton.getRootElement());
	}

	public render() {

		var editButtonText:string = "Edit";
		var selectedTransactionsCount = this.props.registerState.selectedTransactions.length;
		if(selectedTransactionsCount > 0)
			editButtonText += ` (${selectedTransactionsCount})`;

    	return (
			<div style={RegisterToolbarContainerStyle}>
				<div style={RegisterToolbarStyle}>
					<PLinkButton 
						text="Add a transaction" 
						glyphNames={["glyphicon-plus-sign"]} 
						clickHandler={this.props.onAddTransactionSelected} 
					/>
					<PLinkButton 
						ref={(b)=> this.editButton = b }
						enabled={selectedTransactionsCount > 0} 
						text={editButtonText} 
						glyphNames={["glyphicon-edit"]} 
						showDropDown={true} 
						clickHandler={this.showEditMenuDialog} 
					/>
					<PLinkButton 
						ref={(b)=> this.settingsButton = b }
						glyphNames={["glyphicon-cog"]}
						enabled={true} text="Settings" showDropDown={true} 
						clickHandler={this.showSettingsDialog}
					/>
					<div className="spacer" />
					<PLinkButton 
						ref={(b)=> this.filterButton = b }
						glyphNames={["glyphicon-filter"]}
						enabled={true} text="Filter" showDropDown={true} 
						clickHandler={this.showFilterDialog} 
					/>
				</div>
			</div>
		);
  	}
}