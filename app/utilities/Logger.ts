/// <reference path='../_includes.ts' />

export enum LogLevels {
	Error = 0,
	Warning,
	Info
}

export class Logger {

	private static currentLogLevel = LogLevels.Info;
	private static logLevelStyles:Array<string> = ["color:red", "color:orange", "color:black"];

	public static setCurrentLogLevel(logLevel:LogLevels):void {
		Logger.currentLogLevel = logLevel;
	}

	public static error(message:any, ...otherParams : any[]):void {

		Logger.logWithColor.apply(this, [LogLevels.Warning, message, LogLevels.Warning].concat(otherParams));
	}

	public static warning(message:any, ...otherParams : any[]):void {

		Logger.logWithColor.apply(this, [LogLevels.Warning, message, LogLevels.Warning].concat(otherParams));
	}

	public static info(message:any, ...otherParams : any[]):void {

		Logger.logWithColor.apply(this, [LogLevels.Info, message, LogLevels.Info].concat(otherParams));
	}

	private static logWithColor(logLevel:LogLevels, message:any, styleNumber:number, ...otherParams : any[]) : void{
		if (Logger.currentLogLevel < logLevel)
			return;

		message = Logger.extractMessageFromStringOrFunction(message);
		var params = ["%c "+message, Logger.logLevelStyles[styleNumber]];
		var params = params.concat(otherParams || []);
		console.log.apply(console, params)
	}

	private static extractMessageFromStringOrFunction(message:any):any {

		if (typeof(message) == "function") {
			var messageFunction = message;
			message = messageFunction();
		}

		return message;
	}
}
