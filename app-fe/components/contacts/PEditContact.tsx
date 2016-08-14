/// <reference path="../../_includes.ts" />

import * as React from 'react';
import * as fs from 'fs';

export interface PEditContactProps {}

export class PEditContact extends React.Component<PEditContactProps, {}> {
  
	render() {

		var file = fs.readFileSync('/Users/faisal/Workspaces/enab/package.json', { encoding: "utf8" }); 
		return (
			<div>
				{file}
			</div>
		);
	}
}