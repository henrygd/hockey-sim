import React from 'react';
import ReactDOM from 'react-dom';
import { Router, Route, IndexRoute, browserHistory } from 'react-router';
import { randomTeam } from './helpers';

import SimContainer from './components/SimContainer';
import SimModal from './components/SimModal';
import Rankings from './components/Rankings';

import './index.css';

const rootElement = document.getElementById('root');

const checkTeamParams = (nextState, replace) => {
	const { teamOne, teamTwo } = nextState.params;
	const teamKeys = window.teamKeys
	const teamOneValid = teamKeys.indexOf(teamOne) > -1;
	const teamTwoValid = teamKeys.indexOf(teamTwo) > -1;
	if (!teamOneValid || !teamTwoValid) {
		replace(`/${teamOneValid ? teamOne : randomTeam()[0]}/${teamTwoValid ? teamTwo : randomTeam()[0]}`);
	}
}

const routes = (
	<Route path='/'>
		<IndexRoute onEnter={checkTeamParams} />
		<Route path='rankings' component={Rankings} />
		<Route path=':teamOne/:teamTwo' component={SimContainer} onEnter={checkTeamParams}>
			<Route path='sim' component={SimModal} />
		</Route>
		<Route path='*' onEnter={checkTeamParams} />
	</Route>
);

function run() {
	ReactDOM.render(
		<Router history={browserHistory}>
			{routes}
		</Router>, rootElement
	);
}

function _init() {
	rootElement.className = 'scanlines';
	run();
}

fetch(`/js/teamratings.json?${+new Date()}`).then(r => r.json())
  .then(data => {
		// grabbed teams successfully
		window.teamRatings = data[0];
		window.lastUpdate = data[1];
		window.teamKeys = Object.keys(data[0]);
		// check if team logos are pre-cached in localStorage
		if (!localStorage) {
			return alert('To use this website, please download a browser that supports local storage.');
		} else {
			if (localStorage.color_Wild) {
				// already have logos, go on with loading the page
				setTimeout(_init, 500);
			} else {
				// get logos
				fetch('/js/localStoreTeams.json').then(r => r.json())
					.then(teamData => {
						Object.keys(teamData).forEach(function(teamName) {
							var arr = teamData[teamName];
							localStorage['color_' + teamName] = arr[0];
							localStorage['logo_' + teamName] = arr[1];
						})
						setTimeout(_init, 500);
					})
			}
		}
  })
  .catch(e => alert('Error: Could not fetch team rankings.'))
