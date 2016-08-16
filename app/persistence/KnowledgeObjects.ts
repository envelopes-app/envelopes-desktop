/// <reference path='../_includes.ts' />

export class SyncKnowledge {

	// This is a counter that is used to get knowledge value for new entities or changes to existing entities
	public currentDeviceKnowledge:number = 0;

	// This is the knowledge that has been synced with the server for this device.
	// We send this value to the server as "starting_device_knowledge" to indicate that we expect the server knows
	// about this device up until this device knowledge. It's a sanity check to make sure that the server and this device
	// are on the same page.
	// We also send the currentDeviceKnowledge value as "ending_device_knowledge" to indicate that we are sending it
	// changes up until this device knowledge.
	// The server sends us back the "ending_device_knowledge" value in response to the persistChanges call to acknowledge
	// that it has received and incorporated knowledge upto this value from this device. That "ending_device_knowledge"
	// value is saved back as the serverKnowledgeOfDevice.
	public serverKnowledgeOfDevice:number = 0;

	// When we get changes from the server, it sends us it's current knowledge to let us know that we have got all changes
	// from the server up until this knowledge value.
	// When we send our changes back to the server, we send this value to let the server know that these changed entities
	// know about the server's changes up to this knowledge value.
	public deviceKnowledgeOfServer:number = 0;

	// This is used to store the knowledge values that we last loaded from the local storage into the EntityManager.
	// Since these represent the knowledge values for the in-memory EntityManager, these are not persisted to the database.
	public lastDeviceKnowledgeLoadedFromLocalStorage:number = 0;

	public getCurrentValue():number {

		return this.currentDeviceKnowledge;
	}

	public getNextValue():number {

		++this.currentDeviceKnowledge;
		return this.currentDeviceKnowledge;
	}

	public resetValues():void {

		// Note: I have gone back and forth on whether or not the `currentDeviceKnowledge` should ever be reset
		// After first I thought it should never be reset, because we never want it to go backwards from the perspective of the server
		// However, it is allowed for the knowledge to drop to 0 IF the client has forgotten what it knew, and wants
		// to sync with the server and get caught up to where it was before. If the client claims to have 0 knowledge,
		// the server will respond with ALL entities, and the last known knowledge of this client.
		// The client will then remember that's what its knowledge should be, and pick up where it left off
		// We previously didn't do this last step, and the server would just believe the client that it was back at knowledge 0,
		// so the client couldn't catch up to its previous knowledge, and subsequent modifications from this client
		// would have appeared to come from a client that _used_ to know knowledge 100, but now just knew knowledge 1.
		// Now that the sync algorithm knows to respect the returned `server_knowledge_of_client` value, it is safe to reset
		// it to 0 when we reset the other values to 0.
		this.currentDeviceKnowledge = 0;
		this.serverKnowledgeOfDevice = 0;
		this.deviceKnowledgeOfServer = 0;
		this.lastDeviceKnowledgeLoadedFromLocalStorage = 0;
	}
}

export class CatalogKnowledge extends SyncKnowledge { }

export class BudgetKnowledge extends SyncKnowledge {

	// This is a counter that is used to get knowledge value for new calculation entities or
	// changes to existing calculation entities. This is used only on the mobile.
	public currentDeviceKnowledgeForCalculations:number = 0;

	// This is used to store the knowledge values that we last loaded from the local storage into the EntityManager.
	// Since these represent the knowledge values for the in-memory EntityManager, these are not persisted to the database.
	// Like the above field, this is used only on the mobile.
	public lastDeviceKnowledgeForCalculationsLoadedFromLocalStorage:number = 0;

	public getCurrentValueForCalculations():number {

		return this.currentDeviceKnowledgeForCalculations;
	}

	public getNextValueForCalculations():number {

		++this.currentDeviceKnowledgeForCalculations;
		return this.currentDeviceKnowledgeForCalculations;
	}

	public resetValues():void {

		super.resetValues();
		this.currentDeviceKnowledgeForCalculations = 0;
		this.lastDeviceKnowledgeForCalculationsLoadedFromLocalStorage = 0;
	}
}