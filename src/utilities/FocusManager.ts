/// <reference path='../_includes.ts' />

import * as _ from 'lodash';
import { SimpleObjectMap } from './SimpleObjectMap';

export class FocusManager {

	private focusItemsList:Array<string> = [];
	private focusFunctionsMap:SimpleObjectMap<()=>void> = {};

	public addFocusObject(focusItemName:string, focusFunction:()=>void):void {

		// Add this named to the focus items list
		this.focusItemsList.push(focusItemName);
		// Save the focus handler for this item in the map
		this.focusFunctionsMap[focusItemName] = focusFunction;  
	}

	public setFocus(focusItemName:string):void {

		// Get the focus function from the map against this focus item
		var focusFunction = this.focusFunctionsMap[focusItemName];
		// Execute the focus function
		focusFunction();
	}

	public moveFocusForward(currentFocusItemName:string, stepSize:number = 1):void {

		// Get the index of this item from the focus items list
		var index = _.indexOf(this.focusItemsList, currentFocusItemName);
		if(index != -1) {

			// Increment the index to get the next item in the list
			index += stepSize;
			// If we have reached the end of the list, then move back to the beginning
			if(index >= this.focusItemsList.length)
				index = 0;

			// Get the name of the new focus item from the Array and set focus on it
			var newFocusItemName = this.focusItemsList[index];
			this.setFocus(newFocusItemName);
		}
	}

	public moveFocusBackward(currentFocusItemName:string, stepSize:number = 1):void {

		// Get the index of this item from the focus items list
		var index = _.indexOf(this.focusItemsList, currentFocusItemName);
		if(index != -1) {

			// Decrement the index to get the next item in the list
			index -= stepSize;
			// If we have reached the start of the list, then move back to the end
			if(index < 0)
				index = this.focusItemsList.length - 1;

			// Get the name of the new focus item from the Array and set focus on it
			var newFocusItemName = this.focusItemsList[index];
			this.setFocus(newFocusItemName);
		}
	}
}