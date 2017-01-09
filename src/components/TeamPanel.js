import React from 'react';

const TeamPanel = React.createClass({
	getInitialState: () => ({
		dropdownOpen: false
	}),
	render() {
		const props = this.props;
		const ratingArr = props.team[1];
		const teamKeys = window.teamKeys;
		const teamListItem = (team, i) => <li onClick={this.getThisTeam} key={i}>{team}</li>;

		return (<div className='team-panel'>
				<div className='logo-container scanlines'>
					<img alt='team_logo' className='logo' ref='logo' src={'data:image/svg+xml,' + localStorage['logo_' + props.team[0]]}/>
					<button className='random-icon random-btn' onClick={props.changeTeam}></button>
				</div>
				
				<div className='team-panel-cells'>

				<div className={'custom-select panel-cell' + (this.state.dropdownOpen ? ' select-active' : '')} onClick={this.toggleDropdown} style={{backgroundColor: 'rgb(' + localStorage['color_' + props.team[0]] + ')'}}>
					<div className='name-container'>
						<span className='team-name'>{ props.team[0] }</span>
					</div>

					<ul className='select-options'>
						<h4>Metropolitan</h4>
							{teamKeys.slice(0, 8).map((team, i) => teamListItem(team, i))}
						<h4>Atlantic</h4>
							{teamKeys.slice(8, 16).map((team, i) => teamListItem(team, i))}
						<h4>Central</h4>
							{teamKeys.slice(16, 23).map((team, i) => teamListItem(team, i))}
						<h4>Pacific</h4>
							{teamKeys.slice(23, 30).map((team, i) => teamListItem(team, i))}
					</ul>
				</div>

					<div className='rating panel-cell overall scanlines' style={{backgroundColor: 'rgba(' + this.getOverallColor() + ', .85)'}}>
						<h3><span>{ ratingArr[0] }</span> Overall</h3>
					</div>

					{['Offense', 'Defense', 'Power Play', 'Penalty Kill', 'Goaltending', 'Discipline'].map((cat, i) => (
						<div className="rating panel-cell" key={i}>
							<h3><span>{ ratingArr[i + 1] }</span> { cat }</h3>
							<div className='meter' style={this.adjustMeter(ratingArr[i + 1])}></div>
						</div>
					))}

				</div>
			</div>);
	},
	getOverallColor() {
		const overall = this.props.team[1][0];
		if (overall < 65) {
			return '229, 57, 53';
		} else {
			return overall < 80 ? '243, 182, 0' : '35, 182, 53';
		}
	},
	getThisTeam(e) {
		const team = e.target.innerHTML;
		this.props.changeTeam(team);
	},
	toggleDropdown() {
		this.setState(prevState => ({dropdownOpen: !prevState.dropdownOpen}))
	},
	adjustMeter(rating) {
		var meterColor;
		if (rating < 75) {
			meterColor = '229, 57, 53';
		} else {
			meterColor = rating < 85 ? '243, 182, 0' : '35, 182, 53';
		}
		rating = rating < 10 ? rating += '0' : rating;
		return {
			backgroundColor: `rgb(${meterColor})`,
			WebkitTransform: `scale3d(.${rating}, 1, 1)`,
			transform: `scale3d(.${rating}, 1, 1)`
		};
	}
});

export default TeamPanel;