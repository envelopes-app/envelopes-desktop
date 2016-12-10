/// <reference path='../_includes.ts' />

import * as _ from 'lodash';
import { DateWithoutTime } from './DateWithoutTime';

export class SerializationUtilities {

	// These methods are primarily used for converting an array of dates coming from the server. The
	// format of the array that comes from the server is as follows:-
	// {2015-04-01, 2015-05-01, ... }
	public static serializeDateArray(datesArray:Array<DateWithoutTime>):string {

		if(!datesArray || datesArray.length == 0)
			return null;

		// Build a string representation from the dates array
		var datesString:string = "{";
		datesArray.forEach((date:DateWithoutTime)=>{
			datesString += date.toISOString() + ",";
		});

		// Remove the last comma and append a closing brace
		if(datesString.charAt(datesString.length - 1) == ",")
			datesString = datesString.substr(0, datesString.length - 1);

		datesString += "}";

		return datesString;
	}

	public static serializeISODateArray(datesArray:Array<string>):string {

		if(!datesArray || datesArray.length == 0)
			return null;

		// Build a string representation from the dates array
		var datesString:string = "{";
		datesArray.forEach((date:string)=>{

			datesString += date + ",";
		});

		// Remove the last comma and append a closing brace
		if(datesString.charAt(datesString.length - 1) == ",")
			datesString = datesString.substr(0, datesString.length - 1);

		datesString += "}";

		return datesString;
	}

	public static deserializeDateArray(datesArrayString:string):Array<DateWithoutTime> {

		var dateWithoutTimesArray:Array<DateWithoutTime> = [];
		if(!datesArrayString || datesArrayString == "")
			return dateWithoutTimesArray;

		// The first and last characters are the parenthesis, so remove those
		datesArrayString = datesArrayString.substring(1, datesArrayString.length - 1);
		var dateStringsArray:Array<string> = datesArrayString.split(",");
		_.forEach(dateStringsArray, (dateString:string)=>{
			var date = DateWithoutTime.createFromISOString(dateString);
			dateWithoutTimesArray.push(date);
		});

		return dateWithoutTimesArray;
	}

	public static deserializeISODateArray(datesArrayString:string):Array<string> {

		if(datesArrayString == null)
			return [];

		// The first and last characters are the parenthesis, so remove those
		datesArrayString = datesArrayString.substring(1, datesArrayString.length - 1);
		var isoDatesArray:Array<string> = datesArrayString.split(",");
		return isoDatesArray;
	}
}