#! /usr/local/bin/node

const fs = require('fs');
const curDate = new Date();

console.log('Adding win pct to teamratings...');

fs.readFile('./teamratings.json', 'utf8', (err, teamratingsText) => {
	if (err) return console.error(err);
	addWinPct(JSON.parse(teamratingsText));
});

const addWinPct = teamRatings => {
	// team, simGame functions
	function Team(teamName) {
		var ratings = teamRatings[teamName];
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

	const simGame = (teamOne, teamTwo, gamesNum=500) => {
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

	// find winning pct
	const teamKeys = Object.keys(teamRatings);
	let winObj = {};
	let teamKeysClone = teamKeys.slice(0);
	const numGames = 100;
	while (teamKeysClone.length > 0) {
		const curTeam = teamKeysClone.pop();
		for (var i = 0; i < teamKeys.length; i++) {
			const opponent = teamKeys[i];
			if (opponent !== curTeam) {
				const result = simGame(new Team(curTeam), new Team(opponent), numGames);
				const resultWins = result.teamOne.wins;
				const curWins = winObj[curTeam];
				winObj[curTeam] = curWins ? (curWins + resultWins) : resultWins;
			}
		}
	}

	// // for display
	// var mapArr = teamKeys.map((team) => [team, winObj[team]]);
	// mapArr.sort((a, b) => a[1] - b[1]).reverse().forEach((teamArr) => console.log(`${teamArr[0]}: ${teamArr[1]} (${(teamArr[1] / (teamKeys.length - 1) / numGames).toFixed(3)})`))

	
	teamKeys.forEach((team) => teamRatings[team].push((winObj[team] / (teamKeys.length - 1) / numGames).toFixed(3)))

		// output
	fs.writeFile('./../public/js/teamratings.json', JSON.stringify([teamRatings, curDate.toLocaleDateString()]), err => {
		if (err) return console.error(err);
		console.log('All done!');
	})
}
