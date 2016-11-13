import React from 'react';
import ReactDOM from 'react-dom';
import { browserHistory } from 'react-router';
import { grabTeam, setPageTitle, simGame, Team } from '../helpers';

let result, winner, flexbasis;

const SimModal = React.createClass({
	getInitialState: () => ({
		textOpacity: 1,
		statsHeight: 0,
		statsOverflow: 'hidden',
		containerClass: '',
		flexBasis: '50%'
	}),
	render() {
		const state = this.state;
		const params = this.props.params;
		const teamOne = grabTeam(params.teamOne);
		const teamTwo = grabTeam(params.teamTwo);
		if (!result) {
			result = simGame(new Team(teamOne[0]), new Team(teamTwo[0]));
			if (result.teamOne.wins !== result.teamTwo.wins) {
				winner = (result.teamOne.wins > result.teamTwo.wins) ? result.teamOne : result.teamTwo;
			}
			flexbasis = (result.teamOne.wins / 500) * 100 + '%';
		}
		const getColor = team => {
			return localStorage[`color_${team}`];
		};
		return (
			<div id="results_container" className={state.containerClass} ref='resultsContainer'>
				<div className="results_popup">
					<div id="sim_bar">
						<div className="sim-text scanlines" style={{opacity: state.textOpacity}} ref='simText'>
							<div>Simulating <span className="counter" ref='counter'>500</span> games</div>
						</div>
						<div id="team_one_bar" ref='teamOneBar' style={{backgroundColor: 'rgba(' + getColor(teamOne[0]) + ', 0.65)', backgroundImage: `url('data:image/svg+xml,${localStorage['logo_' + teamOne[0]]}')`, flexBasis: state.flexBasis}}></div>
						<div id="team_two_bar" style={{'backgroundColor': 'rgba(' + getColor(teamTwo[0]) + ', 0.65)', 'backgroundImage': `url('data:image/svg+xml,${localStorage['logo_' + teamTwo[0]]}')`}}></div>
					</div>

					<div id="sim_stats" style={{maxHeight: state.statsHeight + 'px', overflow: state.statsOverflow}} ref='simStats'>
						<div className="prediction">
							<h2 className="winning-team" style={{color: winner ? `rgb(${getColor(winner.teamName)})` : '#333'}}>{winner ? winner.teamName : 'TOO CLOSE TO CALL'}</h2>
							<h3>Predicted Winner</h3>
						</div>
						<div>
							<h2 className="wins">{winner ? `${winner.wins}/500` : 'Even'}</h2>
							<h3>Wins</h3>
						</div>
						<div>
							<h2 className="score">
								<span style={{color: `rgb(${getColor(teamOne[0])})`}}>{result.teamOne.avgScore}</span> - <span style={{color: `rgb(${getColor(teamTwo[0])})`}}>{result.teamTwo.avgScore}</span>
							</h2>
							<h3>Average Score</h3>
						</div>
						<div>
							<h2 className="winchance">{winner ? `${(winner.wins / 500 * 100).toFixed(1)}%` : '50%'}</h2>
							<h3>Win Chance</h3>
						</div>
					</div>

					<button id="close_results_btn" onClick={() => this.closeModal(teamOne[0], teamTwo[0])}>CLOSE</button>
				</div>
			</div>
		);
	},
	componentDidMount() {
		const { teamOne, teamTwo } = this.props.params;
		this._isMounted = true;
		setPageTitle(`${teamOne} vs ${teamTwo}`);
		setTimeout(() => {
			this.setState({containerClass: 'show-el', flexBasis: flexbasis})
			this.startCounter();
		}, 20);
	},
	closeModal(teamOne, teamTwo) {
		this.setState({statsHeight: 0, containerClass: ''})
		setTimeout(() => browserHistory.push(`/${teamOne}/${teamTwo}`), 350);
	},
	componentWillUnmount() {
		result = false;
		this._isMounted = false;
		setPageTitle('Choose Teams');
	},
	startCounter() {
		const { counter, simStats, resultsContainer } = this.refs;
		const findNode = ReactDOM.findDOMNode;
		const countText = findNode(counter);
		const elSimStats = findNode(simStats);
		const elResultsContainer = findNode(resultsContainer);
		const showResults = () => {
			let statsHeight = elSimStats.scrollHeight;
			let statsOverflow = 'hidden';
			const maxHeight = elResultsContainer.clientHeight * 0.6;
			if (statsHeight > maxHeight) {
				statsHeight = maxHeight;
				statsOverflow = 'auto';
			}
			this.setState({statsHeight, statsOverflow, textOpacity: 0})
		};
		this.showCounter(countText, showResults);
	},
	showCounter(el, cb) {
		let start;
		const step = timestamp => {
			if (!this._isMounted) return;
			if (!start) start = timestamp;
			var progress = Math.round((timestamp - start)/4);
			el.innerHTML = Math.min(progress, 500);
			if (progress < 500) {
				requestAnimationFrame(step);
			} else {
				// slide down results
				setTimeout(cb, 300);
			}
		}
		requestAnimationFrame(step);
	},
});

export default SimModal;