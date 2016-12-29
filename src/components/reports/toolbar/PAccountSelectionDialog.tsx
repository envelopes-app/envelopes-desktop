/// <reference path="../../../_includes.ts" />

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Glyphicon, Overlay, Popover } from 'react-bootstrap';

import { PHoverableDiv } from '../../common/PHoverableDiv';

import { TransactionFlag } from '../../../constants';
import { ITransaction, IScheduledTransaction } from '../../../interfaces/budgetEntities';
import { IEntitiesCollection } from '../../../interfaces/state';

export interface PAccountSelectionDialogProps {
	entitiesCollection:IEntitiesCollection;
}

export interface PAccountSelectionDialogState {
	show:boolean;
	target:HTMLElement;
	placement:string;
}

const PopoverStyle:React.CSSProperties = {
	maxWidth: 'none',
	width:'250px'
}

const TitleStyle:React.CSSProperties = {
	width: "100%",
	color: "#000000",
	fontSize: "18px",
	fontWeight: "normal"
}

const Separator1Style:React.CSSProperties = {
	marginTop: "0px",
	marginBottom: "8px"
}

const Separator2Style:React.CSSProperties = {
	marginTop: "8px",
	marginBottom: "8px"
}

const SelectionButtonsContainer:React.CSSProperties = {
	display: "flex",
	flexFlow: "row nowrap",
	justifyContent: 'center',
	alignItems: 'center',
}

const SelectionButtonDefaultStyle:React.CSSProperties = {
	fontSize: "14px",
	fontWeight: "normal",
	color: "#009cc2",
	backgroundColor: "#FFFFFF",
	paddingLeft: '8px',
	paddingRight: '8px',
	paddingTop: '3px',
	paddingBottom: '3px',
	borderRadius: "100px",
	marginRight: "10px",
	cursor: "pointer"
}

const SelectionButtonHoverStyle = Object.assign({}, SelectionButtonDefaultStyle, {
	color: "#FFFFFF",
	backgroundColor: "#009cc2"
});

const DialogButtonsContainer:React.CSSProperties = {
	display: "flex",
	flexFlow: "row nowrap",
	justifyContent: 'flex-end',
	alignItems: 'center',
}

export class PAccountSelectionDialog extends React.Component<PAccountSelectionDialogProps, PAccountSelectionDialogState> {

	constructor(props:PAccountSelectionDialogProps) {
        super(props);
		this.hide = this.hide.bind(this);
		this.handleSelectAllClicked = this.handleSelectAllClicked.bind(this);
		this.handleSelectNoneClicked = this.handleSelectNoneClicked.bind(this);
		this.handleCancelClicked = this.handleCancelClicked.bind(this);
		this.handleOkClicked = this.handleOkClicked.bind(this);
		this.state = {
			show:false, 
			target:null, 
			placement:"bottom"
		};
	}

	public isShowing():boolean {
		return this.state.show;
	}
	
	public show(target:HTMLElement, placement:string = "left"):void {

		// Get the subCategory for the passed subCategoryId
		var state = Object.assign({}, this.state) as PAccountSelectionDialogState;
		state.show = true;
		state.target = target;
		state.placement = placement;
		this.setState(state);
	}

	public hide():void {
		var state = Object.assign({}, this.state) as PAccountSelectionDialogState;
		state.show = false;
		this.setState(state);
	}

	private handleSelectAllClicked(event:React.MouseEvent<any>):void {

	}

	private handleSelectNoneClicked(event:React.MouseEvent<any>):void {

	}

	private handleCancelClicked(event:React.MouseEvent<any>):void {

	}

	private handleOkClicked(event:React.MouseEvent<any>):void {

	}
	

	private getListItem(flagColorName:string, selected:boolean = false) {

		var flagColor = TransactionFlag.getFlagColor(flagColorName);
		var flagTextColor = TransactionFlag.getFlagTextColor(flagColorName);

		if(selected) {
			return (
				<div key={flagColorName} className="flag-dropdown-list-item-selected" style={{backgroundColor:flagColor}} onClick={null}>
					<button className="flag-dropdown-list-item-button" style={{backgroundColor:flagTextColor, borderColor:flagTextColor}}>{flagColorName}</button>
					<Glyphicon glyph="ok-circle" style={{color:'white'}}/>
				</div>
			);
		}
		else {
			return (
				<div key={flagColorName} className="flag-dropdown-list-item" style={{backgroundColor:flagColor}} onClick={null}>
					<button className="flag-dropdown-list-item-button" style={{backgroundColor:flagTextColor, borderColor:flagTextColor}}>{flagColorName}</button>
				</div>
			);
		}
	}

	public render() {

		if(this.state.show) {
			var flag:string = "Red";
			
			var flagPopoverItems = [
				this.getListItem("None", flag === 'None'),
				this.getListItem("Red", flag === 'Red'),
				this.getListItem("Orange", flag === 'Orange'),
				this.getListItem("Yellow", flag === 'Yellow'),
				this.getListItem("Green", flag === 'Green'),
				this.getListItem("Blue", flag === 'Blue'),
				this.getListItem("Purple", flag === 'Purple')
			];

			return (
				<Overlay key="overlay" rootClose={true} show={this.state.show} placement={this.state.placement} 
					onHide={this.hide} target={ ()=> ReactDOM.findDOMNode(this.state.target) }>
					<Popover id="selectReportAccountsPopover" style={PopoverStyle}>
						<div style={TitleStyle}>Accounts</div>
						<hr style={Separator1Style} />

						<div style={SelectionButtonsContainer}>
							<PHoverableDiv 
								defaultStyle={SelectionButtonDefaultStyle} 
								hoverStyle={SelectionButtonHoverStyle} 
								onClick={this.handleSelectAllClicked}>
								Select All
							</PHoverableDiv> 
							<PHoverableDiv 
								defaultStyle={SelectionButtonDefaultStyle} 
								hoverStyle={SelectionButtonHoverStyle} 
								onClick={this.handleSelectNoneClicked}>
								Select None
							</PHoverableDiv> 
						</div>
						<hr style={Separator2Style} />

						<ul className="flag-dropdown-list">
							{flagPopoverItems}
						</ul>

						<hr style={Separator2Style} />
						<div className="buttons-container">
							<div className="spacer" />
							<button className="dialog-secondary-button" onClick={this.handleCancelClicked}> 
								Cancel&nbsp;<Glyphicon glyph="remove-circle"/>
							</button>
							<div style={{width:"8px"}} />
							<button className="dialog-primary-button" onClick={this.handleOkClicked}> 
								Done&nbsp;<Glyphicon glyph="ok-circle"/>
							</button>
						</div>
					</Popover>
				</Overlay>
			);
		}
		else {
			return <div />;
		}
	}
}
