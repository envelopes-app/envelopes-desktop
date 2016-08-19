import { IEntitiesCollectionWithMaps } from './IEntitiesCollectionWithMaps';
import { ISidebarState } from './ISidebarState';
import { IRegisterState } from './IRegisterState';
import { IBudgetState } from './IBudgetState';

export interface IApplicationState {

	// ****************************************************************************************************
	// Data
	// ****************************************************************************************************
	entitiesCollection:IEntitiesCollectionWithMaps;
	
	// ****************************************************************************************************
	// UI State
	// ****************************************************************************************************
	sidebarState:ISidebarState;
	registerState:IRegisterState;
	budgetState:IBudgetState;
}