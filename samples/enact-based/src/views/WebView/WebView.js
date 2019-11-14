// Copyright (c) 2018-2019 LG Electronics, Inc.
// SPDX-License-Identifier: LicenseRef-EnactBrowser-Evaluation
//
// You may not use this content except in compliance with the License.
// You may obtain a copy of the License at
//
// https://github.com/webosose/com.webos.app.enactbrowser/blob/master/LICENSE

/**
 * Contains the declaration for the WebView component.
 *
 */

import PropTypes from 'prop-types';
import React, {Component} from 'react';
import ErrorPage from '../ErrorPage';

import $L from '@enact/i18n/$L';
import Button from '@enact/moonstone/Button';
import Notification from '@enact/moonstone/Notification';

const
	WebViewWrapperId = '_webview',
	error_renderer_crashed = 'RENDERER_CRASHED',
	error_unresponsive = 'PAGE_UNRESPONSIVE',
	timeoutToSuppressDialog = 30000;

class WebView extends Component {
	static propTypes = {
		id: PropTypes.string,
		webView: PropTypes.object
	}

	constructor (props) {
		super(props);

		this.state = {
			hideDialog: true,
			hideErrorPage: true,
			hideWebview: true,
			ready: false, // to be set to `true` after `loadcommit` event
			suppressDialog: false
		};
	}

	static getDerivedStateFromProps = (nextProps, prevState) => {
		let
			{browser, id, tabs} = nextProps,
			{ready} = prevState,
			error = tabs[id].error;

		if (ready) {
			if (error === null) {
				return {
					suppressDialog: false,
					hideDialog: true,
					hideErrorPage: true,
					hideWebview: false
				};
			} else if (error === error_unresponsive) {
				if (prevState.suppressDialog) {
					return {
						hideDialog: true,
						hideErrorPage: true,
						hideWebview: false
					};
				} else {
					return {
						hideDialog: false,
						hideErrorPage: true,
						hideWebview: false
					};
				}
			} else if (error === error_renderer_crashed || browser.config.useBuiltInErrorPages) {
				return {
					hideDialog: true,
					hideErrorPage: true,
					hideWebview: false
				};
			} else {
				return {
					hideDialog: true,
					hideErrorPage: false,
					hideWebview: true
				};
			}
		}

		return null;
	}

	onLoadCommit = () => {
		this.setState({ready: true});
	}

	enableDialog = () => {
		this.setState({suppressDialog: false});
	}

	onWait = () => {
		setTimeout(this.enableDialog, timeoutToSuppressDialog);
		this.setState({suppressDialog: true});
	}

	onStop = () => {
		this.props.webView.deactivate();
		this.setState({
			hideDialog: true,
			hideErrorPage: false,
			hideWebview: true,
			ready: false
		});
	}

	componentDidMount () {
		this.props.webView.insertIntoDom(this.props.id + WebViewWrapperId);
		this.props.webView.addEventListener('loadcommit', this.onLoadCommit);
	}

	render () {
		const
			{id, tabs, style, ...rest} = this.props,
			{hideDialog, hideErrorPage, hideWebview} = this.state;

		delete rest.browser;
		delete rest.webView;

		return (
			<div>
				<div
					id={id + WebViewWrapperId}
					style={style}
					{...rest}
					hidden={hideWebview}
				/>
				<ErrorPage
					style={style}
					errorMsg={tabs[id].error}
					hidden={hideErrorPage}
				/>
				<Notification
					noAutoDismiss
					open={!hideDialog}
				>
					<p>{$L('The current page has become unresponsive. You can wait for it to become responsive.')}</p>
					<buttons>
						<Button onClick={this.onWait}>{$L('Wait')}</Button>
						<Button onClick={this.onStop}>{$L('Stop')}</Button>
					</buttons>
				</Notification>
			</div>
		);
	}
}

export default WebView;
