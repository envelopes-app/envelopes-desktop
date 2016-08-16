import { IEntitiesCollectionWithMaps } from './IEntitiesCollectionWithMaps';

export interface IApplicationState {

	entitiesCollection:IEntitiesCollectionWithMaps;
	
	// ****************************************************************************************************
	// UI-Related State
	// ****************************************************************************************************
	sidebar_selectedTab:string; // Budget or Accounts
	sidebar_selectedAccountId:string; // 'allAccount' or a specific account's id 
}