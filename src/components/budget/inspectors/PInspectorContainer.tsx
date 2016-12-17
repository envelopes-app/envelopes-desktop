/// <reference path="../../../_includes.ts" />

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Glyphicon } from 'react-bootstrap';

import { PLinkButton } from '../../common/PLinkButton';
import { PDefaultInspector } from './PDefaultInspector';
import { PDefaultCategoryInspector } from './PDefaultCategoryInspector';
import { PDebtCategoryInspector } from './PDebtCategoryInspector';
import { PUncategorizedInspector } from './PUncategorizedInspector';
import { PMultiCategoryInspector } from './PMultiCategoryInspector';

import { DataFormatter, DateWithoutTime } from '../../../utilities';
import { InternalCategories } from '../../../constants';
import { IEntitiesCollection, ISimpleEntitiesCollection } from '../../../interfaces/state';
import * as budgetEntities from '../../../interfaces/budgetEntities';
import { SubCategoryType, UIConstants } from '../../../constants';

export interface PInspectorContainerProps {
	dataFormatter:DataFormatter;
	currentMonth:DateWithoutTime;
	selectedSubCategories:Array<string>;
	inspectorCollapsed:boolean;
	entitiesCollection:IEntitiesCollection;
	setInspectorState:(collapsed:boolean)=>void;
	showUpcomingTransactionsDialog:(monthlySubCategoryBudgetId:string, element:HTMLElement, placement?:string)=>void;
	// Dispatcher Functions
	updateEntities:(entities:ISimpleEntitiesCollection)=>void;
}

const InspectorContainerStyle:React.CSSProperties = {
	flex: "0 0 auto",
	display: "flex",
	flexFlow: "row nowrap",
	height: "100%",
	borderColor: UIConstants.InspectorBorderColor,
	borderStyle: "solid",
	borderTopWidth: "1px",
	borderBottomWidth: "0px",
	borderRightWidth: "1px",
	borderLeftWidth: "0px",
	backgroundColor: UIConstants.InspectorBackgroundColor
}

const InspectorContainerCollapsedStyle = Object.assign({}, InspectorContainerStyle, {
	width: UIConstants.InspectorCollapsedWidth
});

const InspectorContainerExpandedStyle = Object.assign({}, InspectorContainerStyle, {
	width: UIConstants.InspectorExpandedWidth
});

const InspectorExpandCollapseBarStyle:React.CSSProperties = {
	flex: "0 0 auto",
	display: "flex",
	alignItems: "center",
	justifyContent: "center",
	height: "100%",
	width: "20px",
	backgroundColor: UIConstants.InspectorBackgroundColor,
	borderColor: UIConstants.InspectorBorderColor,
	borderStyle: "solid",
	borderTopWidth: "0px",
	borderBottomWidth: "0px",
	borderRightWidth: "1px",
	borderLeftWidth: "0px",
	cursor: "pointer"
}

const InspectorInternalContainerStyle:React.CSSProperties = {
	width: "100%",
	height: "100%",
	overflowY: "auto"
}

const GlyphStyle:React.CSSProperties = {
	color: '#009cc2'
}

export class PInspectorContainer extends React.Component<PInspectorContainerProps, {}> {

	constructor(props:PInspectorContainerProps) {
        super(props);
		this.expandCollapseInspector = this.expandCollapseInspector.bind(this);
	}

	private expandCollapseInspector():void {
		if(this.props.inspectorCollapsed)
			this.props.setInspectorState(false);
		else
			this.props.setInspectorState(true);
	}

	public render() {

		var glyph:JSX.Element;
		if(this.props.inspectorCollapsed)
			glyph = <Glyphicon glyph="chevron-left" style={GlyphStyle} />;
		else
			glyph = <Glyphicon glyph="chevron-right" style={GlyphStyle} />;

		if(this.props.inspectorCollapsed) {
			return (
				<div style={InspectorContainerCollapsedStyle}>
					<div style={InspectorExpandCollapseBarStyle} onClick={this.expandCollapseInspector}>
						{glyph}
					</div>
				</div>
			);
		}
		else {
			var inspector:JSX.Element;

			if(this.props.selectedSubCategories.length == 0) {
				inspector = <PDefaultInspector 
								dataFormatter={this.props.dataFormatter}
								currentMonth={this.props.currentMonth} 
								entitiesCollection={this.props.entitiesCollection} 
								updateEntities={this.props.updateEntities}
							/>;
			}
			else if(this.props.selectedSubCategories.length == 1) {
				
				// Get the selected category to find out if it is a debt category or a default category
				var subCategoryId:string = this.props.selectedSubCategories[0];
				var subCategory = this.props.entitiesCollection.subCategories.getEntityById(subCategoryId);

				if(subCategory.internalName == InternalCategories.UncategorizedSubCategory) {
					inspector = <PUncategorizedInspector 
									dataFormatter={this.props.dataFormatter}
									subCategoryId={subCategoryId} 
									currentMonth={this.props.currentMonth} 
									entitiesCollection={this.props.entitiesCollection} 
									showUpcomingTransactionsDialog={this.props.showUpcomingTransactionsDialog}
									updateEntities={this.props.updateEntities}
								/>;
				}
				else if(subCategory.type == SubCategoryType.Default) {
					inspector = <PDefaultCategoryInspector 
									dataFormatter={this.props.dataFormatter}
									subCategoryId={subCategoryId} 
									currentMonth={this.props.currentMonth} 
									entitiesCollection={this.props.entitiesCollection} 
									showUpcomingTransactionsDialog={this.props.showUpcomingTransactionsDialog}
									updateEntities={this.props.updateEntities}
								/>;
				}
				else if(subCategory.type == SubCategoryType.Debt)
					inspector = <PDebtCategoryInspector 
									dataFormatter={this.props.dataFormatter}
									subCategoryId={subCategoryId} 
									currentMonth={this.props.currentMonth} 
									entitiesCollection={this.props.entitiesCollection} 
									showUpcomingTransactionsDialog={this.props.showUpcomingTransactionsDialog}
									updateEntities={this.props.updateEntities}	
								/>;
			}
			else if(this.props.selectedSubCategories.length > 1) {
				inspector = <PMultiCategoryInspector 
								dataFormatter={this.props.dataFormatter}
								currentMonth={this.props.currentMonth} 
								selectedSubCategories={this.props.selectedSubCategories} 
								entitiesCollection={this.props.entitiesCollection} 
								updateEntities={this.props.updateEntities}	
							/>;
			}

			return (
				<div style={InspectorContainerExpandedStyle}>
					<div style={InspectorExpandCollapseBarStyle} onClick={this.expandCollapseInspector}>
						{glyph}
					</div>
					<div style={InspectorInternalContainerStyle}>
						{inspector}
					</div>
				</div>
			);
		}
  	}
}