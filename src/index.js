import React from 'react';
import ReactDOM from 'react-dom';
import { Router, Route, IndexRoute, browserHistory } from 'react-router';
import { randomTeam, isIE } from './helpers';

import SimContainer from './components/SimContainer';
import SimModal from './components/SimModal';
import Rankings from './components/Rankings';

import './index.css';

const rootElement = document.getElementById('root');
const { localStorage } = window;

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
	// internet explorer / edge style fix
	if (isIE) {
		var style = document.createElement('STYLE');
		style.innerHTML = 'body{font-family:Segoe UI,Arial}.ranking-team-info{background-position-x:-140%}'
		document.head.appendChild(style); // document.getElementsByTagName('head')[0]
	}
	// run render
	run();
}

const storeTeams = data => {
	window.teamRatings = data[0];
	window.lastUpdate = data[1];
	window.teamKeys = Object.keys(data[0]);
	// check if team logos are pre-cached in localStorage
	if (localStorage.color_Wild) {
		// already have logos, go on with loading the page
		setTimeout(_init, 300);
	} else {
		// get logos
		fetch('/js/localStoreTeams.json').then(r => r.json())
			.then(teamData => {
				Object.keys(teamData).forEach(function(teamName) {
					const arr = teamData[teamName];
					localStorage['color_' + teamName] = arr[0];
					localStorage['logo_' + teamName] = arr[1];
				})
				setTimeout(_init, 300);
			})
	}
}

if (!localStorage) {
	alert('To use this website, please download a browser that supports local storage.');
} else {
	// fetch updated team ratings (& logos / colors if needed) before initializing app
	fetch(`/js/teamratings.json?${+new Date()}`).then(r => r.json())
		.catch(e => alert("Error: Couldn't fetch current team ratings. Using local copy if available."))
	  .then(data => {
	  	if (!data) {
	  		const { teamratings } = localStorage;
	  		return teamratings ? storeTeams(JSON.parse(teamratings)) : false;
	  	}
			// grabbed teams successfully
			// add current ratings to localstorage for offline fallback
			localStorage.teamratings = JSON.stringify(data);
			storeTeams(data);
	  });
};
