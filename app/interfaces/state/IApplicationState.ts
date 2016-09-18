import { IEntitiesCollection } from './IEntitiesCollection';
import { ISidebarState } from './ISidebarState';
import { IRegisterState } from './IRegisterState';
import { IBudgetState } from './IBudgetState';
import { SimpleObjectMap } from '../../utilities';

export interface IApplicationState {

	// ****************************************************************************************************
	// Data
	// ****************************************************************************************************
	entitiesCollection:IEntitiesCollection;
	
	// ****************************************************************************************************
	// UI State
	// ****************************************************************************************************
	sidebarState:ISidebarState;
	budgetState:IBudgetState;
	// We will have register state for individual accounts. It would be saved against theie accountIds.
	// The state for the "All Accounts" will be saved against the string "All_Accounts";
	registersState:SimpleObjectMap<IRegisterState>;
}