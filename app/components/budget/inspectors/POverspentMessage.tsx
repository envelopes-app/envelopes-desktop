/// <reference path="../../../_includes.ts" />

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Button } from 'react-bootstrap';

export interface POverspentMessageProps {
	amountOverspent:number;
	isUncategorized:boolean;
}

const MessageContainerStyle = {
	paddingTop: "10px",
	paddingLeft: "10px",
	paddingRight: "10px",
}

const MessageStyle = {
	color: "#003440",
	backgroundColor: "#F8E1DF",
	borderRadius: "4px",
	padding: "10px",
	fontSize: "14px"
}

export class POverspentMessage extends React.Component<POverspentMessageProps, {}> {

	public render() {

		var messageText = "";

		if(this.props.isUncategorized) {
			return (
				<div style={MessageContainerStyle}>
					<div style={MessageStyle}>
						Uncategorized cash transactions still affect your budget! Assign them to categories or <span style={{fontWeight:'bold'}}>{-this.props.amountOverspent}</span> will be deducted from the amount you have available to budget next month.
					</div>
				</div>
			);
		}
		else {
			return (
				<div style={MessageContainerStyle}>
					<div style={MessageStyle}>
						You've overspent this category by <span style={{fontWeight:'bold'}}>{-this.props.amountOverspent}</span>. Cover the overspending from other categories or you can’t trust your budget balances!
					</div>
				</div>
			);
		}
	}
}