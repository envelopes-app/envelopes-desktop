/// <reference path="../../../_includes.ts" />

import * as _ from 'lodash';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Button, Form, Glyphicon, Modal } from 'react-bootstrap';

import { PLinkButton } from '../../common/PLinkButton';
import { InternalCategories, SubCategoryType } from '../../../constants';
import { SimpleObjectMap } from '../../../utilities';
import * as budgetEntities from '../../../interfaces/budgetEntities';
import { IEntitiesCollection, ISimpleEntitiesCollection } from '../../../interfaces/state';

export interface PReorderCategoriesDialogProps {
	entitiesCollection:IEntitiesCollection
	// Dispatcher Functions
	updateEntities:(entities:ISimpleEntitiesCollection)=>void;
}

export interface PPReorderCategoriesDialogState {
	show:boolean;
	collapsedMasterCategoriesMap:SimpleObjectMap<boolean>;
}

const CategoriesContainer:React.CSSProperties = {
	display: "flex",
	flexFlow: "column nowrap",
	width: "100%",
	maxHeight: "400px",
	overflowY: "scroll"
}

const MasterCategoryContainerStyle:React.CSSProperties = {
	display: "flex",
	flexFlow: 'column nowrap',
	flex: "1 1 auto",
};

const MasterCategoryRowStyle:React.CSSProperties = {
	height: "31px",
	width: "100%",
	flex: "0 0 auto",
	display: "flex",
	flexFlow: 'row nowrap',
	alignItems: "center",
	backgroundColor: "#E5F5F9",
	borderColor: "#DFE4E9",
	borderStyle: "solid",
	borderTopWidth: "0px",
	borderBottomWidth: "1px",
	borderRightWidth: "0px",
	borderLeftWidth: "0px",
	paddingTop: "3px",
	paddingBottom: "3px",
	paddingLeft: "5px",
	paddingRight: "10px"
}

const SubCategoriesContainerStyle:React.CSSProperties = {
	flex: "1 1 auto",
};

const SubCategoryRowStyle:React.CSSProperties = {
	height: "31px",
	width: "100%",
	flex: "0 0 auto",
	display: "flex",
	flexFlow: 'row nowrap',
	alignItems: "center",
	color: "#003440",
	backgroundColor: "#FFFFFF",
	borderColor: "#DFE4E9",
	borderStyle: "solid",
	borderTopWidth: "0px",
	borderBottomWidth: "1px",
	borderRightWidth: "0px",
	borderLeftWidth: "0px",
	paddingTop: "3px",
	paddingBottom: "3px",
	paddingLeft: "20px",
	paddingRight: "10px"
}

const MasterCategoryNameStyle:React.CSSProperties = {
	flex: "1 1 auto",
	fontSize: "14px",
	fontWeight: "bold",
	color: "#003440",
	marginBottom: "0px",
	marginTop: "3px"
}

const SubCategoryNameStyle:React.CSSProperties = {
	flex: "1 1 auto",
	fontSize: "14px",
	fontWeight: "normal",
	color: "#003440",
	marginBottom: "0px",
	marginTop: "3px"
}

export class PReorderCategoriesDialog extends React.Component<PReorderCategoriesDialogProps, PPReorderCategoriesDialogState> {

	constructor(props:PReorderCategoriesDialogProps) {
        super(props);
		this.hide = this.hide.bind(this);
		this.state = {
			show: false,
			collapsedMasterCategoriesMap: null
		};
	}

	public isShowing():boolean {
		return this.state.show;
	}
	
	public show():void {

		var state = Object.assign({}, this.state) as PPReorderCategoriesDialogState;
		state.show = true;
		state.collapsedMasterCategoriesMap = {};
		this.setState(state);
	}

	public hide():void {
		var state = Object.assign({}, this.state) as PPReorderCategoriesDialogState;
		state.show = false;
		state.collapsedMasterCategoriesMap = null;
		this.setState(state);
	}

	private toggleExpandCollapseForMasterCategory(masterCategoryId:string):void {

		var isCollapsed = this.state.collapsedMasterCategoriesMap[masterCategoryId];
		if(isCollapsed == null || isCollapsed == undefined)
			isCollapsed = false;

		var state = Object.assign({}, this.state);
		state.collapsedMasterCategoriesMap[masterCategoryId] = !isCollapsed;
		this.setState(state);
	}

	private onMoveMasterCategoryUpClick(masterCategory:budgetEntities.IMasterCategory, event:React.MouseEvent<any>):void {

		event.stopPropagation();
		// Get the master category that is above the master category we are displaying
		var masterCategoryAbove = this.props.entitiesCollection.masterCategories.getMasterCategoryAbove(masterCategory.entityId);
		if(masterCategoryAbove) {

			// We are going to swap the sortableIndices of these master categories
			var masterCategoryClone = Object.assign({}, masterCategory);
			var masterCategoryAboveClone = Object.assign({}, masterCategoryAbove);
			// Swap the sortableIndices in the clone objects
			masterCategoryClone.sortableIndex = masterCategoryAbove.sortableIndex;
			masterCategoryAboveClone.sortableIndex = masterCategory.sortableIndex;
			// Send these master categories for persistence
			this.props.updateEntities({
				masterCategories: [masterCategoryClone, masterCategoryAboveClone]
			});
		}
	}

	private onMoveMasterCategoryDownClick(masterCategory:budgetEntities.IMasterCategory, event:React.MouseEvent<any>):void {

		event.stopPropagation();
		// Get the master category that is below the master category we are displaying
		var masterCategoryBelow = this.props.entitiesCollection.masterCategories.getMasterCategoryBelow(masterCategory.entityId);
		if(masterCategoryBelow) {

			// We are going to swap the sortableIndices of these master categories
			var masterCategoryClone = Object.assign({}, masterCategory);
			var masterCategoryBelowClone = Object.assign({}, masterCategoryBelow);
			// Swap the sortableIndices in the clone objects
			masterCategoryClone.sortableIndex = masterCategoryBelow.sortableIndex;
			masterCategoryBelowClone.sortableIndex = masterCategory.sortableIndex;
			// Send these master categories for persistence
			this.props.updateEntities({
				masterCategories: [masterCategoryClone, masterCategoryBelowClone]
			});
		}
	}

	private onMoveSubCategoryUpClick(subCategory:budgetEntities.ISubCategory, event:React.MouseEvent<any>):void {

		// Get the subcategory that is above the subcategory we are displaying
		var subCategoryAbove = this.props.entitiesCollection.subCategories.getSubCategoryAbove(subCategory.masterCategoryId, subCategory.entityId);
		if(subCategoryAbove) {

			// We are going to swap the sortableIndices of these subCategories
			var subCategoryClone = Object.assign({}, subCategory);
			var subCategoryAboveClone = Object.assign({}, subCategoryAbove);
			// Swap the sortableIndices in the clone objects
			subCategoryClone.sortableIndex = subCategoryAbove.sortableIndex;
			subCategoryAboveClone.sortableIndex = subCategory.sortableIndex;
			// Send these subCategories for persistence
			this.props.updateEntities({
				subCategories: [subCategoryClone, subCategoryAboveClone]
			});
		}
		else {
			// This subCategory is already at the top under it's master category, so it can't be moved
			// further up under this master category.
			// We are going to check if we have another master category above this subcategory's parent
			// master category. If we do, we will move this subcategory to the bottom of that master category.
			// NOTE: Don't move the debt subcategories out from under the debt payment master category
			if(subCategory.type == SubCategoryType.Default) {
				var masterCategoryAbove = this.props.entitiesCollection.masterCategories.getMasterCategoryAbove(subCategory.masterCategoryId);
				if(masterCategoryAbove) {

					var subCategoryClone = Object.assign({}, subCategory);
					subCategoryClone.masterCategoryId = masterCategoryAbove.entityId;
					subCategoryClone.sortableIndex = this.props.entitiesCollection.subCategories.getSortableIndexForNewSubCategoryInsertionAtBottom(masterCategoryAbove.entityId);
					// Send this subCategory for persistence
					this.props.updateEntities({
						subCategories: [subCategoryClone]
					});
				}
			}
		}
	}

	private onMoveSubCategoryDownClick(subCategory:budgetEntities.ISubCategory, event:React.MouseEvent<any>):void {

		// Get the subcategory that is below the subcategory we are displaying
		var subCategoryBelow = this.props.entitiesCollection.subCategories.getSubCategoryBelow(subCategory.masterCategoryId, subCategory.entityId);
		if(subCategoryBelow) {

			// We are going to swap the sortableIndices of these subCategories
			var subCategoryClone = Object.assign({}, subCategory);
			var subCategoryBelowClone = Object.assign({}, subCategoryBelow);
			// Swap the sortableIndices in the clone objects
			subCategoryClone.sortableIndex = subCategoryBelow.sortableIndex;
			subCategoryBelowClone.sortableIndex = subCategory.sortableIndex;
			// Send these subCategories for persistence
			this.props.updateEntities({
				subCategories: [subCategoryClone, subCategoryBelowClone]
			});
		}
		else {
			// This subCategory is already at the bottom under it's master category, so it can't be moved
			// further down under this master category.
			// We are going to check if we have another master category below this subcategory's parent
			// master category. If we do, we will move this subcategory to the top of that master category.
			// NOTE: Don't move the debt subcategories out from under the debt payment master category
			if(subCategory.type == SubCategoryType.Default) {
				var masterCategoryBelow = this.props.entitiesCollection.masterCategories.getMasterCategoryBelow(subCategory.masterCategoryId);
				if(masterCategoryBelow) {

					var subCategoryClone = Object.assign({}, subCategory);
					subCategoryClone.masterCategoryId = masterCategoryBelow.entityId;
					subCategoryClone.sortableIndex = this.props.entitiesCollection.subCategories.getSortableIndexForNewSubCategoryInsertionAtTop(masterCategoryBelow.entityId);
					// Send this subCategory for persistence
					this.props.updateEntities({
						subCategories: [subCategoryClone]
					});
				}			
			}
		}
	}

	private getCategoryItems():Array<JSX.Element> {

		var categoryItems:Array<JSX.Element> = [];
		var entitiesCollection = this.props.entitiesCollection;

		_.forEach(entitiesCollection.masterCategories.getVisibleNonTombstonedMasterCategories(), (masterCategory)=>{

			// Get all subcategories for this master category
			let subCategories = entitiesCollection.subCategories.getVisibleNonTombstonedSubCategoriesForMasterCategory(masterCategory.entityId);

			if(!masterCategory.internalName || 
					(masterCategory.internalName == InternalCategories.DebtPaymentMasterCategory && subCategories.length > 0)) {

				let masterCategoryItem = this.getMasterCategoryItem(masterCategory, subCategories);
				categoryItems.push(masterCategoryItem);
			}
		});

		return categoryItems;
	}

	private getMasterCategoryItem(masterCategory:budgetEntities.IMasterCategory, subCategories:Array<budgetEntities.ISubCategory>):JSX.Element {

		var glyphIconName, containerClass:string;
		var subCategoriesContainerStyle = Object.assign({}, SubCategoriesContainerStyle);
		var collapseContainerIdentity = "subCategoriesContainer_" + masterCategory.entityId;

		var isCollapsed = this.state.collapsedMasterCategoriesMap[masterCategory.entityId];
		if(isCollapsed == null || isCollapsed == undefined)
			isCollapsed = false;

		if(isCollapsed == false) {
			glyphIconName = "triangle-bottom";
			containerClass = "collapse in";
		}
		else {
			glyphIconName = "triangle-right";
			containerClass = "collapse";
		}

		let subCategoryItems:Array<JSX.Element> = [];
		// Add items for the subcategories
		_.forEach(subCategories, (subCategory)=>{

			let subCategoryItem = this.getSubCategoryItem(subCategory);
			subCategoryItems.push(subCategoryItem);
		});


		let masterCategoryItem = (
			<div style={MasterCategoryContainerStyle} key={masterCategory.entityId}>
				<div style={MasterCategoryRowStyle} onClick={this.toggleExpandCollapseForMasterCategory.bind(this, masterCategory.entityId)}>
					<Glyphicon glyph={glyphIconName} />
					<span style={MasterCategoryNameStyle}>&nbsp;{masterCategory.name}</span>
					<Glyphicon glyph="arrow-up" style={{paddingRight:"10px", cursor:"pointer"}} onClick={this.onMoveMasterCategoryUpClick.bind(this, masterCategory)} />
					<Glyphicon glyph="arrow-down" style={{cursor:"pointer"}} onClick={this.onMoveMasterCategoryDownClick.bind(this, masterCategory)} />
				</div>
				<div className={containerClass} style={subCategoriesContainerStyle} id={collapseContainerIdentity}>
					{subCategoryItems}
				</div>
			</div>
		);

		return masterCategoryItem;
	}

	private getSubCategoryItem(subCategory:budgetEntities.ISubCategory):JSX.Element {

		let subCategoryItem = (
			<div style={SubCategoryRowStyle} key={subCategory.entityId}>
				<span style={SubCategoryNameStyle}>{subCategory.name}</span>
				<Glyphicon glyph="arrow-up" style={{paddingRight:"10px", cursor:"pointer"}} onClick={this.onMoveSubCategoryUpClick.bind(this, subCategory)} />
				<Glyphicon glyph="arrow-down" style={{cursor:"pointer"}} onClick={this.onMoveSubCategoryDownClick.bind(this, subCategory)} />
			</div>);

		return subCategoryItem;
	}
	
	public render() {

		if(this.state.show) {

			var categoryItems = this.getCategoryItems();

			return (
				<Modal show={this.state.show} animation={true} onHide={this.hide} backdrop="static" keyboard={false} dialogClassName="reorder-categories-dialog">
					<Modal.Header className="modal-header">
						<Modal.Title>Reorder Categories</Modal.Title>
					</Modal.Header>
					<Modal.Body>
						<Form style={CategoriesContainer}>
							<div>
								{categoryItems}
							</div>
						</Form>
					</Modal.Body>
					<Modal.Footer>
						<Button className="dialog-primary-button" onClick={this.hide}>
							Close&nbsp;<Glyphicon glyph="ok-sign" />
						</Button>
					</Modal.Footer>
				</Modal>
			);
		}
		else {
			return <div />;
		}
	}
}
