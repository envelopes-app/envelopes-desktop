/// <reference path='../_includes.ts' />

import * as winston from 'winston';
import { DateWithoutTime } from './DateWithoutTime';

export enum LogLevels {
	Error = 0,
	Warning,
	Info
}

export class Logger {

	private static logToConsole = false;
	private static currentLogLevel = LogLevels.Warning;
	private static logLevelStyles:Array<string> = ["color:red", "color:orange", "color:black"];

	public static initializeLogging():void {
		
		if(process.env.NODE_ENV === 'development') {
			Logger.logToConsole = true;
			Logger.currentLogLevel = LogLevels.Info;
		}
		
		const fs = require('fs');
		const path = require('path');
		const { app } = require('electron').remote;
	
		var appFolderName = (process.env.NODE_ENV === 'development') ? "ENAB-DEV" : "ENAB";  
		var loggingDir = path.join(app.getPath('documents'), appFolderName, 'logs');
		if (!fs.existsSync(loggingDir)) {
			// Create the directory if it does not exist
			fs.mkdirSync(loggingDir);
    	}

		var logFileName = path.join(loggingDir, "enab.log");
		var exceptionFileName = path.join(loggingDir, "enab-exceptions.log");
		winston.configure({
			transports: [
				new (winston.transports.File)({
					filename: logFileName,
					timestamp: true,
					maxsize: 1024 * 1024 * 10, // 10MB
					maxFiles: 5,
					tailable: true
				})
			],
			exceptionHandlers: [
				new winston.transports.File( {
					filename: exceptionFileName,
					maxsize: 1024 * 1024 * 10, // 10MB
					maxFiles: 1,
					tailable: true
				})
			]
		})
	}

	public static error(message:any, ...otherParams : any[]):void {

		winston.error(message, otherParams);
		if(Logger.logToConsole)
			Logger.logWithColor.apply(this, [LogLevels.Warning, message, LogLevels.Warning].concat(otherParams));
	}

	public static warning(message:any, ...otherParams : any[]):void {

		winston.warn(message, otherParams);
		if(Logger.logToConsole)
			Logger.logWithColor.apply(this, [LogLevels.Warning, message, LogLevels.Warning].concat(otherParams));
	}

	public static info(message:any, ...otherParams : any[]):void {

		winston.info(message, otherParams);
		if(Logger.logToConsole)
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
