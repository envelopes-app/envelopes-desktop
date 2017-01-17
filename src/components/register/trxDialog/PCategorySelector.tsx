/// <reference path="../../../_includes.ts" />

import * as _ from 'lodash';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Form, FormControl, FormGroup, Col, ControlLabel, Overlay, Popover } from 'react-bootstrap';

import * as constants from '../../../constants';
import * as budgetEntities from '../../../interfaces/budgetEntities';
import * as objects from '../../../interfaces/objects';
import { IEntitiesCollection } from '../../../interfaces/state';
import { DataFormatter, SimpleObjectMap } from '../../../utilities';

export interface PCategorySelectorProps { 
	dataFormatter:DataFormatter;
	activeField:string;
	selectorLabel:string;
	selectorLabelPosition?:string;
	selectedCategoryId:string;
	manuallyEnteredCategoryName:string;
	categoryNotRequired:boolean;
	categoriesList:Array<objects.ICategoryObject>;
	setActiveField?:(activeField:string)=>void;
	setSelectedCategoryId:(subCategoryId:string, clearManuallyEnteredCategoryName?:boolean, callback?:()=>any)=>void;
	setManuallyEnteredCategoryName:(categoryName:string)=>void;
	handleTabPressed:(shiftPressed:boolean)=>void;
}

const CategorySelectorStyle:React.CSSProperties = {
	borderColor: '#2FA2B5',
	borderWidth: '2px'
}

const PopoverStyle:React.CSSProperties = {
	maxWidth: 'none', 
	width:'260px'
}

const ScrollableContainerStyle:React.CSSProperties = {
	overflowY: "auto",
}

export class PCategorySelector extends React.Component<PCategorySelectorProps, {}> {

	private categoryInput:FormControl;
	private categoryItemRefsMap:SimpleObjectMap<HTMLElement> = {};

	constructor(props:PCategorySelectorProps) {
        super(props);
		this.onFocus = this.onFocus.bind(this);
		this.onChange = this.onChange.bind(this);
		this.onKeyDown = this.onKeyDown.bind(this);
	}

	private setSelectedCategoryId(subCategoryId:string) {

		// This method is called when the user selects an item from the popover using mouse click
		if(this.props.selectedCategoryId != subCategoryId) {
			this.props.setSelectedCategoryId(subCategoryId, true, ()=>{
				// Call handleTabPressed as we want to move the focus on to the next control
				this.props.handleTabPressed(false);
			});
		}
	}

	private onFocus():void {
		if(this.props.activeField != "category" && this.props.setActiveField)
			this.props.setActiveField("category");
	}

	public setFocus():void {
		// Set the focus on the input control
		var domNode = ReactDOM.findDOMNode(this.categoryInput) as any;
		domNode.focus();
		domNode.select();
	}

	private onChange(event:React.FormEvent<any>) { 

		// Get the entered value from the category input control and pass to the transaction dialog
		var value = (event.target as any).value;
		this.props.setManuallyEnteredCategoryName(value);
	}

	private onKeyDown(event:React.KeyboardEvent<any>):void {

		if(this.props.activeField == "category" && (event.keyCode == 38 || event.keyCode == 40)) {

			// Get the currently selected categoryId
			var currentCategoryId = this.props.selectedCategoryId;
			var categories = this.getFilteredCategories();
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
			
			this.props.setSelectedCategoryId(this.props.selectedCategoryId, true);
			// Prevent the default action from happening as we are manually handling it
			event.preventDefault();
			// Let the parent dialog know that tab was pressed
			this.props.handleTabPressed(event.shiftKey);
		}
	}

	private getFilteredCategories():Array<objects.ICategoryObject> {

		var filteredCategoriesList = this.props.categoriesList;
		if(this.props.manuallyEnteredCategoryName && this.props.manuallyEnteredCategoryName != "") {

			// Filter the list of categoris by the manuallyEnteredCategoryName
			var filteredCategoriesList = _.filter(filteredCategoriesList, (categoryObj:objects.ICategoryObject)=>{
				return (categoryObj.isMasterCategory || categoryObj.name.includes(this.props.manuallyEnteredCategoryName));
			});

			// We also want to remove all those master catgories that do not have any subcategories below them
			// after the applying the above filter. Iterate through the list and take count of subcategories 
			// for each of the master category.
			var categoriesCounter:SimpleObjectMap<number> = {};
			_.forEach(filteredCategoriesList, (categoryObj)=>{

				if(categoryObj.isMasterCategory == false) {
					var counter = categoriesCounter[categoryObj.masterCategoryId] ? categoriesCounter[categoryObj.masterCategoryId] + 1 : 1;
					categoriesCounter[categoryObj.masterCategoryId] = counter;
				}
			});

			// Now filter out those master categories which do not have any subcategories below them
			filteredCategoriesList = _.filter(filteredCategoriesList, (categoryObj)=>{
				return (
					categoryObj.isMasterCategory == false || 
					(categoryObj.isMasterCategory && categoriesCounter[categoryObj.entityId])
				);
			});
		}

		return filteredCategoriesList;
	}

	private getCategoriesDisplayList(categoriesList:Array<objects.ICategoryObject>, selectedCategoryId:string):JSX.Element {

		var categoiresPopoverItem;
		var categoiresPopoverItems = [];
		var dataFormatter = this.props.dataFormatter;
		
		// Get the currently selected category so that we can highlight the corresponding item
		var selectedCategory = selectedCategoryId ? _.find(this.props.categoriesList, {entityId: selectedCategoryId}) : null;

		// Iterate through the passed categories and create list items for them
		_.forEach(categoriesList, (category:objects.ICategoryObject)=>{

			if(category.isMasterCategory) {
				// Create the list item for the master category
				categoiresPopoverItem = <li key={category.entityId} className="categories-dropdown-list-section" title={category.name}>{category.name}:</li>;
				categoiresPopoverItems.push(categoiresPopoverItem);
			}
			else {
				var availableAmountString = dataFormatter.formatCurrency(category.availableAmount);

				var availableAmountClassName = "categories-dropdown-list-positive-available-amount";
				if(category.availableAmount == 0)
					availableAmountClassName = "categories-dropdown-list-zero-available-amount";
				else if(category.availableAmount < 0)
					availableAmountClassName = "categories-dropdown-list-negative-available-amount";

				if(selectedCategory && selectedCategory.entityId == category.entityId) {
					categoiresPopoverItem = (
						<div ref={(n) => this.categoryItemRefsMap[category.entityId] = n} key={category.entityId} 
								className="categories-dropdown-list-item-selected" id={category.entityId}>
							<label className="categories-dropdown-list-categoryname" title={category.name}>{category.name}</label>
							<label className={availableAmountClassName} title={availableAmountString}>{availableAmountString}</label>
						</div>
					);
				}
				else {
					categoiresPopoverItem = (
						<div ref={(n) => this.categoryItemRefsMap[category.entityId] = n} key={category.entityId} 
								className="categories-dropdown-list-item" id={category.entityId} 
								onClick={this.setSelectedCategoryId.bind(this, category.entityId)}>
							<label className="categories-dropdown-list-categoryname" title={category.name}>{category.name}</label>
							<label className={availableAmountClassName} title={availableAmountString}>{availableAmountString}</label>
						</div>
					);
				}

				categoiresPopoverItems.push(categoiresPopoverItem);
			}
		});

		return (
			<ul className="categories-dropdown-list" style={ScrollableContainerStyle}>
				{categoiresPopoverItems}
			</ul>
		);
	}

	public render() {

		// Get the currently selected category so that we can highlight the corresponding item
		var selectedCategoryId = this.props.selectedCategoryId;
		var selectedCategory = selectedCategoryId ? _.find(this.props.categoriesList, {entityId: selectedCategoryId}) : null;

		// Do we have a manuallyEnteredCategoryName for the input box. If we have, then set that in the input box.
		// If not, then check if we have a selected input. If so, then set the name of the selected category in the input box.
		// If neither of the above is true, set it as blank.
		var categoryValue = "";
		if(this.props.manuallyEnteredCategoryName && this.props.manuallyEnteredCategoryName != "") {
			// Show the manuallyEnteredCategoryName in the category input box
			categoryValue = this.props.manuallyEnteredCategoryName;
		}
		else if(selectedCategory) {
			categoryValue = selectedCategory.fullName;
		}

		var filteredCategoriesList = this.getFilteredCategories();
		var popoverContents = this.getCategoriesDisplayList(filteredCategoriesList, this.props.selectedCategoryId);

		if(!this.props.selectorLabelPosition || this.props.selectorLabelPosition == "left") {
			return (
				<FormGroup onKeyDown={this.onKeyDown}>
					<Col componentClass={ControlLabel} sm={3}>
						{this.props.selectorLabel}
					</Col>
					<Col sm={9}>
						<FormControl ref={(n) => this.categoryInput = n } type="text" componentClass="input" style={CategorySelectorStyle} 
							onFocus={this.onFocus} onChange={this.onChange} readOnly={this.props.categoryNotRequired}
							value={this.props.categoryNotRequired ? "category not required" : categoryValue} 
							disabled={this.props.categoryNotRequired} />
						<Overlay show={this.props.activeField == "category"} placement="right" target={ ()=> ReactDOM.findDOMNode(this.categoryInput) }>
							<Popover id="selectCategoryPopover" style={PopoverStyle} title="Budget Categories">
								{popoverContents}
							</Popover>
						</Overlay>
					</Col>
				</FormGroup>
			);
		}
		else { // this.props.selectorLabelPosition == "top"
			return (
				<FormGroup onKeyDown={this.onKeyDown}>
					<ControlLabel>{this.props.selectorLabel}</ControlLabel>
					<FormControl ref={(n) => this.categoryInput = n } type="text" componentClass="input" style={CategorySelectorStyle} 
						onFocus={this.onFocus} onChange={this.onChange} value={categoryValue} />
					<Overlay show={this.props.activeField == "category"} placement="right" target={ ()=> ReactDOM.findDOMNode(this.categoryInput) }>
						<Popover id="selectCategoryPopover" style={PopoverStyle} title="Budget Categories">
							{popoverContents}
						</Popover>
					</Overlay>
				</FormGroup>
			);
		}
	}
}
