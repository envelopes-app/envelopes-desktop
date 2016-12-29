/// <reference path="../../../_includes.ts" />

import * as _ from 'lodash';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Checkbox, Glyphicon, Overlay, Popover } from 'react-bootstrap';

import { PHoverableDiv } from '../../common/PHoverableDiv';

import { SimpleObjectMap } from '../../../utilities';
import { IMasterCategory, ISubCategory } from '../../../interfaces/budgetEntities';
import { IReportState, IEntitiesCollection } from '../../../interfaces/state';

export interface PCategorySelectionDialogProps {
	entitiesCollection:IEntitiesCollection;
	setReportState(reportState:IReportState):void;
}

export interface PCategorySelectionDialogState {
	show:boolean;
	target:HTMLElement;
	placement:string;
	selectedReport:string;
	reportState:IReportState;
	uncategorizedTransactionsSelected:boolean;
	hiddenCategoriesSelected:boolean;
	selectedCategoryIdsMap:SimpleObjectMap<boolean>;
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

const CategoryListContainerStyle:React.CSSProperties = {
	width: "100%",
	maxHeight: "300px",
	overflowY: "auto"
}

const ListStyle:React.CSSProperties = {
	width: "100%",
	borderStyle: "none",
	listStyleType: "none",
	paddingLeft: "0px"
}

const MasterCategoryListItem:React.CSSProperties = {
	marginTop: "0px",
	marginBottom: "0px",
}

const SubCategoryListItem:React.CSSProperties = {
	marginTop: "0px",
	marginBottom: "0px",
	paddingLeft: "20px"
}

export class PCategorySelectionDialog extends React.Component<PCategorySelectionDialogProps, PCategorySelectionDialogState> {

	constructor(props:PCategorySelectionDialogProps) {
        super(props);
		this.hide = this.hide.bind(this);
		this.handleSelectAllClicked = this.handleSelectAllClicked.bind(this);
		this.handleSelectNoneClicked = this.handleSelectNoneClicked.bind(this);
		this.handleCancelClicked = this.handleCancelClicked.bind(this);
		this.handleOkClicked = this.handleOkClicked.bind(this);
		this.state = {
			show: false, 
			target: null, 
			placement: "bottom",
			selectedReport: null,
			reportState: null,
			uncategorizedTransactionsSelected: false,
			hiddenCategoriesSelected: false,
			selectedCategoryIdsMap: {}
		};
	}

	public isShowing():boolean {
		return this.state.show;
	}
	
	public show(selectedReport:string, reportState:IReportState, target:HTMLElement, placement:string = "left"):void {

		// Clone the selected subcategory ids array from the report state
		var selectedCategoryIds = reportState.selectedCategoryIds.slice();
		// Build a map of selected category ids so that we can quickly ascertain if a category is selected
		var selectedCategoryIdsMap = {};
		_.forEach(selectedCategoryIds, (selectedCategoryId)=>{
			selectedCategoryIdsMap[selectedCategoryId] = true;
		});
		// Now iterate through all the subcategories, and if they are not selected, set false against their
		// ids in the map
		var subCategories = this.props.entitiesCollection.subCategories.getAllItems();
		_.forEach(subCategories, (subCategory)=>{
			if(selectedCategoryIdsMap[subCategory.entityId] != true)
				selectedCategoryIdsMap[subCategory.entityId] = false;
		});

		var state = Object.assign({}, this.state) as PCategorySelectionDialogState;
		state.show = true;
		state.target = target;
		state.placement = placement;
		state.selectedReport = selectedReport;
		state.reportState = reportState;
		state.uncategorizedTransactionsSelected = reportState.uncategorizedTransactionsSelected;
		state.hiddenCategoriesSelected = reportState.hiddenCategoriesSelected;
		state.selectedCategoryIdsMap = selectedCategoryIdsMap;
		this.setState(state);
	}

	public hide():void {
		var state = Object.assign({}, this.state) as PCategorySelectionDialogState;
		state.show = false;
		state.selectedReport = null;
		state.reportState = null;
		state.selectedCategoryIdsMap = null;
		this.setState(state);
	}

	private handleSelectAllClicked(event:React.MouseEvent<any>):void {

		var selectedCategoryIdsMap = this.state.selectedCategoryIdsMap;

		// Set all categories to true in the selected categories map
		var subCategoryIds = _.keys(selectedCategoryIdsMap);
		_.forEach(subCategoryIds, (subCategoryId)=>{
			selectedCategoryIdsMap[subCategoryId] = true;
		});

		var state = Object.assign({}, this.state);
		state.uncategorizedTransactionsSelected = true;
		state.hiddenCategoriesSelected = true;
		state.selectedCategoryIdsMap = selectedCategoryIdsMap;
		this.setState(state);
	}

	private handleSelectNoneClicked(event:React.MouseEvent<any>):void {

		var selectedCategoryIdsMap = this.state.selectedCategoryIdsMap;

		// Set all categories to true in the selected categories map
		var subCategoryIds = _.keys(selectedCategoryIdsMap);
		_.forEach(subCategoryIds, (subCategoryId)=>{
			selectedCategoryIdsMap[subCategoryId] = false;
		});

		var state = Object.assign({}, this.state);
		state.uncategorizedTransactionsSelected = false;
		state.hiddenCategoriesSelected = false;
		state.selectedCategoryIdsMap = selectedCategoryIdsMap;
		this.setState(state);
	}

	private handleCancelClicked(event:React.MouseEvent<any>):void {
		this.hide();
	}

	private handleOkClicked(event:React.MouseEvent<any>):void {

		var selectedCategoryIds = [];
		// Build an array of subCategoryIds that are selected
		var selectedCategoryIdsMap = this.state.selectedCategoryIdsMap;
		var subCategoryIds = _.keys(selectedCategoryIdsMap);

		_.forEach(subCategoryIds, (subCategoryId)=>{
			if(selectedCategoryIdsMap[subCategoryId] == true)
				selectedCategoryIds.push(subCategoryId);
		});

		// Set the updated values back in the report state and send it back to the parent component
		var reportState = this.state.reportState;
		reportState.uncategorizedTransactionsSelected = this.state.uncategorizedTransactionsSelected;
		reportState.hiddenCategoriesSelected = this.state.hiddenCategoriesSelected;
		reportState.selectedCategoryIds = selectedCategoryIds;
		this.props.setReportState(reportState);
		this.hide();
	}

	private handleMasterCategoryClicked(masterCategoryId:string, selected:boolean):void {

		var selectedCategoryIdsMap = this.state.selectedCategoryIdsMap;
		// Get all the subcategories for this master category and select/unselect them
		var subCategories = this.props.entitiesCollection.subCategories.getVisibleNonTombstonedSubCategoriesForMasterCategory(masterCategoryId);
		_.forEach(subCategories, (subCategory)=>{
			selectedCategoryIdsMap[subCategory.entityId] = selected;
		});

		var state = Object.assign({}, this.state);
		state.selectedCategoryIdsMap = selectedCategoryIdsMap;
		this.setState(state);
	} 

	private handleUncategorizedTransactionsClicked(selected:boolean):void {

		var state = Object.assign({}, this.state);
		state.uncategorizedTransactionsSelected = selected;
		this.setState(state);
	}

	private handleHiddenCategoriesClicked(selected:boolean):void {

		var state = Object.assign({}, this.state);
		state.hiddenCategoriesSelected = selected;
		this.setState(state);
	}

	private handleSubCategoryClicked(subCategoryId:string, selected:boolean):void {
		
		var selectedCategoryIdsMap = this.state.selectedCategoryIdsMap;
		selectedCategoryIdsMap[subCategoryId] = selected;
			
		var state = Object.assign({}, this.state);
		state.selectedCategoryIdsMap = selectedCategoryIdsMap;
		this.setState(state);
	} 

	private getListItemForMasterCategory(masterCategory:IMasterCategory, subCategories:Array<ISubCategory>):JSX.Element {

		var masterCategorySelected = false;
		// The master category is going to be selected if any of it's subcategories is selected
		var selectedCategoryIdsMap = this.state.selectedCategoryIdsMap;
		_.forEach(subCategories, (subCategory)=>{

			// Is this subcategory selected or not
			var subCategorySelected = selectedCategoryIdsMap[subCategory.entityId];
			if(subCategorySelected == true) {
				masterCategorySelected = true;
				return false;
			}
		});

		return (
			<Checkbox 
				key={masterCategory.entityId}
				style={MasterCategoryListItem} 
				checked={masterCategorySelected} 
				onChange={this.handleMasterCategoryClicked.bind(this, masterCategory.entityId, !masterCategorySelected)}>
				
				{masterCategory.name}
			</Checkbox>
		);
	}

	private getListItemForUncategroizedTransactions():JSX.Element {

		return (
			<Checkbox 
				key="uncategorized_transactions"
				style={MasterCategoryListItem} 
				checked={this.state.uncategorizedTransactionsSelected} 
				onChange={this.handleUncategorizedTransactionsClicked.bind(this, !this.state.uncategorizedTransactionsSelected)}>
				
				Uncategorized Transactions
			</Checkbox>
		);
	}

	private getListItemForHiddenCategories():JSX.Element {

		return (
			<Checkbox 
				key="hidden_categories"
				style={MasterCategoryListItem} 
				checked={this.state.hiddenCategoriesSelected} 
				onChange={this.handleHiddenCategoriesClicked.bind(this, !this.state.hiddenCategoriesSelected)}>
				
				Hidden Categories
			</Checkbox>
		);
	}

	private getListItemForSubCategory(subCategory:ISubCategory):JSX.Element {

		var selectedCategoryIdsMap = this.state.selectedCategoryIdsMap;
		var subCategorySelected = selectedCategoryIdsMap[subCategory.entityId];

		return (
			<Checkbox 
				key={subCategory.entityId}
				style={SubCategoryListItem} 
				checked={subCategorySelected != false} 
				onChange={this.handleSubCategoryClicked.bind(this, subCategory.entityId, !subCategorySelected)}>
				
				{subCategory.name}
			</Checkbox>
		);
	}
	
	public render() {

		if(this.state.show) {

			var categoryItems:Array<JSX.Element> = [
				this.getListItemForUncategroizedTransactions()
			];
			// Get all the master categories and subcategories and build list items for them
			var masterCategoriesArray = this.props.entitiesCollection.masterCategories;
			var subCategoriesArray = this.props.entitiesCollection.subCategories;
			_.forEach(masterCategoriesArray.getVisibleNonTombstonedMasterCategories(), (masterCategory)=>{

				let subCategories = subCategoriesArray.getVisibleNonTombstonedSubCategoriesForMasterCategory(masterCategory.entityId);
				let masterCategoryItem = this.getListItemForMasterCategory(masterCategory, subCategories);
				categoryItems.push(masterCategoryItem);

				_.forEach(subCategories, (subCategory)=>{

					let subCategoryItem = this.getListItemForSubCategory(subCategory);
					categoryItems.push(subCategoryItem);
				});
			});

			categoryItems.push(
				this.getListItemForHiddenCategories()
			);
			
			return (
				<Overlay key="overlay" rootClose={true} show={this.state.show} placement={this.state.placement} 
					onHide={this.hide} target={ ()=> ReactDOM.findDOMNode(this.state.target) }>
					<Popover id="selectReportCategoriesPopover" style={PopoverStyle}>
						<div style={TitleStyle}>Categories</div>
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

						<div style={CategoryListContainerStyle}>
							<ul style={ListStyle}>
								{categoryItems}
							</ul>
						</div>

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
