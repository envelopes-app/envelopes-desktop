/// <reference path="../../../_includes.ts" />

import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { Table, Column, Cell } from 'fixed-data-table';

import { PClearedColumnHeader } from './PClearedColumnHeader';
import { PColumnHeader } from './PColumnHeader';
import { PFlagColumnHeader } from './PFlagColumnHeader';
import { PSelectionColumnHeader } from './PSelectionColumnHeader';

export interface PRegisterDataGridProps {
	showAccountsColumn:boolean;
}

const RegisterDataGridContainerStyle = {
	flex: '1 1 auto',
	backgroundColor: '#567890'
}

export class PRegisterDataGrid extends React.Component<PRegisterDataGridProps, {componentWidth:number, componentHeight:number}> {
  
	private dataGridContainer:HTMLDivElement;

	constructor(props: any) {
        super(props);
		this.handleWindowResize = this.handleWindowResize.bind(this);
		this.state = { componentWidth:0, componentHeight:0 };
	}

	public componentDidMount() {
		window.addEventListener("resize", this.handleWindowResize);
		this.updateComponentDimensions();
	}

	public componentWillUnmount() {
		window.removeEventListener("resize", this.handleWindowResize);
	}

	private handleWindowResize() {
		this.updateComponentDimensions();
	}

	private updateComponentDimensions() {
		var div = ReactDOM.findDOMNode(this.dataGridContainer);
		var width = div.clientWidth;
		var height = div.clientHeight;
		this.setState({ componentWidth:width, componentHeight:height });
	}

	public render() {

		var showDataGrid:boolean = this.state.componentWidth > 0 && this.state.componentHeight > 0;
		if(showDataGrid) {

			var tableColumns = [
				<Column 
					key="selectionColumn"
					width={25}
					header={<PSelectionColumnHeader />}
				/>,
				<Column 
					key="flagColumn"
					width={30}
					header={<PFlagColumnHeader />}
				/>,
				<Column 
					key="accountColumn"
					width={100}
					header={<PColumnHeader label="ACCOUNT" showSortIcon={false} />}
				/>,
				<Column 
					key="dateColumn"
					width={90}
					header={<PColumnHeader label="DATE" showSortIcon={true} />}
				/>,
				<Column 
					key="payeeColumn"
					width={170}
					header={<PColumnHeader label="PAYEE" showSortIcon={false} />}
				/>,
				<Column 
					key="categoryColumn"
					width={300}
					header={<PColumnHeader label="CATEGORY" showSortIcon={false} />}
				/>,
				<Column 
					key="memoColumn"
					width={170}
					flexGrow={1}
					header={<PColumnHeader label="MEMO" showSortIcon={false} />}
				/>,
				<Column 
					key="outflowColumn"
					width={100}
					header={<PColumnHeader label="OUTFLOW" showSortIcon={false} />}
				/>,
				<Column 
					key="inflowColumn"
					width={100}
					header={<PColumnHeader label="INFLOW" showSortIcon={false} />}
				/>,
				<Column 
					key="clearedColumn"
					width={30}
					header={<PClearedColumnHeader />}
				/>
			];

			if(this.props.showAccountsColumn == false) {
				// Remove the accounts column from the array we created above
				tableColumns.splice(2, 1); // Start at index 2, remove 1 item
			}

			return (
				<div style={RegisterDataGridContainerStyle} ref={(d)=> this.dataGridContainer = d}>
					<Table headerHeight={25} rowHeight={25} rowsCount={100} width={this.state.componentWidth} height={this.state.componentHeight}>
						{tableColumns}
					</Table>
				</div>
			);
		}
		else {
			return (
				<div style={RegisterDataGridContainerStyle} ref={(d)=> this.dataGridContainer = d} />
			);
		}
  	}
}