/// <reference path="../../_includes.ts" />

import * as React from 'react';
import * as ReactDOM from 'react-dom';

import '../../styles/fixed-data-table.css';
import { Table, Column, Cell } from 'fixed-data-table';
import * as dataGrid from './dataGrid';

export interface PRegisterDataGridProps {

}

const RegisterDataGridContainerStyle = {
	flex: '1 1 auto',
	backgroundColor: '#567890'
}

const DateHeaderStyle = {
	backgroundColor: 'white',
	color: '#4C7079',
	fontSize: '10px',
	fontWeight: 'normal',
	verticalAlign: 'center'
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
		console.log(`Width = ${this.state.componentWidth}, Height = ${this.state.componentHeight}`);
		if(showDataGrid) {
			return (
				<div style={RegisterDataGridContainerStyle} ref={(d)=> this.dataGridContainer = d}>
					<Table headerHeight={25} rowHeight={25} rowsCount={100} width={this.state.componentWidth} height={this.state.componentHeight}>
						<Column 
							width={25}
							header={<dataGrid.SelectionColumnHeader />}
						/>
						<Column 
							width={30}
							header={<dataGrid.FlagColumnHeader />}
						/>
						<Column 
							width={100}
							header={<dataGrid.ColumnHeader label="ACCOUNT" showSortIcon={false} />}
						/>
						<Column 
							width={90}
							header={<dataGrid.ColumnHeader label="DATE" showSortIcon={true} />}
						/>
						<Column 
							width={170}
							header={<dataGrid.ColumnHeader label="PAYEE" showSortIcon={false} />}
						/>
						<Column 
							width={300}
							header={<dataGrid.ColumnHeader label="CATEGORY" showSortIcon={false} />}
						/>
						<Column 
							width={170}
							flexGrow={1}
							header={<dataGrid.ColumnHeader label="MEMO" showSortIcon={false} />}
						/>
						<Column 
							width={100}
							header={<dataGrid.ColumnHeader label="OUTFLOW" showSortIcon={false} />}
						/>
						<Column 
							width={100}
							header={<dataGrid.ColumnHeader label="INFLOW" showSortIcon={false} />}
						/>
						<Column 
							width={30}
							header={<dataGrid.ClearedColumnHeader />}
						/>
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