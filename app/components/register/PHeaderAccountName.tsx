/// <reference path="../../_includes.ts" />

import * as React from 'react';
import * as ReactDOM from 'react-dom';

export interface PHeaderAccountNameProps {
	text:string
}

const TooltipContainerStyle = {
	flex: '1 1 auto',
	height: '34px'
}

const TooltipInnerStyle = {
	fontSize: '20px',
	fontWeight: '300',
	backgroundColor: '#16A336'
}

const TooltipArrowStyle = {
	top: '35%',
	right: '-5px',
	marginTop: '-5px',
	borderWidth: '10px 0 10px 10px',
	borderLeftColor: '#16A336'
}

export class PHeaderAccountName extends React.Component<PHeaderAccountNameProps, {}> {
  
	public render() {
    	return (
			<div style={TooltipContainerStyle}>
				<div className="tooltip left in" role="tooltip">
					<div className="tooltip-arrow" style={TooltipArrowStyle}></div>
					<div className="tooltip-inner" style={TooltipInnerStyle}>
						{this.props.text}
					</div>
				</div>		
			</div>		
		);
  	}
}