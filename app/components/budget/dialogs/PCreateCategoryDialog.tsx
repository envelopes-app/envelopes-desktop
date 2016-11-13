/// <reference path="../../../_includes.ts" />

import * as _ from 'lodash';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Overlay, Popover, Button, Glyphicon, FormGroup, FormControl } from 'react-bootstrap';

import { EntityFactory } from '../../../persistence';
import * as budgetEntities from '../../../interfaces/budgetEntities';
import { IEntitiesCollection, ISimpleEntitiesCollection } from '../../../interfaces/state';

export interface PCreateCategoryDialogProps {
	entitiesCollection:IEntitiesCollection
	// Dispatcher Functions
	updateEntities:(entities:ISimpleEntitiesCollection)=>void;
}

export interface PCreateCategoryDialogState {
	show:boolean;
	target:HTMLElement;
	placement:string;
	validationState:string;
	validationMessage:string;
	masterCategoryId:string;
	categoryName:string;
	placeholder:string;
}

const PopoverStyle:React.CSSProperties = {
	maxWidth: 'none',
	width:'250px'
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

const OkButtonStyle:React.CSSProperties = {
	marginLeft: "10px"
}

export class PCreateCategoryDialog extends React.Component<PCreateCategoryDialogProps, PCreateCategoryDialogState> {

	private ctrlCategoryName:FormControl;

	constructor(props: any) {
        super(props);
		this.hide = this.hide.bind(this);
		this.onChange = this.onChange.bind(this);
		this.onOkClick = this.onOkClick.bind(this);
		this.onCancelClick = this.onCancelClick.bind(this);
		this.state = {
			show:false, 
			target:null, 
			placement:"bottom", 
			masterCategoryId:null,
			categoryName:null, 
			placeholder:null,
			validationState:null,
			validationMessage:null
		};
	}

	private onChange(event:React.FormEvent<any>):void { 

		var updatedCategoryName = (event.target as HTMLInputElement).value;
		var state = _.assign({}, this.state) as PCreateCategoryDialogState;
		state.categoryName = updatedCategoryName;
		this.setState(state);
	}

	public isShowing():boolean {
		return this.state.show;
	}

	// If the dialog is being shown to create a master category, the parameter would be null.
	// If it is for creating a subcategory, this would be the id for the parent master category.
	public show(masterCategoryId:string, target:HTMLElement, placement:string = "bottom"):void {

		var state = _.assign({}, this.state) as PCreateCategoryDialogState;
		state.show = true;
		state.target = target;
		state.placement = placement;
		state.masterCategoryId = masterCategoryId;
		state.placeholder = masterCategoryId ? "New Category" : "New Category Group";
		state.validationState = null;
		state.validationMessage = null;
		this.setState(state);
	}

	public hide():void {
		var state = _.assign({}, this.state) as PCreateCategoryDialogState;
		state.show = false;
		state.validationState = null;
		state.validationMessage = null;
		this.setState(state);
	}

	private onOkClick():void { 

		// Get the category name that the user entered
		var categoryName = this.state.categoryName;
		if(this.state.masterCategoryId) {

			// Make sure that this name is not already being used for any other subcategory
			var index = _.findIndex(this.props.entitiesCollection.subCategories.getAllItems(), (sc)=>{
				return (sc.name == categoryName);
			});
		
			if(index == -1) {
				var subCategory = EntityFactory.createNewSubCategory();
				// Set the master category id and category name and send it for saving
				subCategory.masterCategoryId = this.state.masterCategoryId;
				subCategory.name = categoryName;
				subCategory.sortableIndex = this.props.entitiesCollection.subCategories.getSortableIndexForNewSubCategoryInsertionAtBottom(this.state.masterCategoryId);
				var updatedEntities:ISimpleEntitiesCollection = {
					subCategories: [subCategory]
				};
				this.props.updateEntities(updatedEntities);
				// Hide the dialog
				this.hide();
			}
			else {
				// Set the validation state for the form control
				var state = _.assign({}, this.state) as PCreateCategoryDialogState;
				state.validationState = "error";
				state.validationMessage = "This category name already exists.";  
				this.setState(state);
			}
		}
		else {

			// Make sure that this name is not already being used for any other subcategory
			var index = _.findIndex(this.props.entitiesCollection.masterCategories.getAllItems(), (mc)=>{
				return (mc.name == categoryName);
			});
		
			if(index == -1) {
				var masterCategory = EntityFactory.createNewMasterCategory();
				// Set the category name and send it for saving
				masterCategory.name = categoryName;
				masterCategory.sortableIndex = this.props.entitiesCollection.masterCategories.getSortableIndexForNewMasterCategoryInsertion();
				var updatedEntities:ISimpleEntitiesCollection = {
					masterCategories: [masterCategory]
				};
				this.props.updateEntities(updatedEntities);
				// Hide the dialog
				this.hide();
			}
			else {
				// Set the validation state for the form control
				var state = _.assign({}, this.state) as PCreateCategoryDialogState;
				state.validationState = "error";
				state.validationMessage = "This category name already exists.";  
				this.setState(state);
			}
		}
	}

	private onCancelClick():void { 
		// Hide the dialog
		this.hide();
	}

	public render() {

		if(this.state.show) {
			var element:JSX.Element;
			if(this.state.validationState == "error") {
				element = (
					<FormGroup key="formgroup">
						<FormControl type="text" componentClass="input" style={FormControlErrorStyle} 
							value={this.state.categoryName ? this.state.categoryName : ""} 
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
							onChange={this.onChange} ref={(c)=>{this.ctrlCategoryName = c;}}	
							placeholder={this.state.placeholder}
						/>
					</FormGroup>
				);
			}

			return (
				<Overlay show={this.state.show} placement={this.state.placement} 
					rootClose={true} onHide={this.onCancelClick} target={()=> ReactDOM.findDOMNode(this.state.target)}>
					<Popover id="createCategoryDialog" style={PopoverStyle}>
						{element}
						<hr style={HRStyle} />
						<div className="buttons-container">
							<Button className="dialog-secondary-button" onClick={this.onCancelClick}>
								Cancel&nbsp;<Glyphicon glyph="remove-circle"/>
							</Button>
							<Button className="dialog-primary-button" style={OkButtonStyle} onClick={this.onOkClick}>
								OK&nbsp;<Glyphicon glyph="ok-circle"/>
							</Button>
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
