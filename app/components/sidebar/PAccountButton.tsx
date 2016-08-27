/// <reference path="../../_includes.ts" />

import * as _ from 'lodash';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Popover, Form, FormGroup, FormControl, HelpBlock, ControlLabel, Button, Glyphicon, Overlay } from 'react-bootstrap';

import ColorPalette from '../common/ColorPalette';
import { IAccount } from '../../interfaces/budgetEntities';
import { AccountTypes, AccountTypeNames } from '../../constants';

const AccountButtonContainerStyle = {
	display: 'flex',
	flexFlow: 'row nowrap',	
	height: '30px',
	top: '0px',
	paddingLeft: '16px', 
	alignItems: 'center',
	cursor: 'pointer',
	backgroundColor: ColorPalette.Shade500
};

const AccountButtonLabelStyle = {

	fontSize: '16px',
	fontWeight: 'normal', 
	margin: '0px', 
	paddingLeft: '8px', 
	color: 'white'
};

const GlyphStyle = {
	paddingLeft: '5px',
	color: 'white'
};

const AccountButtonValueStyle = {

	fontSize: '12px',
	fontWeight: 'normal', 
	textAlign: 'right',
	color: 'white'
};

const AccountButtonValueWithBadgeStyle = {

	fontSize: '12px',
	fontWeight: 'normal', 
	color: '#D33C2D',
	backgroundColor: 'white'
};

const PopoverStyle = {
	maxWidth: 'none', 
	width:'400px'
}

const CloseAccountButtonStyle = {

}

const CancelButtonStyle = {

}

const OkButtonStyle = {

}

export interface PAccountButtonProps {
	account:IAccount;
	selected: boolean;
	// Method to call on PSidebar for selecting the account
	selectAccount?: (accountId:string)=>void;
	// Dispatcher method from CSidebar for updating the account
	updateAccount: (account:IAccount, currentBalance:number)=>void;
}

export class PAccountButton extends React.Component<PAccountButtonProps, {hoverState:boolean; glyphHoverState:boolean; showPopover:boolean}> {
  
	private editAccountGlyph:HTMLSpanElement;

	private ctrlAccountName:FormControl;
	private ctrlNote:FormControl;
	private ctrlAccountBalance:FormControl;

	constructor(props: any) {
        super(props);
		this.handleClick = this.handleClick.bind(this);
		this.handleMouseEnter = this.handleMouseEnter.bind(this);
		this.handleMouseLeave = this.handleMouseLeave.bind(this);
		this.handleGlyphClick = this.handleGlyphClick.bind(this);
		this.handleGlyphMouseEnter = this.handleGlyphMouseEnter.bind(this);
		this.handleGlyphMouseLeave = this.handleGlyphMouseLeave.bind(this);
		this.handlePopoverOk = this.handlePopoverOk.bind(this);
		this.handlePopoverCancel = this.handlePopoverCancel.bind(this);
		this.handlePopoverCloseAccount = this.handlePopoverCloseAccount.bind(this);
		this.handlePopoverDeleteAccount = this.handlePopoverDeleteAccount.bind(this);
		this.handlePopoverReopenAccount = this.handlePopoverReopenAccount.bind(this);
		this.toggleAccountEditingPopover = this.toggleAccountEditingPopover.bind(this);
		this.state = {hoverState:false, glyphHoverState:false, showPopover:false};
	}

	private handleClick() {
		this.props.selectAccount(this.props.account.entityId);
	}

	private handleMouseEnter() {

		var state:any = _.assign({}, this.state);
		state.hoverState = true;
		this.setState(state);
	}

	private handleMouseLeave() {

		var state:any = _.assign({}, this.state);
		state.hoverState = false;
		this.setState(state);
	}

	private handleGlyphClick() {

		// Show the popover for editing the account
		this.toggleAccountEditingPopover();		
	}

	private handleGlyphMouseEnter() {

		var state:any = _.assign({}, this.state);
		state.glyphHoverState = true;
		this.setState(state);
	}

	private handleGlyphMouseLeave() {

		var state:any = _.assign({}, this.state);
		state.glyphHoverState = false;
		this.setState(state);
	}

	private toggleAccountEditingPopover() {

		var state:any = _.assign({}, this.state);
		state.showPopover = !state.showPopover;
		this.setState(state);
	}

	private handlePopoverOk() {

		// Get the values from the form controls
		var accountName = (ReactDOM.findDOMNode(this.ctrlAccountName) as any).value;
		var accountNote = (ReactDOM.findDOMNode(this.ctrlNote) as any).value;
		var accountBalance = (ReactDOM.findDOMNode(this.ctrlAccountBalance) as any).value;

		// Hide the popover for editing the account		
		this.toggleAccountEditingPopover();

		// If the user has changed any of the account properties, then call updateAccount
		var account:IAccount = this.props.account;
		if(
			account.accountName !== accountName ||
			account.note !== accountNote ||
			account.clearedBalance + account.unclearedBalance !== accountBalance 
		) {
			// Create a copy of the account entity, update the values in it and call the update method with it
			var updatedAccount = _.assign({}, account) as IAccount;
			updatedAccount.accountName = accountName;
			updatedAccount.note = accountNote;
			this.props.updateAccount(updatedAccount, accountBalance);			 
		}
	}

	private handlePopoverCancel() {

		// Hide the popover for editing the account		
		this.toggleAccountEditingPopover();
	}

	private handlePopoverCloseAccount() {

		// Get the values from the form controls
		var accountName = (ReactDOM.findDOMNode(this.ctrlAccountName) as any).value;
		var accountNote = (ReactDOM.findDOMNode(this.ctrlNote) as any).value;
		var accountBalance = (ReactDOM.findDOMNode(this.ctrlAccountBalance) as any).value;

		// Hide the popover for editing the account		
		this.toggleAccountEditingPopover();

		// Set the closed flag on the account and send it for update
		var updatedAccount = _.assign({}, this.props.account) as IAccount;
		updatedAccount.closed = 1;
		updatedAccount.accountName = accountName;
		updatedAccount.note = accountNote;
		this.props.updateAccount(updatedAccount, accountBalance);			 
	}

	private handlePopoverDeleteAccount() {
		// TODO
	}

	private handlePopoverReopenAccount() {
		// TODO
	}

  	public render() {

		var hoverState = (this.state as any).hoverState;
		var glyphHoverState = (this.state as any).glyphHoverState;

		// Based on the hoverState, determine the backgroundColor value
		var backgroundColorValue:string = ColorPalette.Shade800;
		if(this.props.selected == false) {
			if(hoverState == true)
				backgroundColorValue = ColorPalette.Shade700;
			else
				backgroundColorValue = ColorPalette.Shade500;
		}

		// Create a clone of the style object, and update the backgroundColor value in it
		var accountButtonContainerStyle = _.assign({}, AccountButtonContainerStyle, {backgroundColor: backgroundColorValue}); 

		// Based on the hoverState and glyphHoverState, determine the opacity for the edit glyph
		var opacity:number = 0;
		if(hoverState == true) {
			if(glyphHoverState == true)
				opacity = 1;
			else
				opacity = 0.5;
		}

		// Create a clone of the style object, and update the opacity value in it
		var glyphStyle = _.assign({}, GlyphStyle, {opacity: opacity}); 

		// If the value is negative, we need to show it with a badge around it
		var valueNode;
		var accountBalance = this.props.account.clearedBalance + this.props.account.unclearedBalance;
		if(accountBalance < 0)
			valueNode = <span className="badge" style={AccountButtonValueWithBadgeStyle}>{accountBalance}</span>;
		else
			valueNode = <span style={AccountButtonValueStyle}>{accountBalance}</span>;

		// Get the values from the account that we need to display in the edit dialog
		var accountName = this.props.account.accountName;
		var accountNote = this.props.account.note;

		return (
			<div>
				<div style={accountButtonContainerStyle} 
					onClick={this.handleClick} onMouseEnter={this.handleMouseEnter} onMouseLeave={this.handleMouseLeave}>
					<span style={AccountButtonLabelStyle}>{this.props.account.accountName}</span>
					<span ref={(n) => this.editAccountGlyph = n } className="glyphicon glyphicon-edit" style={glyphStyle} 
						onClick={this.handleGlyphClick} onMouseEnter={this.handleGlyphMouseEnter} onMouseLeave={this.handleGlyphMouseLeave} />
					<span style={{flex: '1 1 auto'}} />
					{valueNode}
					<span style={{width:'8px'}} />
				</div>

				<Overlay show={this.state.showPopover} placement="right" target={ ()=> ReactDOM.findDOMNode(this.editAccountGlyph) }>
					<Popover id="editAccountPopover" style={PopoverStyle}>
						<Form>
							<FormGroup>
								<FormControl ref={(c)=> { this.ctrlAccountName = c; }} componentClass="input" type="text" value={accountName} />
							</FormGroup>
							<FormGroup>
								<FormControl ref={(c)=> { this.ctrlNote = c; }} componentClass="textarea" placeholder="Enter a note (not your account number)..." value={accountNote} />
							</FormGroup>
							<FormGroup>
								<ControlLabel>Today's Balance:</ControlLabel>
								<FormControl ref={(c)=> { this.ctrlAccountBalance = c; }} type="text" value={accountBalance} />
								<HelpBlock>An adjustment transaction will be created automatically if you change this amount.</HelpBlock>
							</FormGroup>
						</Form>
						<div style={{display: 'flex'}}>
							<Button onClick={this.handlePopoverCloseAccount}>
								<Glyphicon glyph="minus-sign" />&nbsp;Close Account
							</Button>
							<div style={{flex: '1 1 auto', display: 'flex', justifyContent: 'flex-end'}}>
								<Button onClick={this.handlePopoverCancel}>
									Cancel&nbsp;<Glyphicon glyph="remove-sign" />
								</Button>
								<span style={{width: '8px'}} />
								<Button onClick={this.handlePopoverOk}>
									OK&nbsp;<Glyphicon glyph="ok-sign" />
								</Button>
							</div>
						</div>
					</Popover>
				</Overlay>
			</div>				
		);
  	}
}