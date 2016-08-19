/// <reference path="../../_includes.ts" />

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import Divider from 'material-ui/Divider';
import RaisedButton from 'material-ui/RaisedButton';
import {List, ListItem, MakeSelectable} from 'material-ui/List';
import Subheader from 'material-ui/Subheader';
import * as colors from 'material-ui/styles/colors';
import MailOutline from 'material-ui/svg-icons/communication/mail-outline';
import AccountBalance from 'material-ui/svg-icons/action/account-balance';

import ColorPalette from '../common/ColorPalette';
import { PSidebarHeader } from './PSidebarHeader';
import { PModuleButton } from './PModuleButton';
import { PAccountButtonContainer } from './PAccountButtonContainer';
import { PAccountButton } from './PAccountButton';
import { PAccountCreationDialog } from './PAccountCreationDialog';

import { EntityFactory } from '../../persistence';
import { IAccount } from '../../interfaces/budgetEntities';

let SelectableList = MakeSelectable(List);

const PSidebarStyle = {
	display: 'flex',
	flexFlow: 'column nowrap',
	width: '100%',
	height: '100%',
	backgroundColor: colors.cyan400,
};

const ModuleButtonIconStyle = {
	display: 'inline-block',
	color: 'rgba(0, 0, 0, 0.870588)',
	fill: 'rgb(255, 255, 255)',
	height: '24px',
	width: '24px',
	verticalAlign: 'middle',
	marginLeft: '12px',
	marginRight: '0px'
}

export interface PSidebarProps {
    accounts: Array<IAccount>;
	onAddAccount: (account:IAccount, currentBalance:number)=>void;
	onUpdateAccount: (account:IAccount, currentBalance:number)=>void;
}

export class PSidebar extends React.Component<PSidebarProps, {}> {
  
	private accountCreationDialog:PAccountCreationDialog;

	constructor(props: any) {
        super(props);
		this.onAddAccountClick = this.onAddAccountClick.bind(this);
	}

	private onAddAccountClick() {

		// Create a new account entity and pass it to the account creation dialog
		var account = EntityFactory.createNewAccount();
		this.accountCreationDialog.show(account);
	}

  	public render() {
		return (
			<div className="sidebar" style={PSidebarStyle}>
				<PSidebarHeader title="Home Budget 2016" />
				<PModuleButton label="Budget" selected={false}>
					<MailOutline style={ModuleButtonIconStyle} />
				</PModuleButton>
				<PModuleButton label="All Accounts" selected={false}>
					<AccountBalance style={ModuleButtonIconStyle} />
				</PModuleButton>
				<Divider style={{backgroundColor: ColorPalette.Shade600}} />
				<PAccountButtonContainer label="BUDGET" value={1234} identity="budget">
					<PAccountButton label="Checking" value={1234} selected={false} />
				</PAccountButtonContainer>
				<PAccountButtonContainer label="TRACKING" value={-1234} identity="tracking">
					<PAccountButton label="Saving" value={-1234} selected={false} />
				</PAccountButtonContainer>

				<RaisedButton label="Add Account" primary={true} onClick={this.onAddAccountClick} />

				<PAccountCreationDialog ref={(d)=> this.accountCreationDialog = d } onAddAccount={this.props.onAddAccount} />
			</div>
		);
  	}
}