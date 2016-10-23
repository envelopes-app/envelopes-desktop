/// <reference path='../_includes.ts' />

import * as _ from 'lodash';
import { SimpleObjectMap } from '../utilities'; 

// TODO: Add sorting support
export class EntitiesArray<T extends {entityId:string}> {

	protected internalArray:Array<T> = [];
	protected internalMap:SimpleObjectMap<T> = {};

	constructor(initialValues:Array<T> = null) {
		// If an array of initial values is passed, iterate through them and add them to
		// this array one by one using the addObject method
		if(initialValues) {
			_.forEach(initialValues, (entity:T)=>{
				this.addEntity(entity);
			});
		}
	}

	public get length():number {
		return this.internalArray.length;
	}

	public getItemAt(index:number):T {
		return this.internalArray[index];
	}

	public addOrReplaceEntity(entity:T):void {
		this.removeEntityById(entity.entityId);
		this.addEntity(entity);
	}

	public getEntityById(entityId:string):T {
		return this.internalMap[entityId];
	}

	public getAllItems():Array<T> {
		return this.internalArray;
	}

	protected getIndexForInsertion(entity:T):number {

		// The default implementation here just returns the last index of the array
		// so that items are inserted at the end. This can be overridden by derived
		// classes to provide sorted insertion.
		return this.internalArray.length;
	}

	protected addEntity(entity:T):void {
		var index = this.getIndexForInsertion(entity);
		this.internalArray.splice(index, 0, entity);
		this.internalMap[entity.entityId] = entity;
	}

	public removeEntityById(entityId:string):T {
		var removedEntities:T[];
		// Check if we have an entity with the passed entityId. If we do, then remove that.
		if(this.internalMap[entityId]) {
			var index = _.findIndex(this.internalArray, {entityId: entityId});
			removedEntities = this.internalArray.splice(index, 1);
			this.internalMap[entityId] = null;
		}

		if(removedEntities && removedEntities.length > 0)
			return removedEntities[0];
		else
			return null;
	}
} 