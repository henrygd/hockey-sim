const teamRatings = {"Canadiens":[87,93,99,65,93,99,72,"0.836"],"Avalanche":[79,77,71,76,72,86,94,"0.634"],"Islanders":[79,78,79,57,95,76,87,"0.508"],"Stars":[76,79,73,62,81,88,74,"0.450"],"Jets":[69,74,67,58,76,74,67,"0.171"],"Panthers":[80,87,89,59,88,85,71,"0.561"],"Oilers":[82,90,79,64,92,87,82,"0.664"],"Coyotes":[70,80,55,60,75,78,70,"0.212"],"Lightning":[84,94,75,77,92,78,85,"0.651"],"Maple Leafs":[77,99,61,73,85,64,81,"0.349"],"Wild":[80,91,81,57,99,78,72,"0.526"],"Sharks":[76,80,83,62,85,77,71,"0.384"],"Flyers":[76,86,69,74,76,80,69,"0.367"],"Blue Jackets":[87,68,72,99,98,83,99,"0.773"],"Red Wings":[82,86,81,68,80,96,82,"0.732"],"Senators":[76,88,72,51,76,78,89,"0.462"],"Sabres":[74,72,76,70,81,81,62,"0.280"],"Devils":[81,67,90,70,94,91,74,"0.616"],"Rangers":[82,97,86,70,88,77,72,"0.563"],"Bruins":[76,77,69,53,87,72,96,"0.414"],"Capitals":[79,83,93,56,75,92,76,"0.620"],"Ducks":[84,75,85,68,87,91,98,"0.794"],"Blackhawks":[74,90,67,65,48,96,79,"0.536"],"Blues":[82,78,83,73,95,77,85,"0.609"],"Predators":[76,69,68,90,71,81,79,"0.450"],"Penguins":[77,71,71,68,82,83,87,"0.490"],"Hurricanes":[75,85,65,72,95,64,68,"0.244"],"Kings":[73,80,73,62,73,76,74,"0.292"],"Flames":[75,83,68,57,79,81,84,"0.427"],"Canucks":[77,61,91,58,87,89,73,"0.448"]};

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

const teamOne = new Team('Ducks');
const teamTwo = new Team('Oilers');
// console.log(teamOne, teamTwo);
const result = simGame(teamOne, teamTwo);

// console.log(result)


console.log(`${result.teamOne.teamName}: ${result.teamOne.wins} | ${result.teamTwo.teamName}: ${result.teamTwo.wins}\nAverage score: ${result.teamOne.avgScore} - ${result.teamTwo.avgScore}`)

// find winning pct
// const teamKeys = Object.keys(teamRatings);
// let winObj = {};
// let teamKeysClone = teamKeys.slice(0);
// const numGames = 100;
// while (teamKeysClone.length > 0) {
// 	const curTeam = teamKeysClone.pop();
// 	for (var i = 0; i < teamKeys.length; i++) {
// 		const opponent = teamKeys[i];
// 		if (opponent !== curTeam) {
// 			const result = simGame(new Team(curTeam), new Team(opponent), numGames);
// 			const resultWins = result.teamOne.wins;
// 			const curWins = winObj[curTeam];
// 			winObj[curTeam] = curWins ? (curWins + resultWins) : resultWins;
// 		}
// 	}
// }

// // for display
// var mapArr = teamKeys.map((team) => [team, winObj[team]]);
// mapArr.sort((a, b) => a[1] - b[1]).reverse().forEach((teamArr) => console.log(`${teamArr[0]}: ${teamArr[1]} (${(teamArr[1] / (teamKeys.length - 1) / numGames).toFixed(3)})`))

// teamKeys.forEach((team) => teamRatings[team].push((winObj[team] / (teamKeys.length - 1) / numGames).toFixed(3)))
// teamRatingArr = [teamRatings, curDate.toLocaleDateString()];
// writeThisFile(`./teamratings-${curDate.toISOString()}.json`, JSON.stringify(teamRatingArr), () => {
// 	writeThisFile('./../public/js/teamratings.json', JSON.stringify(teamRatingArr), () => console.log('All done!'));
// });
// }
