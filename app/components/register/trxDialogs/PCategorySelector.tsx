/// <reference path="../../../_includes.ts" />

import * as _ from 'lodash';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Form, FormControl, FormGroup, Col, ControlLabel, Glyphicon, Overlay, Popover } from 'react-bootstrap';

import * as constants from '../../../constants';
import * as budgetEntities from '../../../interfaces/budgetEntities';
import { IEntitiesCollection } from '../../../interfaces/state';

export interface PCategorySelectorProps { 
	selectedCategoryId:string;
	// entities collections from the global state 
	entitiesCollection:IEntitiesCollection;
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

export class PCategorySelector extends React.Component<PCategorySelectorProps, {showPopover:boolean, selectedCategory:budgetEntities.ISubCategory}> {

	private categoryInput:FormControl;

	constructor(props: any) {
        super(props);
		this.onFocus = this.onFocus.bind(this);
		this.onBlur = this.onBlur.bind(this);
		this.setSelectedCategory = this.setSelectedCategory.bind(this);
		this.state = {showPopover:false, selectedCategory: null};	
	}

	private onFocus() {
		var state:any = _.assign({}, this.state);
		state.showPopover = true;
		this.setState(state);
	}

	private onBlur() {
		// this.setState({showPopover:false});
	}

	private setSelectedCategory(entityId:string) {
		// Get the category from the list of categories that corresponds to this entityId
		var selectedCategory = this.props.entitiesCollection.subCategories[entityId];
		var state:any = _.assign({}, this.state);
		state.selectedCategory = selectedCategory;
		this.setState(state);
	}

	public render() {

		var categoiresPopoverItem;
		var categoiresPopoverItems = [];

		// Get the currently selected category from state so that we can highlight the corresponding item
		var selectedCategory = this.state.selectedCategory;
		var masterCategories = this.props.entitiesCollection.masterCategories;
		var subCategories = this.props.entitiesCollection.subCategories;
		var immediateIncomeSubCategory = subCategories.getImmediateIncomeSubCategory();

		// At the top, we are going to add a list item for "inflow" and "To be Budgeted"
		categoiresPopoverItem = <li key="inflow" className="custom-dropdown-2list-section">Inflow:</li>;
		categoiresPopoverItems.push(categoiresPopoverItem);
		if(selectedCategory && selectedCategory.internalName == constants.InternalCategories.ImmediateIncomeSubCategory)
			categoiresPopoverItem = <li key={immediateIncomeSubCategory.entityId} className="custom-dropdown-2list-item-selected" id={immediateIncomeSubCategory.entityId}>To be Budgeted</li>;
		else
			categoiresPopoverItem = <li key={immediateIncomeSubCategory.entityId} className="custom-dropdown-2list-item" id={immediateIncomeSubCategory.entityId} onClick={this.setSelectedCategory.bind(this, immediateIncomeSubCategory.entityId)}>To be Budgeted</li>;

		categoiresPopoverItems.push(categoiresPopoverItem);

		// Create section items for master categories
		_.forEach(masterCategories, (masterCategory:budgetEntities.IMasterCategory)=>{

			// Filter out the internal, debt and hidden master categories
			if(masterCategory.internalName != constants.InternalCategories.InternalMasterCategory && 
				masterCategory.internalName != constants.InternalCategories.HiddenMasterCategory && 
				masterCategory.internalName != constants.InternalCategories.DebtPaymentMasterCategory) {

				// Create the list item for the master category
				categoiresPopoverItem = <li key={masterCategory.entityId} className="custom-dropdown-2list-section">{masterCategory.name}:</li>;
				categoiresPopoverItems.push(categoiresPopoverItem);
				// Iterate through all the subCategories, and create items for subCategories belonging to this master category
				_.forEach(subCategories, (subCategory)=>{

					if(subCategory.masterCategoryId == masterCategory.entityId && subCategory.isTombstone == 0) {

						if(selectedCategory && selectedCategory.entityId == subCategory.entityId)
							categoiresPopoverItem = <li key={subCategory.entityId} className="custom-dropdown-2list-item-selected" id={subCategory.entityId}>{subCategory.name}</li>;
						else
							categoiresPopoverItem = <li key={subCategory.entityId} className="custom-dropdown-2list-item" id={subCategory.entityId} onClick={this.setSelectedCategory.bind(this, subCategory.entityId)}>{subCategory.name}</li>;

						categoiresPopoverItems.push(categoiresPopoverItem);
					}
				});
			}
		});

		return (
			<FormGroup>
				<Col componentClass={ControlLabel} sm={3}>
					Category
				</Col>
				<Col sm={9}>
					<FormControl ref={(n) => this.categoryInput = n } type="text" componentClass="input" style={CategorySelectorStyle} 
						onFocus={this.onFocus} onBlur={this.onBlur} contentEditable={false} 
						defaultValue={this.state.selectedCategory ? this.state.selectedCategory.name : ""} />
					<Overlay show={this.state.showPopover} placement="right" target={ ()=> ReactDOM.findDOMNode(this.categoryInput) }>
						<Popover id="selectCategoryPopover" style={PopoverStyle} title="Budget Categories">
							<div style={ScrollableContainerStyle}>
								<ul className="custom-dropdown-list">
									{categoiresPopoverItems}
								</ul>
							</div>
						</Popover>
					</Overlay>
				</Col>
			</FormGroup>
		);
	}
}
