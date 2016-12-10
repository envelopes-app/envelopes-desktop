import { SimpleObjectMap } from '../utilities';

export class AccountTypes {

	// These two constants are only used when importing YNAB data. We temporarily assign
	// these types to account until later we can inquire from the user about their actual types. 
	public static None = "None";
	public static Liability = "Liability";

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

	// ******************************************************************************************
	// Utility Methods
	// ******************************************************************************************
	private static _accountTypes:SimpleObjectMap<AccountTypeProperties> = {};
	private static _accountTypesArray:Array<AccountTypeProperties> = [];
	private static _initialised:boolean = false;

	private static init() {
		if (AccountTypes._initialised)
			return;

		var ON_BUDGET:boolean = true;
		var OFF_BUDGET:boolean = false;
		var ASSET_ACCOUNT:boolean = true;
		var LIABILITY_ACCOUNT:boolean = false;

		AccountTypes.addAccountType( AccountTypes.Checking, AccountTypeNames.Checking,         			ON_BUDGET,  ASSET_ACCOUNT );
		AccountTypes.addAccountType( AccountTypes.Savings, AccountTypeNames.Savings,           			ON_BUDGET,  ASSET_ACCOUNT );
		AccountTypes.addAccountType( AccountTypes.CreditCard, AccountTypeNames.CreditCard,        		ON_BUDGET,  LIABILITY_ACCOUNT );
		AccountTypes.addAccountType( AccountTypes.Cash, AccountTypeNames.Cash,              			ON_BUDGET,  ASSET_ACCOUNT );
		AccountTypes.addAccountType( AccountTypes.LineOfCredit, AccountTypeNames.LineOfCredit,      	ON_BUDGET,  LIABILITY_ACCOUNT );
		AccountTypes.addAccountType( AccountTypes.PayPal, AccountTypeNames.PayPal,            			ON_BUDGET,  ASSET_ACCOUNT );
		AccountTypes.addAccountType( AccountTypes.MerchantAccount, AccountTypeNames.MerchantAccount,   	ON_BUDGET,  ASSET_ACCOUNT );
		AccountTypes.addAccountType( AccountTypes.InvestmentAccount, AccountTypeNames.InvestmentAccount, OFF_BUDGET, ASSET_ACCOUNT );
		AccountTypes.addAccountType( AccountTypes.Mortgage, AccountTypeNames.Mortgage,          		OFF_BUDGET, LIABILITY_ACCOUNT );
		AccountTypes.addAccountType( AccountTypes.OtherAsset, AccountTypeNames.OtherAsset,        		OFF_BUDGET, ASSET_ACCOUNT );
		AccountTypes.addAccountType( AccountTypes.OtherLiability, AccountTypeNames.OtherLiability,    	OFF_BUDGET, LIABILITY_ACCOUNT );

		AccountTypes._initialised = true;
	}

	private static addAccountType(accountType:string, accountTypeName:string, isRecommendedOnBudget:boolean, isAssetAccount:boolean):void
	{
		var props: AccountTypeProperties = new AccountTypeProperties( accountType, accountTypeName, isRecommendedOnBudget, isAssetAccount );
		AccountTypes._accountTypes[accountType] = props;
		AccountTypes._accountTypesArray.push(props);
	}

	public static isRecommendedOnBudget(accountType:string):boolean {
		AccountTypes.init();
		var props:AccountTypeProperties = AccountTypes._accountTypes[accountType];
		return props ? props.isRecommendedOnBudget : true; // Default is that the account is on budget
	}

	public static isAssetAccount(accountType:string):boolean {
		AccountTypes.init();
		var props:AccountTypeProperties = AccountTypes._accountTypes[accountType];
		return props ? props.isAssetAccount : true; // Default is that the account is an asset account
	}

	public static getLabel(accountType:string):string {
		AccountTypes.init();
		var props:AccountTypeProperties = AccountTypes._accountTypes[accountType];
		return props.label;
	}
}

export class AccountTypeNames {

	public static Checking = "Checking";
	public static Savings = "Savings";
	public static CreditCard = "Credit Card";
	public static Cash = "Cash";
	public static LineOfCredit = "Line of Credit";
	public static PayPal = "PayPal";
	public static MerchantAccount = "Merchant Account";
	public static InvestmentAccount = "Investment Account";
	public static Mortgage = "Mortgage";
	public static OtherAsset = "Other Asset";
	public static OtherLiability = "Other Liability";
}

export class AccountTypeProperties {

	public label:string;
	public accountType:string;
	public isRecommendedOnBudget:boolean = true;
	public isAssetAccount:boolean = true;

	constructor(accountType:string, label:string, isRecommendedOnBudget:boolean, isAssetAccount:boolean ) {
		this.label = label;
		this.accountType = accountType;
		this.isRecommendedOnBudget = isRecommendedOnBudget;
		this.isAssetAccount = isAssetAccount;
	}
}
