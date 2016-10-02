import * as uuid from 'node-uuid';

import { DateWithoutTime } from './DateWithoutTime';
import * as budgetEntities from '../interfaces/budgetEntities';

export class KeyGenerator {

	public static generateUUID():string {
		return uuid.v4();
	}

	public static getAccountCalculationIdentity(accountId:string):string {

		var key:string = "ac/" + accountId;
		return key;
	}

	public static getAccountMonthlyCalculationIdentity(accountId:string, month:DateWithoutTime):string {

		var key:string = "mac/" + KeyGenerator.getYearMonthFromDate(month) + "/" + accountId;
		return key;
	}

	public static getMonthlyBudgetIdentity(budgetId:string, month:DateWithoutTime):string {

		var key:string = "mb/" + KeyGenerator.getYearMonthFromDate(month) + "/" + budgetId;
		return key;
	}

	public static getMonthlyBudgetCalculationIdentity(budgetId:string, month:DateWithoutTime):string {

		var key:string = "mbc/" + KeyGenerator.getYearMonthFromDate(month) + "/" + budgetId;
		return key;
	}

	public static getMonthlySubCategoryBudgetIdentity(subCategoryId:string, month:DateWithoutTime):string {

		var key:string = "mcb/" + KeyGenerator.getYearMonthFromDate(month) + "/" + subCategoryId;
		return key;
	}

	public static getMonthlySubCategoryBudgetCalculationIdentity(subCategoryId:string, month:DateWithoutTime):string {

		var key:string = "mcbc/" + KeyGenerator.getYearMonthFromDate(month) + "/" + subCategoryId;
		return key;
	}

	public static getSettingIdentity(budgetId:string, settingName:string):string {

		var key:string = budgetId + "/" + settingName;
		return key;
	}

	public static getUserSettingIdentity(userId:string, settingName:string):string {

		var key:string = userId + "/" + settingName;
		return key;
	}

	// *************************************************************************************************************
	// Utility Methods to generate keys for transactions generated from scheduled transactions
	// *************************************************************************************************************
	public static getScheduledTransactionTransactionId(scheduledTransaction:budgetEntities.IScheduledTransaction, transactionDate:DateWithoutTime):string {

		var key:string = `${scheduledTransaction.entityId}_${KeyGenerator.getYearMonthDateFromDate(transactionDate)}`;
		return key;
	}
	
	public static getScheduledTransactionTransferTransactionId(scheduledTransaction:budgetEntities.IScheduledTransaction, transactionDate:DateWithoutTime):string {

		var key:string = `${scheduledTransaction.entityId}_t_${KeyGenerator.getYearMonthDateFromDate(transactionDate)}`;
		return key;
	}
	
	public static getScheduledSubTransactionTransferTransactionId(scheduledTransaction:budgetEntities.IScheduledTransaction, transactionDate:DateWithoutTime, subTransactionIndex:number):string {

		var key:string = `${scheduledTransaction.entityId}_st_${subTransactionIndex.toString()}_${KeyGenerator.getYearMonthDateFromDate(transactionDate)}`;
		return key;
	}

	// *************************************************************************************************************
	// Utility Methods to extract month from the keys
	// *************************************************************************************************************
	public static extractMonthStringFromMonthlyBudgetIdentity(monthlyBudgetId:string):string {

		var monthString = monthlyBudgetId.substr(3, 7) + "-01";
		return monthString;
	}

	public static extractMonthFromMonthlyBudgetIdentity(monthlyBudgetId:string):DateWithoutTime {

		var monthString = monthlyBudgetId.substr(3, 7) + "-01";
		var month = DateWithoutTime.createFromString(monthString, "YYYY-MM-DD");
		return month;
	}

	public static extractMonthStringFromMonthlySubCategoryBudgetIdentity(monthlySubCategoryBudgetId:string):string {

		var monthString = monthlySubCategoryBudgetId.substr(4, 7) + "-01";
		return monthString;
	}

	public static extractMonthFromMonthlySubCategoryBudgetIdentity(monthlySubCategoryBudgetId:string):DateWithoutTime {

		var monthString = monthlySubCategoryBudgetId.substr(4, 7) + "-01";
		var month = DateWithoutTime.createFromString(monthString, "YYYY-MM-DD");
		return month;
	}

	public static extractMonthStringFromMonthlySubCategoryBudgetCalculationIdentity(monthlySubCategoryBudgetCalculationId:string):string {

		var monthString = monthlySubCategoryBudgetCalculationId.substr(5, 7) + "-01";
		return monthString;
	}

	public static extractMonthFromMonthlySubCategoryBudgetCalculationIdentity(monthlySubCategoryBudgetCalculationId:string):DateWithoutTime {

		var monthString = monthlySubCategoryBudgetCalculationId.substr(5, 7) + "-01";
		var month = DateWithoutTime.createFromString(monthString, "YYYY-MM-DD");
		return month;
	}

	public static getMonthlyBudgetCalculationIdFromMonthlyBudgetId(monthlyBudgetId:string):string {

		// The MonthlyBudgetId and the MonthlyBudgetCalculationId have just one difference.
		// The former starts with "mb" and the later with "mbc". So inserting an extra "c" in the passed 
		// MonthlyBudgetId gives us the corresponding MonthlyBudgetCalculationId
		var monthlyBudgetCalculationId = "mbc" + monthlyBudgetId.substring(2);
		return monthlyBudgetCalculationId;
	}

	public static getMonthlySubCategoryBudgetCalculationIdFromMonthlySubCategoryBudgetId(monthlySubCategoryBudgetId:string):string {

		// The MonthlySubCategoryBudgetId and the MonthlySubCategoryBudgetCalculationId have just one difference.
		// The former starts with "mcb" and the later with "mcbc". So inserting an extra "c" in the passed 
		// MonthlySubCategoryBudgetId gives us the corresponding MonthlySubCategoryBudgetCalculationId
		var monthlySubCategoryBudgetCalculationId = "mcbc" + monthlySubCategoryBudgetId.substring(3);
		return monthlySubCategoryBudgetCalculationId;
	}

	public static getMonthlySubCategoryBudgetIdFromMonthlyBudgetIdAndSubCategoryId(monthlyBudgetId:string, subCategoryId:string):string {

		// Extract the month from the passed monthlyBudgetId and then use that along with the passed 
		// subCategoryId to form the monthlySubCategoryBudgetId
		var month:DateWithoutTime = KeyGenerator.extractMonthFromMonthlyBudgetIdentity(monthlyBudgetId);
		return KeyGenerator.getMonthlySubCategoryBudgetIdentity(subCategoryId, month);
	}        
	// *************************************************************************************************************
	// Internal Methods
	// *************************************************************************************************************
	// Return a string in the format "YYYY-MM" for the passed DateWithoutTime object
	// On the javascript side, months in the date start from 0, where as on the server side in postgres
	// months start from 1. Hence if we convert the same date to it's YYYY-MM format string, it would give us
	// two different string on the client and server side.
	// In order to make this consistent, whenever we generate a deterministic key on the client side that
	// involves the date, we are going to add 1 to the month, before getting the YYYY-MM string.
	private static getYearMonthFromDate(dateWithoutTime:DateWithoutTime):string {

		var year:string = "" + dateWithoutTime.getYear();
		var monthString:string;

		var monthPlusOne = dateWithoutTime.getMonth() + 1;
		if((monthPlusOne) < 10)
			monthString = "0" + (monthPlusOne);
		else
			monthString = "" + (monthPlusOne);

		return year + "-" + monthString;
	}

	private static getYearMonthDateFromDate(dateWithoutTime:DateWithoutTime):string {

		var dateNumber:number = dateWithoutTime.getDate();
		var dateString:string;

		if((dateNumber) < 10)
			dateString = "0" + (dateNumber);
		else
			dateString = "" + (dateNumber);

		return KeyGenerator.getYearMonthFromDate(dateWithoutTime) + "-" + dateString;
	}
}