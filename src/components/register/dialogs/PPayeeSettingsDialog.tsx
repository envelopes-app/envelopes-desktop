/// <reference path="../../../_includes.ts" />

import * as _ from 'lodash';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Form, Glyphicon, Modal } from 'react-bootstrap';

import { PLinkButton } from '../../common/PLinkButton';
import { InternalCategories, SubCategoryType } from '../../../constants';
import { SimpleObjectMap } from '../../../utilities';
import * as budgetEntities from '../../../interfaces/budgetEntities';
import { IEntitiesCollection, ISimpleEntitiesCollection } from '../../../interfaces/state';

export interface PPayeeSettingsDialogProps {
	entitiesCollection:IEntitiesCollection
	// Dispatcher Functions
	updateEntities:(entities:ISimpleEntitiesCollection)=>void;
}

export interface PPayeeSettingsDialogState {
	show:boolean;
}

const CategoriesContainer:React.CSSProperties = {
	display: "flex",
	flexFlow: "column nowrap",
	width: "100%",
	maxHeight: "400px",
	overflowY: "auto"
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

export class PPayeeSettingsDialog extends React.Component<PPayeeSettingsDialogProps, PPayeeSettingsDialogState> {

	constructor(props:PPayeeSettingsDialogProps) {
        super(props);
		this.hide = this.hide.bind(this);
		this.state = {
			show: false,
		};
	}

	public isShowing():boolean {
		return this.state.show;
	}
	
	public show():void {

		var state = Object.assign({}, this.state) as PPayeeSettingsDialogState;
		state.show = true;
		this.setState(state);
	}

	public hide():void {
		var state = Object.assign({}, this.state) as PPayeeSettingsDialogState;
		state.show = false;
		this.setState(state);
	}
	
	public render() {

		if(this.state.show) {

			return (
				<Modal show={this.state.show} animation={true} onHide={this.hide} backdrop="static" keyboard={false}>
					<Modal.Header>
						<Modal.Title>Payee Settings</Modal.Title>
					</Modal.Header>
					<Modal.Body>
						<div style={CategoriesContainer}>
							<div>
							</div>
						</div>
					</Modal.Body>
					<Modal.Footer>
						<button className="dialog-primary-button" onClick={this.hide}>
							Close&nbsp;<Glyphicon glyph="ok-sign" />
						</button>
					</Modal.Footer>
				</Modal>
			);
		}
		else {
			return <div />;
		}
	}
}
