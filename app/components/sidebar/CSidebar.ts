/// <reference path="../../_includes.ts" />

import { connect } from 'react-redux';

import { IAccount } from '../../interfaces/budgetEntities';
import { IApplicationState } from '../../interfaces/state';
import { SidebarActionsCreator } from '../../actionCreators';

import { PSidebar } from './PSidebar';

const mapStateToProps = (state:IApplicationState) => {
	return {
    	accounts: state.entitiesCollection.accounts,
		sidebarState: state.sidebarState
  	};
};

const mapDispatchToProps = (dispatch:ReactRedux.Dispatch<IApplicationState>) => {
  	return {
		setSelectedTab: (selectedTab:string, selectedAccountId:string) => {
			dispatch(SidebarActionsCreator.setSelectedTab(selectedTab, selectedAccountId));
		},  

		setBudgetAccountsExpanded: (expanded:boolean) => {
			dispatch(SidebarActionsCreator.setBudgetAccountsExpanded(expanded));
		},

		setTrackingAccountsExpanded: (expanded:boolean) => {
			dispatch(SidebarActionsCreator.setTrackingAccountsExpanded(expanded));
		},

		setClosedAccountsExpanded: (expanded:boolean) => {
			dispatch(SidebarActionsCreator.setClosedAccountsExpanded(expanded));
		},

    	addAccount: (account:IAccount, currentBalance:number) => {
      		dispatch(SidebarActionsCreator.createNewAccount(account, currentBalance));
    	},

    	updateAccount: (account:IAccount, currentBalance:number) => {
      		dispatch(SidebarActionsCreator.updateExistingAccount(account, currentBalance));
    	}
	}
}

const CSidebar = connect(mapStateToProps, mapDispatchToProps)(PSidebar);
export default CSidebar;