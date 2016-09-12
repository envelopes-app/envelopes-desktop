import { IEntitiesCollection } from './IEntitiesCollection';
import { ISidebarState } from './ISidebarState';
import { IRegisterState } from './IRegisterState';
import { IBudgetState } from './IBudgetState';

export interface IApplicationState {

	// ****************************************************************************************************
	// Data
	// ****************************************************************************************************
	entitiesCollection:IEntitiesCollection;
	
	// ****************************************************************************************************
	// UI State
	// ****************************************************************************************************
	sidebarState:ISidebarState;
	registerState:IRegisterState;
	budgetState:IBudgetState;
}