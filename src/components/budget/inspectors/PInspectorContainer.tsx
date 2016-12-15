/// <reference path="../../../_includes.ts" />

import * as React from 'react';
import * as ReactDOM from 'react-dom';

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
	showUpcomingTransactionsDialog:(monthlySubCategoryBudgetId:string, element:HTMLElement, placement?:string)=>void;
	// Dispatcher Functions
	updateEntities:(entities:ISimpleEntitiesCollection)=>void;
}

const InspectorContainerStyle:React.CSSProperties = {
	flex: '0 0 auto',
	height: "100%",
	borderColor: UIConstants.InspectorBorderColor,
	borderStyle: "solid",
	borderTopWidth: "1px",
	borderBottomWidth: "0px",
	borderRightWidth: "1px",
	borderLeftWidth: "0px",
	backgroundColor: UIConstants.InspectorBackgroundColor,
	overflowY: "auto"
}

const InspectorContainerCollapsedStyle = Object.assign({}, InspectorContainerStyle, {
	width: UIConstants.InspectorCollapsedWidth
});

const InspectorContainerExpandedStyle = Object.assign({}, InspectorContainerStyle, {
	width: UIConstants.InspectorExpandedWidth
});

export class PInspectorContainer extends React.Component<PInspectorContainerProps, {}> {

	public render() {

		if(this.props.inspectorCollapsed) {
			return <div style={InspectorContainerCollapsedStyle} />;
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
					{inspector}
				</div>
			);
		}
  	}
}