export class TransactionFlag {

	public static None:string       = "None";
	public static Red:string 		= "Red";
	public static Orange:string     = "Orange";
	public static Yellow:string     = "Yellow";
	public static Green:string      = "Green";
	public static Blue:string       = "Blue";
	public static Purple:string     = "Purple";

	private static flagColorMapping:any = {
		"None": "#E1E1E1",
		"Red": "#D43D2E",
		"Orange": "#FF7B00",
		"Yellow": "#F8E136",
		"Green": "#9AC234",
		"Blue": "#0082CB",
		"Purple": "#9384B7"
	}

	private static flagTextColorMapping:any = {
		"None": "#BEBEBE",
		"Red": "#AA3125",
		"Orange": "#CC6200",
		"Yellow": "#C6B42B",
		"Green": "#7B9B29",
		"Blue": "#0068A2",
		"Purple": "#756992"
	}

	public static getFlagColor(flag:string):string {
		return TransactionFlag.flagColorMapping[flag];
	}	

	public static getFlagTextColor(flag:string):string {
		return TransactionFlag.flagTextColorMapping[flag];
	}
}