import React from 'react';
import ReactDOM from 'react-dom';
import { setPageTitle, grabTeam } from '../helpers';
import { browserHistory } from 'react-router';

const TeamDiv = props => (
	<div className='ranking-team'>
		<div className='ranking-team-info' style={{backgroundColor: 'rgba(' + localStorage['color_' + props.teamName] + ', 0.65)', backgroundImage: `url('data:image/svg+xml,${localStorage['logo_' + props.teamName]}')`}}>
			<i>{props.i + 1}</i>{props.name}<span> | {props.rating}</span>
		</div>
	</div>
);

const Rankings = React.createClass({
	render() {
	const teamWinPct = window.teamKeys.map((team) => [team, window.teamRatings[team][7]]).sort((a, b) => b[1] - a[1]);
		return (
			<div className='rankings' ref='rankings'>
				<h1 className='ranking-logo'>Team Rankings</h1>
				<p>Based on combined win percentage of team in 100 simulated games against each other team (updated { window.lastUpdate }).</p>
				<p><a href="/" className='arrow-link' onClick={this.switchPage}>SIM GAMES</a></p>
				<div className='rankings-list'>
					{ teamWinPct.map((teamArr, i) => <TeamDiv key={i} i={i} name={teamArr[0]} rating={teamArr[1]} teamName={teamArr[0]} />) }
				</div>
			</div>
		);
	},
	componentDidMount() {
		setPageTitle('Team Rankings');
		setTimeout(() => {
			document.body.scrollTop = 0;
			document.getElementById('back_image').style.willChange = 'transform';
			ReactDOM.findDOMNode(this.refs.rankings).className += ' show-el'
		}, 10);
	},
	componentWillUnmount() {
		document.getElementById('back_image').style.willChange = '';
	},
	switchPage(e) {
		e.preventDefault();
		const pathname = window.curTeams ? window.curTeams : [grabTeam()[0], grabTeam()[0]]
		ReactDOM.findDOMNode(this.refs.rankings).className = 'rankings';
		setTimeout(() => {
			browserHistory.push(`/${pathname[0]}/${pathname[1]}`);
		}, 410);
	}
});

export default Rankings;