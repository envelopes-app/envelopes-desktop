/// <reference path="../../_includes.ts" />

import { connect } from 'react-redux';

import { IAccount } from '../../interfaces/budgetEntities';
import { IApplicationState, ISimpleEntitiesCollection } from '../../interfaces/state';
import { GlobalActionsCreator, SidebarActionsCreator } from '../../actionCreators';

import { PSidebar } from './PSidebar';

const mapStateToProps = (state:IApplicationState) => {
	return {
    	entitiesCollection: state.entitiesCollection,
		sidebarState: state.sidebarState
  	};
};

const mapDispatchToProps = (dispatch:ReactRedux.Dispatch<IApplicationState>) => {
  	return {
		setSelectedTab: (selectedTab:string, selectedAccountId:string) => {
			dispatch(SidebarActionsCreator.setSelectedTab(selectedTab, selectedAccountId));
		},  

    	addAccount: (account:IAccount, currentBalance:number) => {
      		dispatch(SidebarActionsCreator.createNewAccount(account, currentBalance));
    	},

    	updateAccount: (account:IAccount, currentBalance:number) => {
      		dispatch(SidebarActionsCreator.updateExistingAccount(account, currentBalance));
    	},

		updateEntities:(entitiesCollection:ISimpleEntitiesCollection) => {
      		dispatch(GlobalActionsCreator.syncBudgetDataWithDatabase(entitiesCollection));
		}
	}
}

const CSidebar = connect(mapStateToProps, mapDispatchToProps)(PSidebar);
export default CSidebar;