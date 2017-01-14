import React from 'react';
import ReactDOM from 'react-dom';
import { compareStrengths, grabTeam, randomTeam, setPageTitle } from '../helpers';
import TeamPanel from './TeamPanel';
import { Link, browserHistory } from 'react-router';

// generate style for scaling the compare strength meters
const getMeterStyle = num => {
	let transform;
	num = num < 50 ? num *= 2 : 99;
	num = num < 10 ? `0${num}` : num;
	transform = `scale3d(.${num}, 1, 1)`;
	return {WebkitTransform: transform, transform: transform};
}

const CompareTeams = props => {
	const { teamOne, teamTwo } = props.teams;
	const strengths = compareStrengths(teamOne, teamTwo);
	return (
		<div className="compare-strengths team-panel-cells">
			<a href='/rankings' onClick={props.switchPage}><button className='arrow-link'>TEAM RANKINGS</button></a>
			<h4>Biggest Strengths</h4>
			{strengths.map((strength, index) => (
				<div className="panel-cell" key={index}>
					<div className="comp-strength-logo" style={{backgroundImage: 'url("data:image/svg+xml,' + localStorage['logo_' + strength[2]] + '")'}}></div>
						{strength[0] > 0 ?
							<h3><span>+{ strength[0] }</span> <i>{ strength[1][0] }</i> vs<i style={{backgroundImage: 'url("data:image/svg+xml,' + localStorage['logo_' + strength[3]] + '")'}}></i>{ strength[1][1] }</h3> :
							// eslint-disable-next-line
							<h3> ¯\_(ツ)_/¯</h3>}
					<div className="meter" style={ getMeterStyle(strength[0]) }></div>
				</div>
			))}
		</div>
	)
}

const SimContainer = React.createClass({
	componentDidMount() {
		const { teamOne, teamTwo } = this.props.params;
		setPageTitle('Choose Teams');
		window.curTeams = [teamOne, teamTwo];
		setTimeout(() => ReactDOM.findDOMNode(this.refs.simContainer).className = 'show-el', 10);
	},
	render() {
		const props = this.props;
		const { teamOne, teamTwo } = props.params;
		const teamH2 = team => <h2 style={{backgroundColor: 'rgb(' + localStorage['color_' + team] + ')'}}>{team}</h2>;
		return (
			<div id='sim_container' ref='simContainer'>
				<h1 className="heading">HOCKEY SIM</h1>

				<TeamPanel 
					team={grabTeam(teamOne)}
					changeTeam={this.changeTeamOne}
				/>
				<TeamPanel 
					team={grabTeam(teamTwo)}
					changeTeam={this.changeTeamTwo}
				/>

				<div className="team-matchup">
					{teamH2(teamOne)}
					<span>vs</span>
					{teamH2(teamTwo)}
					<Link to={`/${teamOne}/${teamTwo}/sim`}><button className="btn-sim skater-icon">SIMULATE MATCHUP</button></Link>
				</div>

				<CompareTeams teams={{teamOne, teamTwo}} switchPage={this.switchPage} />

				{ props.children }
			</div>
		);
	},
	switchPage(e) {
		e.preventDefault();
		ReactDOM.findDOMNode(this.refs.simContainer).className = '';
		setTimeout(() => {
			browserHistory.push('/rankings');
		}, 410);
	},
	changeTeamOne(teamName) {
		teamName = typeof(teamName) === 'string' ? teamName : randomTeam()[0];
		window.curTeams[0] = teamName;
		browserHistory.replace(`/${teamName}/${this.props.params.teamTwo}`);
	},
	changeTeamTwo(teamName) {
		teamName = typeof(teamName) === 'string' ? teamName : randomTeam()[0];
		window.curTeams[1] = teamName;
		browserHistory.replace(`/${this.props.params.teamOne}/${teamName}`)
	}
});

export default SimContainer;
