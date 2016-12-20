/// <reference path="../../../_includes.ts" />

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Checkbox, Glyphicon, Overlay, Popover } from 'react-bootstrap';

import { IRegisterState } from '../../../interfaces/state';

export interface PRegisterSettingsDialogProps {
	showPayeeSettingsDialog:()=>void;
	updateRegisterState:(registerState:IRegisterState)=>void;
}

export interface PRegisterSettingsDialogState {
	show:boolean;
	target:HTMLElement;
	placement:string;
	registerState:IRegisterState;
}

const PopoverStyle:React.CSSProperties = {
	maxWidth: 'none',
	width:'240px'
}

export class PRegisterSettingsDialog extends React.Component<PRegisterSettingsDialogProps, PRegisterSettingsDialogState> {

	constructor(props:PRegisterSettingsDialogProps) {
        super(props);
		this.hide = this.hide.bind(this);
		this.showPayeeSettingsDialog = this.showPayeeSettingsDialog.bind(this);
		this.onShowCheckColumnChange = this.onShowCheckColumnChange.bind(this);
		this.onShowClearedColumnChange = this.onShowClearedColumnChange.bind(this);
		this.onShowFlagColumnChange = this.onShowFlagColumnChange.bind(this);
		this.onShowMemoColumnChange = this.onShowMemoColumnChange.bind(this);
		this.state = {
			show:false, 
			target:null, 
			placement:"bottom",
			registerState:null
		};
	}

	public isShowing():boolean {
		return this.state.show;
	}
	
	public show(registerState:IRegisterState, target:HTMLElement, placement:string = "bottom"):void {

		var state = Object.assign({}, this.state) as PRegisterSettingsDialogState;
		state.show = true;
		state.target = target;
		state.placement = placement;
		state.registerState = registerState;
		this.setState(state);
	}

	public hide():void {
		var state = Object.assign({}, this.state) as PRegisterSettingsDialogState;
		state.show = false;
		state.registerState = null;
		this.setState(state);
	}

	private onShowCheckColumnChange(event:React.FormEvent<any>):void {

		var state = Object.assign({}, this.state) as PRegisterSettingsDialogState;
		state.registerState.showCheckColumn = !state.registerState.showCheckColumn;
		this.setState(state);

		this.props.updateRegisterState(state.registerState);
	}

	private onShowClearedColumnChange(event:React.FormEvent<any>):void {

		var state = Object.assign({}, this.state) as PRegisterSettingsDialogState;
		state.registerState.showClearedColumn = !state.registerState.showClearedColumn;
		this.setState(state);

		this.props.updateRegisterState(state.registerState);
	}

	private onShowFlagColumnChange(event:React.FormEvent<any>):void {

		var state = Object.assign({}, this.state) as PRegisterSettingsDialogState;
		state.registerState.showFlagColumn = !state.registerState.showFlagColumn;
		this.setState(state);

		this.props.updateRegisterState(state.registerState);
	}

	private onShowMemoColumnChange(event:React.FormEvent<any>):void {

		var state = Object.assign({}, this.state) as PRegisterSettingsDialogState;
		state.registerState.showMemoColumn = !state.registerState.showMemoColumn;
		this.setState(state);

		this.props.updateRegisterState(state.registerState);
	}

	private showPayeeSettingsDialog():void {

		this.hide();
		this.props.showPayeeSettingsDialog();
	}

	private getRegisterSettingItems():Array<JSX.Element> {

		var registerState = this.state.registerState;
		var registerSettingItems:Array<JSX.Element> = [
			<div key="show-payee-dialog" className="menu-item" onClick={this.showPayeeSettingsDialog}>
				<Glyphicon glyph="user" />
				&nbsp;Payee Settings
			</div>,
			<div key="separator" className="menu-item-separator" />,
			<div key="show-register-columns" className="menu-parent-item">
				<Glyphicon glyph="list-alt" />
				&nbsp;Register Columns
			</div>,
			<div key="show-flag-column" className="register-settings-dropdown-list-item">
				<Checkbox checked={registerState.showFlagColumn} onChange={this.onShowFlagColumnChange}>Show Flag Column</Checkbox>
			</div>,
			<div key="show-check-column" className="register-settings-dropdown-list-item">
				<Checkbox checked={registerState.showCheckColumn} onChange={this.onShowCheckColumnChange}>Show Check Column</Checkbox>
			</div>,
			<div key="show-memo-column" className="register-settings-dropdown-list-item">
				<Checkbox checked={registerState.showMemoColumn} onChange={this.onShowMemoColumnChange}>Show Memo Column</Checkbox>
			</div>,
			<div key="show-cleared-column" className="register-settings-dropdown-list-item">
				<Checkbox checked={registerState.showClearedColumn} onChange={this.onShowClearedColumnChange}>Show Cleared Column</Checkbox>
			</div>
		]; 

		return registerSettingItems;
	}

	public render() {

		if(this.state.show) {

			var registerSettingItems = this.getRegisterSettingItems();
			return (
				<Overlay key="overlay" rootClose={true} show={this.state.show} placement={this.state.placement} 
					onHide={this.hide} target={ ()=> ReactDOM.findDOMNode(this.state.target) }>
					<Popover id="registerSettingsPopover" style={PopoverStyle}>
						<ul className="register-settings-dropdown-list">
							{registerSettingItems}
						</ul>
					</Popover>
				</Overlay>
			);
		}
		else {
			return <div />;
		}
	}
}
