/// <reference path="../../_includes.ts" />

import * as React from 'react';

export interface PSearchInputProps {
	placeHolder: string;
	classNames?: Array<string>;
	clickHandler: (event:React.MouseEvent<any>)=>void;
}

export class PSearchInput extends React.Component<PSearchInputProps, {}> {
  render() {

		var classNamesToApply = this.props.classNames ? this.props.classNames : [];
		classNamesToApply = ['input-group'].concat(classNamesToApply);

    return (
		<div className={classNamesToApply.join(' ')}>
			<input type="text" className="form-control" placeholder={this.props.placeHolder ? this.props.placeHolder : 'Search'}/>
			<span className="input-group-btn">
				<button type="submit" className="btn btn-default" onClick={this.props.clickHandler}>
					<span className="glyphicon glyphicon-search" aria-hidden="true"></span>
				</button>
			</span>
		</div>
    );
  }
}