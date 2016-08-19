/// <reference path="../../_includes.ts" />

import { connect } from 'react-redux';

import { IAccount } from '../../interfaces/budgetEntities';
import { IApplicationState } from '../../interfaces/state';
import { AccountActionsCreator } from '../../actionCreators';

import { PSidebar } from './PSidebar';

const mapStateToProps = (state:IApplicationState) => {
	return {
    	accounts: state.entitiesCollection.accounts,
		sidebarState: state.sidebarState
  	};
};

const mapDispatchToProps = (dispatch:ReactRedux.Dispatch<IApplicationState>) => {
  	return {
    	onAddAccount: (account:IAccount, currentBalance:number) => {
			// Dispatch action to create the account
      		dispatch(AccountActionsCreator.createNewAccount(account, currentBalance));
    	},

    	onUpdateAccount: (account:IAccount, currentBalance:number) => {
			// Dispatch action to update the account
      		dispatch(AccountActionsCreator.updateExistingAccount(account, currentBalance));
    	}
	}
}

const CSidebar = connect(mapStateToProps, mapDispatchToProps)(PSidebar);
export default CSidebar;