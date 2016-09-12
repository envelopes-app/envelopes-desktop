/// <reference path="../../../_includes.ts" />

import * as _ from 'lodash';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Form, FormControl, FormGroup, Col, ControlLabel, Overlay, Popover } from 'react-bootstrap';

import * as constants from '../../../constants';
import * as budgetEntities from '../../../interfaces/budgetEntities';
import * as objects from '../../../interfaces/objects';
import { IEntitiesCollection } from '../../../interfaces/state';
import { SimpleObjectMap } from '../../../utilities';

export interface PCategorySelectorProps { 
	selectedCategoryId:string;
	categoriesList:Array<objects.IAccountObject>;
	setSelectedCategoryId:(subCategoryId:string)=>void;
	handleTabPressed:(shiftPressed:boolean)=>void;
}

export interface PCategorySelectorState { 
	showPopover:boolean;
}

const CategorySelectorStyle = {
	borderColor: '#009CC2',
	borderTopWidth: '2px',
	borderBottomWidth: '2px',
	borderLeftWidth: '2px',
	borderRightWidth: '2px',
}

const PopoverStyle = {
	maxWidth: 'none', 
	width:'240px'
}

const ScrollableContainerStyle = {
	overflowY: "scroll",
}

export class PCategorySelector extends React.Component<PCategorySelectorProps, PCategorySelectorState> {

	private categoryInput:FormControl;
	private categoryItemRefsMap:SimpleObjectMap<HTMLLIElement> = {};

	constructor(props: any) {
        super(props);
		this.onBlur = this.onBlur.bind(this);
		this.onFocus = this.onFocus.bind(this);
		this.onChange = this.onChange.bind(this);
		this.onKeyDown = this.onKeyDown.bind(this);
		this.setSelectedCategoryId = this.setSelectedCategoryId.bind(this);
		this.state = {showPopover:false};	
	}

	private setSelectedCategoryId(subCategoryId:string) {

		// This method is called when the user selects an item from the popover using mouse click
		if(this.props.selectedCategoryId != subCategoryId) {
			this.props.setSelectedCategoryId(subCategoryId);
		}

		// Call handleTabPressed as we want to move the focus on to the next control
		this.props.handleTabPressed(false);
	}

	public showPopover():void {
		// If the popover is already showing then we dont need to do anything
		if(this.state.showPopover == false) {
			this.setState({showPopover:true});		
		}

		// Set the focus on the input control
		(ReactDOM.findDOMNode(this.categoryInput) as any).focus();
	}

	public hidePopover():void {
		// If the popover is already hidden then we dont need to do anything
		if(this.state.showPopover == true) {
			this.setState({showPopover:false});		
		}
	}

	private onFocus() {
		// If the popover is not already showing, then show it.
		this.showPopover();
	}

	private onBlur() {
		// If the popover is showing, hide it.
		this.hidePopover();
	}

	private onChange() { }

	private onKeyDown(event:KeyboardEvent):void {

		if(this.state.showPopover == true && (event.keyCode == 38 || event.keyCode == 40)) {

			// Get the currently selected categoryId
			var currentCategoryId = this.props.selectedCategoryId;
			var categories = this.props.categoriesList;
			var clickableCategories = _.filter(categories, {isMasterCategory: false});
			var index = _.findIndex(clickableCategories, {entityId: currentCategoryId});

			// Up Arrow Key
			if(event.keyCode == 38) {
				// Decrement the index to get the previous category
				index--;
				// If we have gone below 0, go back to the last index
				if(index < 0)
					index = clickableCategories.length - 1;
			}
			// Down Arrow Key
			else if(event.keyCode == 40) {
				// Increment the index to get the next account
				index++;
				// If we have gone above the last index, go back to the first index
				if(index >= clickableCategories.length)
					index = 0;
			}

			// Get the category corresponding to the index and set it as the selected category
			var newCategory = clickableCategories[index];
			this.props.setSelectedCategoryId(newCategory.entityId);

			// Get the HTML List Element corresponding to this category
			var element = this.categoryItemRefsMap[newCategory.entityId];
			var domNode = ReactDOM.findDOMNode(element);
			//this.scroll
		}
		// Tab Key
		else if(event.keyCode == 9) {
			// Prevent the default action from happening as we are manually handling it
			event.preventDefault();
			// Let the parent dialog know that tab was pressed
			this.props.handleTabPressed(event.shiftKey);
		}
	}

	public render() {

		var categoiresPopoverItem;
		var categoiresPopoverItems = [];

		// Get the currently selected category so that we can highlight the corresponding item
		var categories = this.props.categoriesList;
		var selectedCategoryId = this.props.selectedCategoryId;
		var selectedCategory = selectedCategoryId ? _.find(categories, {entityId: selectedCategoryId}) : null;

		// Create section items for master categories
		_.forEach(categories, (category:objects.ICategoryObject)=>{

			if(category.isMasterCategory) {
				// Create the list item for the master category
				categoiresPopoverItem = <li key={category.entityId} className="custom-dropdown-2list-section">{category.name}:</li>;
				categoiresPopoverItems.push(categoiresPopoverItem);
			}
			else {
				if(selectedCategory && selectedCategory.entityId == category.entityId)
					categoiresPopoverItem = <li ref={(n) => this.categoryItemRefsMap[category.entityId] = n} key={category.entityId} className="custom-dropdown-2list-item-selected" id={category.entityId}>{category.name}</li>;
				else
					categoiresPopoverItem = <li ref={(n) => this.categoryItemRefsMap[category.entityId] = n} key={category.entityId} className="custom-dropdown-2list-item" id={category.entityId} onClick={this.setSelectedCategoryId.bind(this, category.entityId)}>{category.name}</li>;

				categoiresPopoverItems.push(categoiresPopoverItem);
			}
		});

		return (
			<FormGroup onKeyDown={this.onKeyDown}>
				<Col componentClass={ControlLabel} sm={3}>
					Category
				</Col>
				<Col sm={9}>
					<FormControl ref={(n) => this.categoryInput = n } type="text" componentClass="input" style={CategorySelectorStyle} 
						onFocus={this.onFocus} onBlur={this.onBlur} onChange={this.onChange} contentEditable={true} 
						value={selectedCategory ? selectedCategory.name : ""} />
					<Overlay show={this.state.showPopover} placement="right" target={ ()=> ReactDOM.findDOMNode(this.categoryInput) }>
						<Popover id="selectCategoryPopover" style={PopoverStyle} title="Budget Categories">
							<ul className="custom-dropdown-list" style={ScrollableContainerStyle}>
								{categoiresPopoverItems}
							</ul>
						</Popover>
					</Overlay>
				</Col>
			</FormGroup>
		);
	}
}
