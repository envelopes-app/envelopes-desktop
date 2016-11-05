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
import { IImportedAccountObject } from '../interfaces/objects';
import { IApplicationState, ISimpleEntitiesCollection } from '../interfaces/state';
import * as catalogEntities from '../interfaces/catalogEntities';

const AppStyle = {
  display: "flex",
  flexFlow: "row nowrap",
  alignItems: "stretch",
  position: "absolute",
  width: "100%",
  height: "100%"
}

const AppSidebarStyle = {
	flex: "0 0 260px"
}

const AppModuleContainerStyle = {
	flex: "1 1 auto"
}

export interface AppProps {
	// Application State
	applicationState:IApplicationState;
	// Dispatcher functions
	createBudget:(budget:catalogEntities.IBudget)=>void;
	openBudget:(budget:catalogEntities.IBudget)=>void;
	importYnabData:(budgetName:string, accountsList:Array<IImportedAccountObject>, budgetRows:Array<any>, registerRows:Array<any>)=>void;
	updateEntities:(entitiesCollection:ISimpleEntitiesCollection)=>void;
}

export class PApp extends React.Component<AppProps, {}> {
  
	private budgetDialog:PBudgetDialog;
	private openBudgetDialog:POpenBudgetDialog;
	private importYnabDataDialog:PImportYnabDataDialog;

	constructor(props:any) {
		super(props);

		this.startListeningForMessages = this.startListeningForMessages.bind(this);
		this.handleCreateNewBudgetMessage = this.handleCreateNewBudgetMessage.bind(this);
		this.handleOpenBudgetMessage = this.handleOpenBudgetMessage.bind(this);
		this.handleShowBudgetProperties = this.handleShowBudgetProperties.bind(this);
		this.handleImportYnabBudgetData = this.handleImportYnabBudgetData.bind(this);

		// Start listening for menu messages from the main window
		this.startListeningForMessages();
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
						activeBudgetId={this.props.applicationState.activeBudgetId}
						entitiesCollection={this.props.applicationState.entitiesCollection}
						showCreateNewBudgetDialog={this.handleCreateNewBudgetMessage}
						openBudget={this.props.openBudget}
					/>

					<PImportYnabDataDialog 
						ref={(d)=> this.importYnabDataDialog = d }
						entitiesCollection={this.props.applicationState.entitiesCollection}
						importYnabData={this.props.importYnabData}
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

			else if(menuArgs && menuArgs.menu == "show_budget_properties")			
				this.handleShowBudgetProperties();

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

	private handleShowBudgetProperties():void {

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