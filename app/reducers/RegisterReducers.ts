import * as _ from 'lodash';

import { IRegisterState } from '../interfaces/state';
import { SimpleObjectMap } from '../utilities';

export class RegisterReducers {

	public static registersState(previousValue:SimpleObjectMap<IRegisterState>, action:Redux.Action):SimpleObjectMap<IRegisterState> {

		var newValue:SimpleObjectMap<IRegisterState>;
		if(!previousValue)
			newValue = {};
		else
			newValue = _.assign({}, previousValue) as SimpleObjectMap<IRegisterState>;

		return newValue;
	}
}
