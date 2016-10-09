/// <reference path="../../../_includes.ts" />

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { FormControl } from 'react-bootstrap';

import { DateWithoutTime } from '../../../utilities';
import { IEntitiesCollection, ISimpleEntitiesCollection } from '../../../interfaces/state';
import * as budgetEntities from '../../../interfaces/budgetEntities';

export interface PNotesProps {
	subCategoryId:string;
	entitiesCollection:IEntitiesCollection;
	// Dispatcher Functions
	updateEntities:(entities:ISimpleEntitiesCollection)=>void;
}

const NotesContainerStyle = {
	width: "100%",
	paddingTop: "10px",
	paddingLeft: "10px",
	paddingRight: "10px"
}

const NotesStyle = {
	width: "100%",
	border: "none",
	color: "#588697",
	backgroundColor: "#E5F5F9",
	fontStyle: "italic",
	outline: "none"
}

export class PNotes extends React.Component<PNotesProps, {}> {

	constructor(props:any) {
        super(props);
		this.onChange = this.onChange.bind(this);
	}

	private onChange(event:React.FormEvent):void {

		// Get the subcategory that we are editing the notes for
		var subCategory = this.props.entitiesCollection.subCategories.getEntityById(this.props.subCategoryId);
		if(subCategory) {

			// Create a clone for persisting the values
			subCategory = Object.assign({}, subCategory);
			// Update the notes property
			subCategory.note = (event.target as HTMLInputElement).value;
			this.props.updateEntities({
				subCategories: [subCategory]
			});
		}
	}	

	public render() {

		var note = "";
		var subCategory = this.props.entitiesCollection.subCategories.getEntityById(this.props.subCategoryId);
		if(subCategory)
			note = subCategory.note ? subCategory.note : "";

		return (
			<div style={NotesContainerStyle}>
				<input type="textarea" style={NotesStyle} placeholder="Enter a note..." value={note} onChange={this.onChange} />
			</div>
		);
	}
}