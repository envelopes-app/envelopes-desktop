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

export class PSelectionColumnHeader extends React.Component<PSelectionColumnHeaderProps, {}> {

	constructor(props:PSelectionColumnHeaderProps) {
        super(props);
		this.onChange = this.onChange.bind(this);
	}

	private onChange(event:React.FormEvent<any>):void {
		
		var element = event.target as HTMLInputElement;
		if(element.checked)
			this.props.selectAllTransactions();
		else
			this.props.unselectAllTransactions();
	}

	public render() {

		var columnHeaderStyle = Object.assign({}, {lineHeight: this.props.height + 'px'});
    	return (
			<div className="register-header-cell" style={columnHeaderStyle}>
				<input style={{marginTop:"0px"}} type='checkbox' onChange={this.onChange} />
			</div>
		);
  	}
}
