/// <reference path="../../../_includes.ts" />

import * as _ from 'lodash';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Button, FormGroup, FormControl, Glyphicon, Overlay, Popover } from 'react-bootstrap';

import { InternalCategories } from '../../../constants';
import * as budgetEntities from '../../../interfaces/budgetEntities';
import { IEntitiesCollection, ISimpleEntitiesCollection } from '../../../interfaces/state';

export interface PMasterCategoryEditDialogProps {
	entitiesCollection:IEntitiesCollection
	// Dispatcher Functions
	updateEntities:(entities:ISimpleEntitiesCollection)=>void;
}

export interface PMasterCategoryEditDialogState {
	show:boolean;
	target:HTMLElement;
	placement:string;
	validationState:string;
	validationMessage:string;
	masterCategory:budgetEntities.IMasterCategory;
	masterCategoryName:string;
}

const PopoverStyle:React.CSSProperties = {
	maxWidth: 'none',
	width:'400px'
}

const FormControlStyle:React.CSSProperties = {
	borderColor: "#88979D",
	borderWidth: "2px",
	borderRadius: "3px"
}

const FormControlErrorStyle:React.CSSProperties = {
	borderColor: "#D33C2D",
	borderWidth: "2px",
	borderTopLeftRadius: "3px",
	borderTopRightRadius: "3px",
	borderBottomLeftRadius: "0px",
	borderBottomRightRadius: "0px"
}

const ErrorMessageStyle:React.CSSProperties = {
	width: "100%",
	color: "#FFFFFF",
	backgroundColor: "#D33C2D",
	fontSize: "12px",
	fontWeight: "normal",
	borderTopLeftRadius: "0px",
	borderTopRightRadius: "0px",
	borderBottomLeftRadius: "3px",
	borderBottomRightRadius: "3px",
	paddingLeft: "8px",
	paddingRight: "8px",
	paddingTop: "3px",
	paddingBottom: "3px"
}

const HRStyle:React.CSSProperties = {
	marginTop: "10px",
	marginBottom: "10px"
}

const HideButtonStyle:React.CSSProperties = {
	marginRight: "10px"
}

const OkButtonStyle:React.CSSProperties = {
	marginLeft: "10px"
}

export class PMasterCategoryEditDialog extends React.Component<PMasterCategoryEditDialogProps, PMasterCategoryEditDialogState> {
	private ctrlCategoryName:FormControl;

	constructor(props: any) {
        super(props);
		this.hide = this.hide.bind(this);
		this.onChange = this.onChange.bind(this);
		this.onOkClick = this.onOkClick.bind(this);
		this.onCancelClick = this.onCancelClick.bind(this);
		this.onHideClick = this.onHideClick.bind(this);
		this.onDeleteClick = this.onDeleteClick.bind(this);
		this.state = {
			show:false, 
			target:null, 
			placement:"bottom", 
			masterCategory:null, 
			masterCategoryName:null, 
			validationState:null,
			validationMessage:null
		};
	}

	public isShowing():boolean {
		return this.state.show;
	}

	public show(masterCategoryId:string, target:HTMLElement, placement:string = "bottom"):void {

		// Get the masterCategory for the passed subCategoryId
		var masterCategory = this.props.entitiesCollection.masterCategories.getEntityById(masterCategoryId);
		if(masterCategory) {

			var state = Object.assign({}, this.state) as PMasterCategoryEditDialogState;
			state.show = true;
			state.target = target;
			state.placement = placement;
			state.masterCategory = masterCategory;
			state.masterCategoryName = masterCategory.name;
			state.validationState = null;
			state.validationMessage = null;
			this.setState(state);
		}
	}

	public hide():void {
		var state = Object.assign({}, this.state) as PMasterCategoryEditDialogState;
		state.show = false;
		state.masterCategory = null;
		state.masterCategoryName = null;
		state.validationState = null;
		state.validationMessage = null;
		this.setState(state);
	}

	private onChange(event:React.FormEvent<any>):void { 

		var updatedCategoryName = (event.target as HTMLInputElement).value;
		var state = Object.assign({}, this.state) as PMasterCategoryEditDialogState;
		state.masterCategoryName = updatedCategoryName;
		this.setState(state);
	}

	private onOkClick():void { 

		// Get the category entity that we are currently editing
		var masterCategory = this.state.masterCategory;
		var updatedMasterCategoryName = this.state.masterCategoryName;
		// Has the masterCategory name actually changed?
		if(masterCategory.name != updatedMasterCategoryName) {

			// Make sure that this new name is not already being used
			var index = _.findIndex(this.props.entitiesCollection.masterCategories.getAllItems(), (mc)=>{
				return (mc.name == updatedMasterCategoryName);
			});
		
			if(index == -1) {
				var updatedMasterCategory = Object.assign({}, masterCategory) as budgetEntities.IMasterCategory;
				// Set the category name and update the entity
				updatedMasterCategory.name = updatedMasterCategoryName;
				var updatedEntities:ISimpleEntitiesCollection = {
					masterCategories: [updatedMasterCategory]
				};
				this.props.updateEntities(updatedEntities);
				// Hide the dialog
				this.hide();
			}
			else {
				// Set the validation state for the form control
				var state = Object.assign({}, this.state) as PMasterCategoryEditDialogState;
				state.validationState = "error";
				state.validationMessage = "This category name already exists.";  
				this.setState(state);
			}
		}
		else {
			// Hide the dialog
			this.hide();
		}
	}

	private onCancelClick():void { 
		// Hide the dialog
		this.hide();
	}

	private onHideClick():void { 

		// Get the category entity that we are currently editing
		var masterCategory = this.state.masterCategory;
		var updatedMasterCategory = Object.assign({}, masterCategory) as budgetEntities.IMasterCategory;
		// Set the hidden flag and update the entity
		updatedMasterCategory.isHidden = 1;
		var updatedEntities:ISimpleEntitiesCollection = {
			masterCategories: [updatedMasterCategory]
		};
		this.props.updateEntities(updatedEntities);
		// Hide the dialog
		this.hide();
	}

	private onDeleteClick():void {

		// Get the category entity that we are currently editing
		var masterCategory = this.state.masterCategory;
		var updatedMasterCategory = Object.assign({}, masterCategory) as budgetEntities.IMasterCategory;
		// Set the tombstone flag and update the entity
		updatedMasterCategory.isTombstone = 1;
		var updatedEntities:ISimpleEntitiesCollection = {
			masterCategories: [updatedMasterCategory]
		};
		this.props.updateEntities(updatedEntities);
		// Hide the dialog
		this.hide();
	}

	public render() {

		if(this.state.show) {
			var isDebtPaymentMasterCategory = (this.state.masterCategory.internalName == InternalCategories.DebtPaymentMasterCategory);
			var element:JSX.Element;
			if(this.state.validationState == "error") {
				element = (
					<FormGroup key="formgroup">
						<FormControl type="text" componentClass="input" style={FormControlErrorStyle} 
							value={this.state.masterCategoryName ? this.state.masterCategoryName : ""}
							readOnly={isDebtPaymentMasterCategory} 
							onChange={this.onChange} ref={(c)=>{this.ctrlCategoryName = c;}}	
						/>
						<label style={ErrorMessageStyle}>{this.state.validationMessage}</label>
					</FormGroup>
				);
			}
			else {
				element = (
					<FormGroup key="formgroup">
						<FormControl type="text" componentClass="input" style={FormControlStyle} 
							value={this.state.masterCategoryName ? this.state.masterCategoryName : ""} 
							readOnly={isDebtPaymentMasterCategory} 
							onChange={this.onChange} ref={(c)=>{this.ctrlCategoryName = c;}}	
						/>
					</FormGroup>
				);
			}

			var buttonsContainer:JSX.Element;
			if(isDebtPaymentMasterCategory) {
				// Don't include the "Delete" button for the debt payment master category
				buttonsContainer = (
					<div key="buttonsContainer" className="buttons-container">
						<Button className="dialog-secondary-button" style={HideButtonStyle} onClick={this.onHideClick}>
							<Glyphicon glyph="eye-open"/>&nbsp;Hide
						</Button>
						<div className="spacer" />
						<Button className="dialog-secondary-button" onClick={this.onCancelClick}>
							Cancel&nbsp;<Glyphicon glyph="remove-circle"/>
						</Button>
						<Button className="dialog-primary-button" style={OkButtonStyle} onClick={this.onOkClick}>
							OK&nbsp;<Glyphicon glyph="ok-circle"/>
						</Button>
					</div>
				);			
			}
			else {
				buttonsContainer = (
					<div key="buttonsContainer" className="buttons-container">
						<Button className="dialog-secondary-button" style={HideButtonStyle} onClick={this.onHideClick}>
							<Glyphicon glyph="eye-open"/>&nbsp;Hide
						</Button>
						<Button className="dialog-warning-button" onClick={this.onDeleteClick}>
							<Glyphicon glyph="ban-circle"/>&nbsp;Delete
						</Button>
						<div className="spacer" />
						<Button className="dialog-secondary-button" onClick={this.onCancelClick}>
							Cancel&nbsp;<Glyphicon glyph="remove-circle"/>
						</Button>
						<Button className="dialog-primary-button" style={OkButtonStyle} onClick={this.onOkClick}>
							OK&nbsp;<Glyphicon glyph="ok-circle"/>
						</Button>
					</div>
				);			
			}

			return (
				<Overlay show={this.state.show} placement={this.state.placement} 
					rootClose={true} onHide={this.onCancelClick} target={()=> ReactDOM.findDOMNode(this.state.target)}>
					<Popover id="subCategoryEditDialog" style={PopoverStyle}>
						{element}
						<hr style={HRStyle} />
						{buttonsContainer}
					</Popover>
				</Overlay>
			);
		}
		else {
			return <div />;
		}
	}
}
