/// <reference path='../_includes.ts' />

import * as numeral from 'numeral';
import { DateWithoutTime } from './DateWithoutTime'; 
import { IDataFormat } from '../interfaces/formatters';

export class DataFormatter {

	private dataFormat:IDataFormat;
	private currencyFormatString:string;

	constructor(dataFormat:IDataFormat) {

		this.dataFormat = dataFormat;

		// Setup a fake 'enab' language with the details we need
		numeral.language('enab', {
			delimiters: {
				thousands: dataFormat.group_separator,
				decimal: dataFormat.decimal_separator
			},
			abbreviations: {
				thousand: 'k',
				million: 'm',
				billion: 'b',
				trillion: 't'
			},
			ordinal: function (number) {
				var b = number % 10;
				return (~~ (number % 100 / 10) === 1) ? 'th' :
					(b === 1) ? 'st' :
						(b === 2) ? 'nd' :
							(b === 3) ? 'rd':'th';
			},
			currency: {
				symbol: dataFormat.currency_symbol
			}
		});

		numeral.language('enab');

		var currencyFormatString = `0,0`;
		if(dataFormat.decimal_digits == 1)
			currencyFormatString = `${currencyFormatString}.0`;
		else if(dataFormat.decimal_digits == 2)
			currencyFormatString = `${currencyFormatString}.00`;
		else if(dataFormat.decimal_digits == 3)
			currencyFormatString = `${currencyFormatString}.000`;

		if(dataFormat.display_symbol) {
			if(dataFormat.symbol_first)
				currencyFormatString = `$currencyFormatString`;	
			else
				currencyFormatString = `currencyFormatString$`;	
		}

		this.currencyFormatString = currencyFormatString;
	}


	// Given a date in the date format specified in the currently active budget, return a DateWithoutTime object
	public parseDate(dateInCustomFormat:string):DateWithoutTime {
		return DateWithoutTime.createFromString(dateInCustomFormat, this.dataFormat.date_format);
	}

	public formatDate(value:number):string {
		var date = DateWithoutTime.createFromUTCTime(value);
		return date.format(this.dataFormat.date_format);
	}

	public formatDateWithoutTime(value:DateWithoutTime):string {
		return value.format(this.dataFormat.date_format);
	}

	// Given a milli-number, convert it to a formatted number string as specified by the number format
	// in the active budget
	public formatCurrency(value:number):string {
		var formattedString = numeral(value).format(this.currencyFormatString);
		return formattedString;
	}

	// Given a formatted number string in the number format specified in the active budget, convert it
	// to a plain milli-number
	public unformatCurrency(value:string):number {
		var unformattedNumber = numeral(this.currencyFormatString).unformat(value);
		return unformattedNumber;
	}
}