/// <reference path="../../../_includes.ts" />

import * as _ from 'lodash';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Overlay, Popover } from 'react-bootstrap';

export interface PSubCategoryEditDialogProps {
}

export interface PSubCategoryEditDialogState {
	show:boolean;
	target:Element;
	placement:string;
}

const PopoverStyle = {

}

export class PSubCategoryEditDialog extends React.Component<PSubCategoryEditDialogProps, PSubCategoryEditDialogState> {

	constructor(props: any) {
        super(props);
		this.state = {show:false, target:null, placement:"bottom"};
	}

	public show(target:Element, placement:string = "bottom"):void {
		var state = _.assign({}, this.state) as PSubCategoryEditDialogState;
		state.show = true;
		state.target = target;
		state.placement = placement;
		this.setState(state);
	}

	public hide():void {
		var state = _.assign({}, this.state) as PSubCategoryEditDialogState;
		state.show = false;
		state.target = null;
		this.setState(state);
	}

	public render() {

		return (
			<Overlay show={this.state.show} placement={this.state.placement} target={ ()=> ReactDOM.findDOMNode(this.state.target) }>
				<Popover id="subCategoryEditDialog" style={PopoverStyle}>
					Hello
				</Popover>
			</Overlay>
		);
	}
}
