/// <reference path="../_includes.ts" />

import * as React from 'react';
import * as ReactDOM from 'react-dom';

import getMuiTheme from 'material-ui/styles/getMuiTheme';
import { MuiThemeProvider, lightBaseTheme } from 'material-ui/styles';

import { PBudgetDialog } from './dialogs/PBudgetDialog';
import { POpenBudgetDialog } from './dialogs/POpenBudgetDialog';
import { PImportYnabDataDialog } from './dialogs/PImportYnabDataDialog';

import CSidebar from './sidebar/CSidebar';
import CBudget from './budget/CBudget';
import CRegister from './register/CRegister';
import { DataFormats, DataFormatter, Logger } from '../utilities';
import { IDataFormat } from '../interfaces/formatters';
import { IImportedAccountObject } from '../interfaces/objects';
import { IApplicationState, ISimpleEntitiesCollection } from '../interfaces/state';
import * as catalogEntities from '../interfaces/catalogEntities';

const AppStyle = {
	display: "flex",
	flexFlow: "row nowrap",
	alignItems: "stretch",
	position: "absolute",
	width: "100%",
	height: "100%",
	overflowY: "hidden"
}

const AppSidebarStyle = {
	flex: "0 0 auto"
}

const AppModuleContainerStyle = {
	flex: "1 1 auto",
	minWidth: "800px"
}

export interface AppProps {
	// Application State
	applicationState:IApplicationState;
	// Dispatcher functions
	createBudget:(budget:catalogEntities.IBudget)=>void;
	openBudget:(budget:catalogEntities.IBudget)=>void;
	updateEntities:(entitiesCollection:ISimpleEntitiesCollection)=>void;
}

export interface AppState {
	dataFormat:string;
	dataFormatter:DataFormatter;
}

export class PApp extends React.Component<AppProps, AppState> {
  
	// TODO: Unit Tests
	// TODO: Reports
	// TODO: Undo/Redo Support
	// TODO: When in production mode, log to files instead of console
	// TODO: Clean log files older then 5 days
	// TODO: Integration with Payment and Licensing
	private budgetDialog:PBudgetDialog;
	private openBudgetDialog:POpenBudgetDialog;
	private importYnabDataDialog:PImportYnabDataDialog;

	constructor(props:AppProps) {
		super(props);

		this.startListeningForMessages = this.startListeningForMessages.bind(this);
		this.handleCreateNewBudgetMessage = this.handleCreateNewBudgetMessage.bind(this);
		this.handleOpenBudgetMessage = this.handleOpenBudgetMessage.bind(this);
		this.handleShowBudgetSettings = this.handleShowBudgetSettings.bind(this);
		this.handleImportYnabBudgetData = this.handleImportYnabBudgetData.bind(this);
		// Default the formatter to en_US so that we have something to work with at startup
		var dataFormat = DataFormats.locale_mappings["en_US"];
		this.state = {
			dataFormat: JSON.stringify(dataFormat),
			dataFormatter: new DataFormatter(dataFormat)
		}

		// Start listening for menu messages from the main window
		this.startListeningForMessages();
	}

	public componentWillReceiveProps(nextProps:AppProps):void {

		// If the dataFormat in the active budget has changed, then recreate the dataFormatter.
		var activeBudgetId = nextProps.applicationState.activeBudgetId;
		if(activeBudgetId && nextProps.applicationState.entitiesCollection.budgets) {

			var activeBudget = nextProps.applicationState.entitiesCollection.budgets.getEntityById(activeBudgetId);
			if(activeBudget && activeBudget.dataFormat != this.state.dataFormat) {
				var dataFormat = JSON.parse(activeBudget.dataFormat) as IDataFormat;
				var dataFormatter = new DataFormatter(dataFormat);
				var state = Object.assign({}, this.state) as AppState;
				state.dataFormat = activeBudget.dataFormat;
				state.dataFormatter = dataFormatter;
				this.setState(state);
			}

			this.updateAppTitle(activeBudget.budgetName);
		}
	} 

	private updateAppTitle(activeBudgetName:string):void {

		var { ipcRenderer } = require('electron');
		var payload:any = {
			activeBudgetName: activeBudgetName
		};
		// Send the request to the main process
		ipcRenderer.send("window-title-request", payload);
	}

	public componentDidMount() {

		document.addEventListener('dragover', (event)=>{
			event.preventDefault();
			return false;
		}, false);

		document.addEventListener('drop', (event)=>{
			event.preventDefault();
			return false;
		}, false);	
	}

	public render() {

		var visibleModule;
		// Get the selection from the sidebar state. Based on it, we are going to either be showing
		// the budget screen, the reports, or the register.
		var selectedTab = this.props.applicationState.sidebarState.selectedTab;
		if(selectedTab == "Budget")
			visibleModule = <CBudget />
		else if(selectedTab == "Reports") {}
		else
			visibleModule = <CRegister />;
		
    	return (
			<MuiThemeProvider muiTheme={getMuiTheme(lightBaseTheme)}>
				<div style={AppStyle}>
					<div style={AppSidebarStyle}>
						<CSidebar />
					</div>
					<div style={AppModuleContainerStyle}>
						{visibleModule}
					</div>

					<PBudgetDialog 
						ref={(d)=> this.budgetDialog = d }
						entitiesCollection={this.props.applicationState.entitiesCollection}
						createBudget={this.props.createBudget}
						updateEntities={this.props.updateEntities}
					/>

					<POpenBudgetDialog 
						ref={(d)=> this.openBudgetDialog = d }
						dataFormatter={this.state.dataFormatter}
						activeBudgetId={this.props.applicationState.activeBudgetId}
						entitiesCollection={this.props.applicationState.entitiesCollection}
						showCreateNewBudgetDialog={this.handleCreateNewBudgetMessage}
						updateEntities={this.props.updateEntities}
						openBudget={this.props.openBudget}
					/>

					<PImportYnabDataDialog 
						ref={(d)=> this.importYnabDataDialog = d }
						dataFormatter={this.state.dataFormatter}
						activeBudgetId={this.props.applicationState.activeBudgetId}
						entitiesCollection={this.props.applicationState.entitiesCollection}
						showBudgetSettings={this.handleShowBudgetSettings}
						updateEntities={this.props.updateEntities}
					/>
				</div>
			</MuiThemeProvider>
		);
  	}

	/* ************************************************************************************* */
	// Methods for handling the menu actions
	/* ************************************************************************************* */
	private startListeningForMessages():void {

		var { ipcRenderer } = require('electron');
		ipcRenderer.on("menu-message", (event, ...args:any[])=> {

			var menuArgs = args[0];
			if(menuArgs && menuArgs.menu == "create_new_budget")			
				this.handleCreateNewBudgetMessage();

			else if(menuArgs && menuArgs.menu == "open_budget")			
				this.handleOpenBudgetMessage();

			else if(menuArgs && menuArgs.menu == "show_budget_settings")			
				this.handleShowBudgetSettings();

			else if(menuArgs && menuArgs.menu == "import_ynab_budget_data")
				this.handleImportYnabBudgetData();
		});
	}

	private handleCreateNewBudgetMessage():void {

		if(this.budgetDialog.isShowing() == false) {
			this.budgetDialog.show();
		}
	}

	private handleOpenBudgetMessage():void {

		if(this.openBudgetDialog.isShowing() == false) {
			this.openBudgetDialog.show();
		}
	}

	private handleShowBudgetSettings():void {

		if(this.budgetDialog.isShowing() == false) {
			// Get the currentl active budget from the state and pass it to the budget dialog
			var budgetId = this.props.applicationState.activeBudgetId;
			var budget = this.props.applicationState.entitiesCollection.budgets.getEntityById(budgetId);
			this.budgetDialog.show(budget);
		}
	}

	private handleImportYnabBudgetData():void {

		if(this.importYnabDataDialog.isShowing() == false) {
			this.importYnabDataDialog.show();
		}
	}
}