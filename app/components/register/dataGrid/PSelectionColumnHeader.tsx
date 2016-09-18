/// <reference path="../../../_includes.ts" />

import * as _ from 'lodash';
import * as React from 'react';
import * as ReactDOM from 'react-dom';

export interface PSelectionColumnHeaderProps {
	height?: number;
	width?: number;
	columnKey?:string;
	selectAllTransactions:()=>void;
	unselectAllTransactions:()=>void;
}

const PSelectionColumnHeaderStyle = {
	display: 'block',
	backgroundColor: 'white',
	color: '#4C7079',
	fontSize: '12px',
	fontWeight: 'normal',
	width: '100%',
	height: '100%',
	textAlign: 'left',
	verticalAlign: 'middle',
	paddingLeft: '5px',
	paddingRight: '5px'
}

export class PSelectionColumnHeader extends React.Component<PSelectionColumnHeaderProps, {}> {

	constructor(props: any) {
        super(props);
		this.onChange = this.onChange.bind(this);
	}

	private onChange(event:React.SyntheticEvent):void {
		
		var element = event.target as HTMLInputElement;
		if(element.checked)
			this.props.selectAllTransactions();
		else
			this.props.unselectAllTransactions();
	}

	public render() {

		var columnHeaderStyle = _.assign({}, PSelectionColumnHeaderStyle, {lineHeight: this.props.height + 'px'});
    	return (
			<div style={columnHeaderStyle}>
				<input type='checkbox' onChange={this.onChange} />
			</div>
		);
  	}
}
