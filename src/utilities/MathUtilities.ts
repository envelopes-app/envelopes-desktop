/// <reference path='../_includes.ts' />

export class MathUtilities {

	public static MIN_INT32 = -Math.pow(2,31);
	public static MAX_INT32 = Math.pow(2,31) - 1;

	// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/MAX_SAFE_INTEGER
	public static MIN_JS_INT = -(Math.pow(2,53) - 1); // -9007199254740991
	public static MAX_JS_INT = Math.pow(2,53) - 1; // 9007199254740991

	// Conversion functions are from: http://speakingjs.com/es5/ch11.html
	// Drops the fraction and does mod32 - this is a Math.floor - NOT a rounding
	public static toInt32(x : number) : number{
		return x | 0;
	}

	// Convert x to an UNsigned 32-bit integer
	public static toUInt32(x) {
		return x >>> 0;
	}

	/**
	 * Returns the integer average of two numbers.
	 * Performs the average first, and then floors the value
	 * @param x
	 * @param y
	 * @returns {number}
	 */
	public static intAverage(x : number, y : number) : number
	{
		return Math.floor((x + y) / 2);

		// I used to try this trick: Math.floor((x & y) + ((x ^ y) >> 1));
		// Explanation here: http://aggregate.org/MAGIC/#Average of Integers
		// But that doesn't work if x or y are greater than MAX_INT32

		// However, the simple thing above works, even for very large values
	}


	/**
	 * Given 100 millicents (10 cents), and a divisor of 3, will return
	 * [30, 10]
	 * @param amountInMillicents
	 * @param divisor
	 * @returns {any[]}
	 */
	public static divideMillicentsWithRemainder(amountInMillicents : number, divisor : number, numberOfDecimalPlaces) : [number, number] {
		// Let's say we are dividing 10 cents in 3 months
		// That's $0.10
		// 100 millicents
		// For US Dollars (two decimal places) We will return 30 as the result and 10 as the remainder
		// If we had 3 decimal places, we would return:
		// 033 as the result and 001 as the remainder
		// In order to make the determination, there are at least two ways to do it
		// We'll do it by getting an answer, rounding to the right number of digits, and then determining the remainder
		// There are other ways too, but this is straightforward

		// First, make sure that we're dealing with an amount that has the right number of decimal places
		amountInMillicents = this.roundMillicents(amountInMillicents, numberOfDecimalPlaces, false);
		var result = this.lopOffDecimalPlaces(amountInMillicents / divisor);
		// This result will be in millicents
		// So we have 33 at this point in our 100/3 example
		// However, we might not care about some of these decimal places
		// In the case of most currencies, they only need two decimals, so the last millicent place is irrelevant
		// We really want 30, so we do this:
		result = this.roundMillicents(result, numberOfDecimalPlaces, true);
		// Now result is 30 (3 cents)
		// So now we get the remainder:
		var remainder = this.lopOffDecimalPlaces(amountInMillicents % result);
		// remainder is now 10 (1 cent), just like we wanted
		return [result, remainder];
	}

	/**
	 * Given a floating point number, lops off anything after the decimal place
	 * (Differs from math.floor in its handling of negative numbers)
	 * @param num
	 * @returns {any}
	 */
	public static lopOffDecimalPlaces(num : number) : number {
		if (num >= 0){
			return Math.floor(num);
		} else {
			return Math.ceil(num);
		}
	}

	// Given 1234 millicents
	// If we have a currency with 3 decimal places, we return: 1234
	// 2 decimal places: 1230
	// 1 decimal place: 1200
	// 0 decimals: 1000
	public static roundMillicents(num : number, numDecimalPlaces : number, lopOffUnused : boolean) : number{
		if ((numDecimalPlaces < 0 ) || (numDecimalPlaces > 3)){
			throw new Error('numDecimalPlaces must be between 0 and 3');
		}
		var numberToRoundTo = [1000, 100, 10, 1][numDecimalPlaces];
		var intermediateValue = num / numberToRoundTo;

		if (lopOffUnused) {
			intermediateValue = this.lopOffDecimalPlaces(intermediateValue);
		} else {
			intermediateValue = Math.round(num / numberToRoundTo);
		}
		return (intermediateValue * numberToRoundTo);
	}
}