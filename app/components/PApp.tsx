/// <reference path="../_includes.ts" />

import * as React from 'react';
import * as ReactDOM from 'react-dom';

import getMuiTheme from 'material-ui/styles/getMuiTheme';
import { MuiThemeProvider, lightBaseTheme } from 'material-ui/styles';

import CSidebar from './sidebar/CSidebar';
import CBudget from './budget/CBudget';
import CRegister from './register/CRegister';
import { IApplicationState } from '../interfaces/state';

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
	// State Variable
	applicationState:IApplicationState;
}

export class PApp extends React.Component<AppProps, {}> {
  
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
				</div>
			</MuiThemeProvider>
		);
  	}
}