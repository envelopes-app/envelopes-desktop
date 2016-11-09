/// <reference path="../../../_includes.ts" />

import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { PLinkButton } from '../../common/PLinkButton';

export interface PBudgetToolbarProps {
	onAddCategoryGroupSelected:(element:HTMLElement)=>void;
}

const BudgetToolbarContainerStyle = {
	flex: '0 0 auto',
	height: '35px',
	width: '100%',
	backgroundColor: '#ffffff',
	paddingLeft: '10px',
	paddingRight: '10px'
}

const BudgetToolbarStyle = {
	display: 'flex',
	flexFlow: 'row nowrap',
	justifyContent: 'flex-start',
	alignItems: 'center',
	height: '100%',
	width: '100%'
}

export class PBudgetToolbar extends React.Component<PBudgetToolbarProps, {}> {
  
	private addCategoryButton:PLinkButton;

	constructor(props: any) {
        super(props);
		this.onAddCategoryButtonClick = this.onAddCategoryButtonClick.bind(this);
	}

	private onAddCategoryButtonClick(event:React.MouseEvent):void {

		var element = ReactDOM.findDOMNode(this.addCategoryButton) as HTMLElement;
		this.props.onAddCategoryGroupSelected(element);
	}

	public render() {
    	return (
			<div style={BudgetToolbarContainerStyle}>
				<div style={BudgetToolbarStyle}>
					<PLinkButton 
						ref={(c)=>{this.addCategoryButton = c;}}
						text="Add Category Group" glyphName="glyphicon-plus-sign" 
						clickHandler={this.onAddCategoryButtonClick} />
				</div>
			</div>
		);
  	}
}