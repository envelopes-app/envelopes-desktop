/// <reference path="../_includes.ts" />

import * as React from 'react';
import * as ReactDOM from 'react-dom';

import getMuiTheme from 'material-ui/styles/getMuiTheme';
import { MuiThemeProvider, lightBaseTheme } from 'material-ui/styles';

import CSidebar from './sidebar/CSidebar';

const AppStyle = {
  display: "flex",
  flexFlow: "row nowrap"
}

const AppSidebarStyle = {
	flex: "0 1 260em"
}

const AppModuleContainerStyle = {
	flex: "1 1 auto"
}

export interface AppProps {}

export class App extends React.Component<AppProps, {}> {
  
	public render() {
    	return (
			<MuiThemeProvider muiTheme={getMuiTheme(lightBaseTheme)}>
				<div style={AppStyle}>
					<div style={AppSidebarStyle}>
						<CSidebar />
					</div>
					<div style={AppModuleContainerStyle}>
						{this.props.children}
					</div>
				</div>
			</MuiThemeProvider>
		);
  	}
}