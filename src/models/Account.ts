/// <reference path="../_includes.ts" />

export class AccountTypeConstants {

	public static Checking = "Checking";
	public static Savings = "Savings";
	public static CreditCard = "CreditCard";
	public static Cash = "Cash";
	public static LineOfCredit = "LineOfCredit";
	public static PayPal = "PayPal";
	public static MerchantAccount = "MerchantAccount";
	public static InvestmentAccount = "InvestmentAccount";
	public static Mortgage = "Mortgage";
	public static OtherAsset = "OtherAsset";
	public static OtherLiability = "OtherLiability";
}

export class Account {

	public accountId:string = null;
	public accountType:string = null;
	public name:string = null;
	public note:string = null;
	public lastReconciledDate:Date = null;
	public lastReconciledBalance:number = null;
	public closed:boolean = false;
	public sortableIndex:number = 0;
	public onBudget:boolean = true;
}