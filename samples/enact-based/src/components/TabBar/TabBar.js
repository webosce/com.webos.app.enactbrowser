/**
 * Contains the declaration for the TabBar component.
 *
 */

import $L from '@enact/i18n/$L';
import {connect} from 'react-redux';
import classNames from 'classnames';
import kind from '@enact/core/kind';
import PropTypes from 'prop-types';
import React, {Component} from 'react';

import {BrowserIconButton as IconButton} from '../BrowserIconButton';
import Tab from './Tab';
import Sortable from '../Sortable';

import css from './TabBar.less';

const placeholder = (typeof document === 'object') ? document.createElement('li') : null;

if (placeholder) {
	placeholder.setAttribute('style', 'display: flex; width: 210px; margin-right: 21px; padding: 6px; background-color: white; opacity: 0.6; border: dotted 2px grey;');
	placeholder.innerHTML = 'drop here';
}

const NewTabButton = kind({
	name: 'NewTabButton',
	propTypes: {
		onNew: PropTypes.func
	},
	styles: {
		css,
		className: 'newTab'
	},
	render: ({onNew, ...rest}) => (
		<li {...rest}>
			<IconButton
				backgroundOpacity="transparent"
				onClick={onNew}
				type="newTabButton"
				withBg
			/>
		</li>
	)
});

class TabBarBase extends Component {
	static propTypes = {
		browser: PropTypes.object,
		component: PropTypes.any,
		numOfTabs: PropTypes.number,
		selectedIndex: PropTypes.number,
		tabStates: PropTypes.object,
		ids: PropTypes.array,
	}

	tabs = () => {
		const {browser, component: TabElem, numOfTabs, selectedIndex, tabStates, ids} = this.props;
		let
			tabs = [],
			closable = numOfTabs > 1;

		for (let i = 0; i < numOfTabs; i++) {
			const id = ids[i];

			tabs.push(
				<TabElem
					browser={browser}
					closable={closable}
					data-id={i}
					index={i}
					isLoading={tabStates[id].navState.isLoading}
					key={i}
					selected={i === selectedIndex}
					title={tabStates[id] ? $L(tabStates[id].title) : null}
					type={tabStates[id] ? $L(tabStates[id].type) : null}
				/>
			);
		}

		return tabs;
	}

	onNew = () => {
		const {browser, numOfTabs} = this.props;

		if (numOfTabs < browser.tabs.maxTabs) {
			browser.createNewTab();
		}
	}

	onMove = (fromIndex, toIndex) => {
		this.props.browser.moveTab(fromIndex, toIndex);
	}

	render = () => {
		const
			{className, numOfTabs, ...rest} = this.props,
			classes = classNames(className, css.tabBar);

		delete rest.tabStates;
		delete rest.component;
		delete rest.numOfTabs;
		delete rest.selectedIndex;
		delete rest.closableTabs;
		delete rest.browser;
		delete rest.ids;
		delete rest.dispatch;

		return (
			<ul className={classes} {...rest}>
				{this.tabs()}
				{numOfTabs < 7 ? <NewTabButton onNew={this.onNew} /> : null}
			</ul>
		);
	}
}

const SortableTabBar = Sortable({component: Tab, placeholder}, TabBarBase);

const mapStateToProps = ({tabsState}) => {
	const
		{ids, selectedIndex, tabs} = tabsState;
	return {
		numOfTabs: ids.length,
		ids,
		selectedIndex,
		tabStates: tabs,
	};
};

const TabBar = connect(mapStateToProps, null)(SortableTabBar);

export default TabBar;
export {TabBar, Tab};