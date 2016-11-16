/// <reference path="../../../_includes.ts" />

import * as _ from 'lodash';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Button, Overlay, Popover } from 'react-bootstrap';

import { DateWithoutTime } from '../../../utilities/';
import * as budgetEntities from '../../../interfaces/budgetEntities';
import { IEntitiesCollection, ISimpleEntitiesCollection } from '../../../interfaces/state';

export interface PHiddenCategoriesDialogProps {
	entitiesCollection:IEntitiesCollection
	// Dispatcher Functions
	updateEntities:(entities:ISimpleEntitiesCollection)=>void;
}

export interface PHiddenCategoriesDialogState {
	show:boolean;
	target:HTMLElement;
	placement:string;
}

const PopoverStyle:React.CSSProperties = {
	maxWidth: 'none',
	width:'260px'
}

const ShowAllButtonStyle:React.CSSProperties = {
	flex: "1 1 auto"
}

export class PHiddenCategoriesDialog extends React.Component<PHiddenCategoriesDialogProps, PHiddenCategoriesDialogState> {

	constructor(props: any) {
        super(props);
		this.hide = this.hide.bind(this);
		this.onUnhideSubCategory = this.onUnhideSubCategory.bind(this);
		this.onUnhideMasterCategory = this.onUnhideMasterCategory.bind(this);
		this.onUnhideAllClick = this.onUnhideAllClick.bind(this);
		this.state = {
			show:false, 
			target:null, 
			placement:"left" 
		};
	}

	public isShowing():boolean {
		return this.state.show;
	}

	private onUnhideSubCategory(subCategoryId:string):void {

		var changedEntities:ISimpleEntitiesCollection = {
			subCategories: [],
			masterCategories: []
		}

		// Unhide the passed subcategory. If it's parent master category is hidden, unhide that as well.
		var masterCategoriesArray = this.props.entitiesCollection.masterCategories;
		var subCategoriesArray = this.props.entitiesCollection.subCategories;
		var subCategory = subCategoriesArray.getEntityById(subCategoryId);
		var masterCategory = masterCategoriesArray.getEntityById(subCategory.masterCategoryId);

		if(masterCategory.isHidden == 1) {
			masterCategory = Object.assign({}, masterCategory);
			masterCategory.isHidden = 0;
			changedEntities.masterCategories.push(masterCategory);
		}

		subCategory = Object.assign({}, subCategory);
		subCategory.isHidden = 0;
		changedEntities.subCategories.push(subCategory);

		// Persist the updated entities
		this.props.updateEntities(changedEntities);
		this.hide();
	}

	private onUnhideMasterCategory(masterCategoryId:string):void {

		var changedEntities:ISimpleEntitiesCollection = {
			subCategories: [],
			masterCategories: []
		}

		// Unhide the passed master category
		// Also iterate through all it's subcategories and unhide all that are hidden
		var masterCategoriesArray = this.props.entitiesCollection.masterCategories;
		var subCategoriesArray = this.props.entitiesCollection.subCategories;
		var hiddenSubCategories = subCategoriesArray.getHiddenSubCategories();

		var masterCategory = masterCategoriesArray.getEntityById(masterCategoryId);
		masterCategory = Object.assign({}, masterCategory);
		masterCategory.isHidden = 0;
		changedEntities.masterCategories.push(masterCategory);

		_.forEach(hiddenSubCategories, (subCategory)=>{

			if(subCategory.masterCategoryId == masterCategoryId && subCategory.isHidden == 1) {
				subCategory = Object.assign({}, subCategory);
				subCategory.isHidden = 0;
				changedEntities.subCategories.push(subCategory);
			}
		});

		// Persist the updated entities
		this.props.updateEntities(changedEntities);
		this.hide();
	}

	private onUnhideAllClick():void { 

		var changedEntities:ISimpleEntitiesCollection = {
			subCategories: [],
			masterCategories: []
		}

		// Iterate through all the master and subcategories and unhide all that are hidden
		var masterCategoriesArray = this.props.entitiesCollection.masterCategories;
		var subCategoriesArray = this.props.entitiesCollection.subCategories;
		var hiddenSubCategories = subCategoriesArray.getHiddenSubCategories();

		_.forEach(masterCategoriesArray.getAllItems(), (masterCategory)=>{

			if(masterCategory.isHidden == 1) {
				masterCategory = Object.assign({}, masterCategory);
				masterCategory.isHidden = 0;
				changedEntities.masterCategories.push(masterCategory);
			}
		});

		_.forEach(hiddenSubCategories, (subCategory)=>{

			if(subCategory.isHidden == 1) {
				subCategory = Object.assign({}, subCategory);
				subCategory.isHidden = 0;
				changedEntities.subCategories.push(subCategory);
			}
		});

		// Persist the updated entities
		this.props.updateEntities(changedEntities);
		this.hide();
	}
	
	public show(target:HTMLElement, placement:string = "left"):void {

		// Get the subCategory for the passed subCategoryId
		var state = Object.assign({}, this.state) as PHiddenCategoriesDialogState;
		state.show = true;
		state.target = target;
		state.placement = placement;
		this.setState(state);
	}

	public hide():void {
		var state = Object.assign({}, this.state) as PHiddenCategoriesDialogState;
		state.show = false;
		this.setState(state);
	}

	private getHiddenCategoryItems():Array<JSX.Element> {

		var categoryItems:Array<JSX.Element> = [];
		if(!this.props.entitiesCollection.masterCategories)
			return categoryItems;

		var masterCategoriesArray = this.props.entitiesCollection.masterCategories;
		var subCategoriesArray = this.props.entitiesCollection.subCategories;
		var hiddenSubCategories = subCategoriesArray.getHiddenSubCategories();

		// Iterate through all the master categories 
		_.forEach(masterCategoriesArray.getAllItems(), (masterCategory)=>{

			if(masterCategory.isHidden == 1) {
				// Add an item for this master category, and all it's subcategories
				categoryItems.push(<ul key={masterCategory.entityId} className="hidden-categories-master-category-selectable" onClick={this.onUnhideMasterCategory.bind(this, masterCategory.entityId)}>{masterCategory.name}</ul>);
				var subCategories = subCategoriesArray.getAllSubCategoriesForMasterCategory(masterCategory.entityId);
				_.forEach(subCategories, (subCategory)=>{
					categoryItems.push(<ul key={subCategory.entityId} className="hidden-categories-subcategory" onClick={this.onUnhideSubCategory.bind(this, subCategory.entityId)}>{subCategory.name}</ul>);
				});
			}
			else {
				// Check if there are any hidden subcategories that were under this master category
				var hiddenSubCategoriesForMasterCategory = _.filter(hiddenSubCategories, (subCategory)=>{
					return subCategory.masterCategoryId == masterCategory.entityId;
				});

				if(hiddenSubCategoriesForMasterCategory.length > 0) {

					categoryItems.push(<ul key={masterCategory.entityId} className="hidden-categories-master-category">{masterCategory.name}</ul>);
					_.forEach(hiddenSubCategoriesForMasterCategory, (subCategory)=>{
						categoryItems.push(<ul key={subCategory.entityId} className="hidden-categories-subcategory" onClick={this.onUnhideSubCategory.bind(this, subCategory.entityId)}>{subCategory.name}</ul>);
					});
				}
			}
		});

		return categoryItems;
	}

	public render() {

		if(this.state.show) {
			var categoryItems = this.getHiddenCategoryItems();

			return (
				<Overlay show={this.state.show} placement={this.state.placement} 
					rootClose={true} onHide={this.hide} target={()=> ReactDOM.findDOMNode(this.state.target)}>
					<Popover id="hiddenCategoriesDialog" style={PopoverStyle} title="Click to unhide a category">
						<li className="hidden-categories-list">
							{categoryItems}
						</li>
						<div className="buttons-container">
							<Button className="dialog-primary-button" style={ShowAllButtonStyle} onClick={this.onUnhideAllClick}>
								Show all hidden categories
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
