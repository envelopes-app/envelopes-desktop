/// <reference path="../../../../_includes.ts" />

import * as _ from 'lodash';
import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { PFormControl } from '../../../common/PFormControl';
import * as budgetEntities from '../../../../interfaces/budgetEntities';
import { IEntitiesCollection, ISimpleEntitiesCollection } from '../../../../interfaces/state';
import { DataFormatter } from '../../../../utilities';

export interface PMultiPayeeEditorProps {
	payees:Array<budgetEntities.IPayee>;
	combineSelectedPayees:(combinedPayeeName:string)=>void;
}

export interface PMultiPayeeEditorState {
	combinedPayeeName:string;
	combinedPayeeNameErrorMessage:string;
}

const PayeeEditorContainerStyle:React.CSSProperties = {
	flex: "1 1 auto",
	display: "flex",
	flexFlow: "column nowrap",
	justifyContent: "flex-start",
	alignItems: "flex-center",
	padding: "10px",
	width: "100%"
}

const HeaderLabelStyle:React.CSSProperties = {
	fontSize: "20px",
	fontWeight: "normal",
	color: "#009cc2"
}

const PayeeNamesStyle:React.CSSProperties = {
	fontSize: "14px",
	fontWeight: "normal",
	fontStyle: "italic"
}

const SectionHeaderLabelStyle:React.CSSProperties = {
	fontSize: "14px",
	fontWeight: "bold",
	marginTop: "5px",
	marginBottom: "0px"
}

const SeparatorStyle:React.CSSProperties = {
	width: "100%",
	marginTop: "5px",
	marginBottom: "10px",
	borderTop: "1px solid #588697"
}

const CombinePayeeContainer:React.CSSProperties = {
	display: "flex",
	flexFlow: "row nowrap",
	alignItems: "flex-start",
}

const LabelStyle:React.CSSProperties = {
	fontSize: "14px",
	fontWeight: "normal",
	marginBottom: "0px",
	width: "100%"
}

const CombineButtonStyle:React.CSSProperties = {
	flex: "0 0 auto",
	width: "120px",
	marginLeft: "5px",
	fontSize: "14px"
}

export class PMultiPayeeEditor extends React.Component<PMultiPayeeEditorProps, PMultiPayeeEditorState> {

	constructor(props:PMultiPayeeEditorProps) {
        super(props);
		this.onPayeeNameChange = this.onPayeeNameChange.bind(this);
		this.onCombineClicked = this.onCombineClicked.bind(this);
		this.state = {
			combinedPayeeName: props.payees[props.payees.length - 1].name,
			combinedPayeeNameErrorMessage: null
		}
	}

	private onPayeeNameChange(event:React.FormEvent<any>):void {

		var state = Object.assign({}, this.state);
		state.combinedPayeeName = (event.target as HTMLInputElement).value;
		this.setState(state);
	}

	private onCombineClicked(event:React.MouseEvent<any>):void {

		if(this.state.combinedPayeeName == "") {

			var state = Object.assign({}, this.state);
			state.combinedPayeeNameErrorMessage = "Payee name is required.";
			this.setState(state);
		}
		else {
			// Pass the new payee name to the parent dialog for combining the selected payees
			this.props.combineSelectedPayees(this.state.combinedPayeeName);
		}
	}

	private getSelectedPayeeNames():string {

		var payeeNames = "";
		// Iterate through the passed payees and build a string of comma separated payee names
		_.forEach(this.props.payees, (payee)=>{
			payeeNames += `'${payee.name}', `;
		});
		// Remove the space and comma from the end of the names string
		payeeNames = payeeNames.substring(0, payeeNames.length - 2);
		return payeeNames;
	}	

	public componentWillReceiveProps(nextProps:PMultiPayeeEditorProps):void {

		if(nextProps.payees.length != this.props.payees.length) {

			var combinedPayeeName = nextProps.payees[nextProps.payees.length - 1].name;
			var state = Object.assign({}, this.state);
			state.combinedPayeeName = combinedPayeeName;
			state.combinedPayeeNameErrorMessage = null;
			this.setState(state);
		}
	}

	public render():JSX.Element {

		var payeeNames = this.getSelectedPayeeNames();

		return (
			<div style={PayeeEditorContainerStyle}>
				<label style={HeaderLabelStyle}>Multiple Payees Selected ({this.props.payees.length})</label>
				<label style={PayeeNamesStyle}>{payeeNames}</label>

				<div style={{height: "10px"}} />
				<label style={SectionHeaderLabelStyle}>Combine and Rename Selected Payees</label>
				<hr style={SeparatorStyle} />
				<label style={LabelStyle}>New Payee Name:</label>
				<div style={CombinePayeeContainer}>
					<PFormControl value={this.state.combinedPayeeName} errorMessage={this.state.combinedPayeeNameErrorMessage} onChange={this.onPayeeNameChange} />
					<button className="dialog-secondary-button" style={CombineButtonStyle} onClick={this.onCombineClicked}>Combine Now</button>
				</div>
			</div>
		);
	}
}
