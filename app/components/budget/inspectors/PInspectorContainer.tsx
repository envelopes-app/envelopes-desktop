/// <reference path="../../../_includes.ts" />

import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { PDefaultInspector } from './PDefaultInspector';
import { PDefaultCategoryInspector } from './PDefaultCategoryInspector';
import { PDebtCategoryInspector } from './PDebtCategoryInspector';
import { PUncategorizedInspector } from './PUncategorizedInspector';
import { PMultiCategoryInspector } from './PMultiCategoryInspector';

import { DateWithoutTime } from '../../../utilities';
import { InternalCategories } from '../../../constants';
import { IEntitiesCollection, ISimpleEntitiesCollection } from '../../../interfaces/state';
import * as budgetEntities from '../../../interfaces/budgetEntities';
import { SubCategoryType } from '../../../constants';

export interface PInspectorContainerProps {
	currentMonth:DateWithoutTime;
	selectedSubCategories:Array<string>;
	entitiesCollection:IEntitiesCollection;
	// Dispatcher Functions
	updateEntities:(entities:ISimpleEntitiesCollection)=>void;
}

const InspectorContainerStyle = {
	flex: '0 0 auto',
	minWidth: "340px",
	width: "340px",
	backgroundColor: "#E5F5F9",
	borderColor: "#DFE4E9",
	borderStyle: "solid",
	borderTopWidth: "1px",
	borderBottomWidth: "0px",
	borderRightWidth: "1px",
	borderLeftWidth: "0px",
	overflowY: "scroll"
}

export class PInspectorContainer extends React.Component<PInspectorContainerProps, {}> {

	public render() {

		var inspector:JSX.Element;

		if(this.props.selectedSubCategories.length == 0) {
			inspector = <PDefaultInspector 
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
								entitiesCollection={this.props.entitiesCollection} 
								subCategoryId={subCategoryId} currentMonth={this.props.currentMonth} 
								updateEntities={this.props.updateEntities}
							/>;
			}
			else if(subCategory.type == SubCategoryType.Default) {
				inspector = <PDefaultCategoryInspector 
								entitiesCollection={this.props.entitiesCollection} 
								subCategoryId={subCategoryId} currentMonth={this.props.currentMonth} 
								updateEntities={this.props.updateEntities}
							/>;
			}
			else if(subCategory.type == SubCategoryType.Debt)
				inspector = <PDebtCategoryInspector 
								entitiesCollection={this.props.entitiesCollection} 
								subCategoryId={subCategoryId} currentMonth={this.props.currentMonth} 
								updateEntities={this.props.updateEntities}	
							/>;
		}
		else if(this.props.selectedSubCategories.length > 1) {
			inspector = <PMultiCategoryInspector />;
		}

    	return (
			<div style={InspectorContainerStyle}>
				{inspector}
			</div>
		);
  	}
}