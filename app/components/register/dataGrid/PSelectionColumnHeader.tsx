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

		var columnHeaderStyle = _.assign({}, {lineHeight: this.props.height + 'px'});
    	return (
			<div className="register-header-cell" style={columnHeaderStyle}>
				<input type='checkbox' onChange={this.onChange} />
			</div>
		);
  	}
}
