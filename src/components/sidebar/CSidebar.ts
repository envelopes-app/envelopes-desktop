/// <reference path="../../_includes.ts" />

import { connect } from 'react-redux';

import { Account } from '../../models/Account';
import { ApplicationState } from '../../models/ApplicationState';
import * as AccountActions from './ASidebarActions';
import { PSidebar } from './PSidebar';

const mapStateToProps = (state:ApplicationState) => {
	return {
    	accounts: state.accounts
  	};
};

const mapDispatchToProps = (dispatch:ReactRedux.Dispatch<ApplicationState>) => {
  	return {
    	onAddAccount: (account:Account) => {
      		dispatch(AccountActions.addAccount(account));
    	},
    	onUpdateAccount: (account:Account) => {
      		dispatch(AccountActions.updateContact(account));
    	},
    	onDeleteAccount: (accountId:string) => {
      		dispatch(AccountActions.deleteContact(accountId));
    	}
	}
}

const CSidebar = connect(mapStateToProps, mapDispatchToProps)(PSidebar);
export default CSidebar;
