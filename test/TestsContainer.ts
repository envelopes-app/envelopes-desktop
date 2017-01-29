/// <reference path="_includes.ts" />

// Set the node environment to 'test'
process.env.NODE_ENV = 'test';

import * as chai from 'chai';
import * as collections from '../app/collections' 

require('../app/collections');
require('../app/constants');
require('../app/persistence');
require('../app/persistence/calculations');
require('../app/persistence/helpers');
require('../app/persistence/queries/budgetQueries');
require('../app/persistence/queries/catalogQueries');
require('../app/persistence/queries/miscQueries');
require('../app/utilities');

import { PersistenceManager } from '../app/persistence/PersistenceManager';
import { _TestsContainer as CalculationTestsContainer } from './calculations/_TestsContainer';

//Let's make sure we do include the stack trace
chai.config.includeStack = true; // turn on stack trace

describe("Envelopes Unit Tests", function() {

	before(function() {
		// Create and Initialize the PersistenceManager
		var persistenceManager = PersistenceManager.getInstance();
		return persistenceManager.initialize();
	});

	describe("Calculation Tests:", CalculationTestsContainer.performTests);
})

