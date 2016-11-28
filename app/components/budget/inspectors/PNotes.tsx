/// <reference path="../../../_includes.ts" />

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { FormControl } from 'react-bootstrap';

import { DateWithoutTime } from '../../../utilities';
import { IEntitiesCollection, ISimpleEntitiesCollection } from '../../../interfaces/state';
import * as budgetEntities from '../../../interfaces/budgetEntities';

export interface PNotesProps {
	subCategory:budgetEntities.ISubCategory;
	// Dispatcher Functions
	updateEntities:(entities:ISimpleEntitiesCollection)=>void;
}

const NotesContainerStyle:React.CSSProperties = {
	display: "flex",
	flexFlow: "column nowrap",
	width: "100%",
	minHeight: "100px",
	paddingTop: "10px",
	paddingLeft: "10px",
	paddingRight: "10px"
}

const NotesStyle:React.CSSProperties = {
	width: "100%",
	border: "none",
	color: "#588697",
	backgroundColor: "#E5F5F9",
	fontStyle: "italic",
	outline: "none"
}

export class PNotes extends React.Component<PNotesProps, {}> {

	constructor(props:PNotesProps) {
        super(props);
		this.onChange = this.onChange.bind(this);
	}

	private onChange(event:React.FormEvent<any>):void {

		// Create a clone for persisting the values
		var subCategory = Object.assign({}, this.props.subCategory);
		// Update the notes property
		subCategory.note = (event.target as HTMLInputElement).value;
		this.props.updateEntities({
			subCategories: [subCategory]
		});
	}	

	public render() {

		var note = "";
		var subCategory = this.props.subCategory;
		if(subCategory)
			note = subCategory.note ? subCategory.note : "";

		return (
			<div style={NotesContainerStyle}>
				<div className="inspector-section-header">
					NOTES
				</div>
				<input type="textarea" style={NotesStyle} placeholder="Enter a note..." value={note} onChange={this.onChange} />
			</div>
		);
	}
}