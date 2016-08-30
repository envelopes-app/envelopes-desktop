/// <reference path="../../_includes.ts" />

import { connect } from 'react-redux';

import * as budgetEntities from '../../interfaces/budgetEntities';
import { IApplicationState } from '../../interfaces/state';
import { SidebarActionsCreator } from '../../actionCreators';

import { PRegister } from './PRegister';

const mapStateToProps = (state:IApplicationState) => {
	return {
		accounts: state.entitiesCollection.accounts,
    	transactions: state.entitiesCollection.transactions,
		subTransactions: state.entitiesCollection.subTransactions,
    	scheduledTransactions: state.entitiesCollection.scheduledTransactions,
		scheduledSubTransactions: state.entitiesCollection.scheduledSubTransactions,
		payees: state.entitiesCollection.payees,
		masterCategories: state.entitiesCollection.masterCategories,
		subCategories: state.entitiesCollection.subCategories,
		registerState: state.registerState
  	};
};

const mapDispatchToProps = (dispatch:ReactRedux.Dispatch<IApplicationState>) => {
  	return {

    	addTransaction: (transaction:budgetEntities.ITransaction, subTranactions:Array<budgetEntities.ISubTransaction>) => {
      		//dispatch(SidebarActionsCreator.createNewAccount(account, currentBalance));
    	},

    	updateTransaction: (transaction:budgetEntities.ITransaction, subTranactions:Array<budgetEntities.ISubTransaction>) => {
      		//dispatch(SidebarActionsCreator.updateExistingAccount(account, currentBalance));
    	}
	}
}

const CRegister = connect(mapStateToProps, mapDispatchToProps)(PRegister);
export default CRegister;