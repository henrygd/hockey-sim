export const setPageTitle = titleContent => {
	document.title = `HOCKEY SIM | ${titleContent}`;
};

export const randomTeam = () => {
	const teamKeys = window.teamKeys;
	const team = teamKeys[Math.floor(Math.random() * teamKeys.length)];
	return [team, window.teamRatings[team]];
};

export const grabTeam = team => {
	return [team, window.teamRatings[team]];
};


export function Team(teamName) {
	var ratings = window.teamRatings[teamName];
	this.teamName = teamName; 
	this.off = ratings[1];
	this.def = ratings[2];
	this.pp = ratings[3];
	this.pk = ratings[4];
	this.tending = ratings[5];
	this.discipline = ratings[6];
	this.totalPoints = 0;
}

Team.prototype.scoringChance = function(opponent) {
	if ((this.off + Math.random() * 100) > (opponent.def + Math.random() * 100) && opponent.tending < Math.random() * 100 + 30) {
		return 1;
	}
	else if ((this.discipline / 2 + this.pp + Math.random() * 200) > (opponent.discipline / 2 + opponent.pk * 2 + Math.random() * 200)) {
		return 1;
	}
	else
		return 0;
};

export const ratings = [
	['Offense', 'Defense'],
	['Defense', 'Offense'],
	['Power Play', 'Penalty Kill'],
	['Penalty Kill', 'Power Play'],
	['Goaltending', 'Goaltending'],
	['Discipline', 'Discipline']
];

export const compareStrengths = (teamOneName, teamTwoName) => {
	const teamOne = new Team(teamOneName);
	const teamTwo = new Team(teamTwoName);
	let teamOneStrength = [0, 0];
	let teamTwoStrength = [0, 0];
	const compRats = [
		teamOne.off - teamTwo.def,
		teamOne.def - teamTwo.off,
		teamOne.pp - teamTwo.pk,
		teamOne.pk - teamTwo.pp,
		teamOne.tending - teamTwo.tending,
		teamOne.discipline - teamTwo.discipline
	];
	compRats.forEach(function(num, index) {
		if (num > teamOneStrength[1])
			teamOneStrength = [index, num];
		if (num < teamTwoStrength[1])
			teamTwoStrength = [index, num];
	});
	return [
		[teamOneStrength[1], ratings[teamOneStrength[0]], teamOneName, teamTwoName],
		[(teamTwoStrength[1] * -1), ratings[teamTwoStrength[0]].slice(0).reverse(), teamTwoName, teamOneName]
	];
};

// sim game function, team objects
export const simGame = (teamOne, teamTwo, gamesNum=500) => {
	let teamOneScore;
	let teamTwoScore;
	teamOne.wins = 0;
	teamTwo.wins = 0;
	// simulate x amount of games
	for (let games = 0; games < gamesNum; games++) {
		teamOneScore = 0;
		teamTwoScore = 0;
		// ten chances for each team
		for (let chances = 0; chances < 8; chances++) {
			teamOneScore += teamOne.scoringChance( teamTwo );
			teamTwoScore += teamTwo.scoringChance( teamOne );
		}
		// OVERTIME
		// if ( teamOneScore === teamTwoScore ) {
			while (teamOneScore === teamTwoScore) {
				teamOneScore += teamOne.scoringChance( teamTwo );
				teamTwoScore += teamTwo.scoringChance( teamOne );
			}
		// }
		// add to respective team's win number
		teamOne.totalPoints += teamOneScore;
		teamTwo.totalPoints += teamTwoScore;
		if (teamOneScore > teamTwoScore)
			teamOne.wins += 1;
		else
			teamTwo.wins += 1;
	}
	teamOne.avgScore = (teamOne.totalPoints / gamesNum).toFixed(1);
	teamTwo.avgScore = (teamTwo.totalPoints / gamesNum).toFixed(1);
	return { teamOne, teamTwo };
};

// custom detect IE
export const isIE = ['MSIE ', 'Trident/', 'Edge/'].filter(
		str => window.navigator.userAgent.indexOf(str) > -1
	).length
