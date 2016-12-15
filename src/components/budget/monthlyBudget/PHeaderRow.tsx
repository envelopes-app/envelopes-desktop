/// <reference path="../../../_includes.ts" />

import * as React from 'react';
import * as ReactDOM from 'react-dom';

export interface PHeaderRowProps { 
	visibleMonths:number;
	selectAllCategories:()=>void;
	unselectAllCategories:()=>void;
}

const HeaderRowContainerStyle:React.CSSProperties = {
	height: "25px",
	width: "100%",
	display: "flex",
	flexFlow: 'row nowrap',
	alignItems: "center",
	backgroundColor: "#FFFFFF",
	borderColor: "#DFE4E9",
	borderStyle: "solid",
	borderTopWidth: "0px",
	borderBottomWidth: "1px",
	borderRightWidth: "0px",
	borderLeftWidth: "0px",
	paddingRight: "10px"
}

const SelectionColumnStyle:React.CSSProperties = {
	flex: "0 0 auto",
	width: "25px",
	paddingLeft: "8px"
}

const CategoryLabelContainerStyle:React.CSSProperties = {
	flex: "1 1 auto",
	paddingLeft: "20px"
}

const LabelContainerStyle:React.CSSProperties = {
	flex: "0 0 auto",
	width: "100px",
	textAlign: "right",
	paddingRight: "8px"
}

const LableStyle:React.CSSProperties = {
	fontSize: "11px",
	fontWeight: "normal",
	color: "#4D717A",
	marginBottom: "0px"
}

const BoldLableStyle = Object.assign({}, LableStyle, {
	fontWeight: "bold"
});

export class PHeaderRow extends React.Component<PHeaderRowProps, {}> {

	constructor(props:PHeaderRowProps) {
        super(props);
		this.onChange = this.onChange.bind(this);
	}

	private onChange(event:React.FormEvent<any>):void {
		
		var element = event.target as HTMLInputElement;
		if(element.checked)
			this.props.selectAllCategories();
		else
			this.props.unselectAllCategories();
	}
	
	public render() {

		var visibleMonths = this.props.visibleMonths;
		var dataColumnHeaders:Array<JSX.Element> = [];
		for(var i:number = 1; i <= visibleMonths; i++) {

			dataColumnHeaders = dataColumnHeaders.concat([
				<div key={"separator_" + i} className={i == 1 ? "vertical-separator" : "vertical-separator-thick"} />,
				<div key={"budgeted_" + i} style={LabelContainerStyle}>
					<label style={i < visibleMonths ? LableStyle : BoldLableStyle}>BUDGETED</label>
				</div>,
				<div key={"activity_" + i} style={LabelContainerStyle}>
					<label style={i < visibleMonths ? LableStyle : BoldLableStyle}>ACTIVITY</label>
				</div>,
				<div key={"available_" + i} style={LabelContainerStyle}>
					<label style={i < visibleMonths ? LableStyle : BoldLableStyle}>AVAILABLE</label>
				</div>
			]);
		}

    	return (
			<div style={HeaderRowContainerStyle}>
				<div style={SelectionColumnStyle}>
					<input type="checkbox" onChange={this.onChange} />
				</div>
				<div style={CategoryLabelContainerStyle}>
					<label style={LableStyle}>CATEGORY</label>
				</div>
				{dataColumnHeaders}
			</div>
		);
  	}

}