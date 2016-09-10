/// <reference path="../../_includes.ts" />

import { connect } from 'react-redux';

import * as budgetEntities from '../../interfaces/budgetEntities';
import { IApplicationState } from '../../interfaces/state';
import { SidebarActionsCreator } from '../../actionCreators';

import { PRegister } from './PRegister';

const mapStateToProps = (state:IApplicationState) => {
	return {
		applicationState: state
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