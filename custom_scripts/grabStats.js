#! /usr/local/bin/node

const http = require('http');
const fs = require('fs');

// object to store needed stats for teams
let teamObj = {};

const fetchJSON = (url, cb) => {
	http.get(url, (res) => {
	  const statusCode = res.statusCode;
	  const contentType = res.headers['content-type'];

	  let error;
	  if (statusCode !== 200) {
	    error = new Error(`Request Failed.\n` +
	                      `Status Code: ${statusCode}\n` +
	                      `URL: ${url}`);
	  } else if (!/^application\/json/.test(contentType)) {
	    error = new Error(`Invalid content-type.\n` +
	                      `Expected application/json but received ${contentType}\n` +
	                      `URL: ${url}`);
	  }
	  if (error) {
	    console.log(error.message);
	    // consume response data to free up memory
	    res.resume();
	    return;
	  }

	  res.setEncoding('utf8');
	  let rawData = '';
	  res.on('data', (chunk) => rawData += chunk);
	  res.on('end', () => {
	    try {
	      let parsedData = JSON.parse(rawData);
	      cb(parsedData);
	    } catch (e) {
	      console.log(e.message);
	    }
	  });
	}).on('error', (e) => {
	  console.log(`Got error: ${e.message}`);
	});
}


// ADD TEAM SUMMARY STATS TO teamObj
const fetchStats = (() => {
	console.log('Fetching current stats...')
	fetchJSON('http://www.nhl.com/stats/rest/grouped/team/basic/season/teamsummary?cayenneExp=seasonId=20162017 and gameTypeId=2', (data) => {
		data.data.forEach(statObj => {
			const team = statObj.teamAbbrev;
			const { goalsAgainstPerGame, goalsForPerGame, ppPctg, pkPctg, shotsAgainstPerGame, 
							shotsForPerGame, pointPctg, faceoffWinPctg, gamesPlayed } = statObj;
			teamObj[team] = {
				general: {},
				offense: {},
				defense: {},
				penalties: {},
				goaltending: {},
				discipline: {}
			};
			teamObj[team].general    = { pointPctg, gamesPlayed };
			teamObj[team].offense    = { shotsForPerGame, goalsForPerGame };
			teamObj[team].defense    = { shotsAgainstPerGame, goalsAgainstPerGame };
			teamObj[team].penalties  = { ppPctg, pkPctg };
			teamObj[team].discipline = { faceoffWinPctg }
		});
		setTimeout(shootingPct, 1000);
	});
	// PENALTY STATS
	function penalties() {
		fetchJSON('http://www.nhl.com/stats/rest/grouped/team/core/season/teamscoring?cayenneExp=seasonId=20162017%20and%20gameTypeId=2', data => {
			data.data.forEach(statObj => {
				const team = statObj.teamAbbrev;
				const { penaltiesPer60Minutes, penaltiesDrawnPer60Minutes } = statObj;
				teamObj[team].discipline = Object.assign(teamObj[team].discipline, {
					penaltiesPer60Minutes,
					penaltiesDrawnPer60Minutes
				})
			});
			setTimeout(turnovers, 1000);
		});
	}
	// // SHOOTING PCT
	function shootingPct() {
		fetchJSON('http://www.nhl.com/stats/rest/grouped/team/shooting/season/teampercentages?cayenneExp=seasonId=20162017%20and%20gameTypeId=2', data => {
			data.data.forEach(statObj => {
				const team = statObj.teamAbbrev;
				const { shotAttemptsPctg, shotAttemptsPctgClose, fiveOnFiveShootingPctg, fiveOnFiveSavePctg } = statObj;
				teamObj[team].general = Object.assign(teamObj[team].general, { 
					shotAttemptsPctg, shotAttemptsPctgClose
				});
				teamObj[team].offense = Object.assign(teamObj[team].offense, {
					fiveOnFiveShootingPctg
				})
				teamObj[team].goaltending = Object.assign(teamObj[team].goaltending, {
					fiveOnFiveSavePctg
				})
			});
			setTimeout(penalties, 1000);
		});
	}
	// BLOCKED SHOTS / GIVEAWAYS / TAKEAWAYS
	function turnovers() {
		fetchJSON('http://www.nhl.com/stats/rest/grouped/team/basic/season/realtime?cayenneExp=seasonId=20162017%20and%20gameTypeId=2', data => {
			data.data.forEach(statObj => {
				const team = statObj.teamAbbrev;
				const { blockedShots, giveaways, takeaways } = statObj;
				teamObj[team].discipline = Object.assign(teamObj[team].discipline, {
					blockedShots,
					giveaways,
					takeaways
				})
			});
			setTimeout(calculateRatings, 1000);
		});
	}
})();


// CALCULATE TEAM RATINGS FROM FETCHED STATS
function calculateRatings() {
	let teamRatings = {};
	let teamKeys;
	// map team abbreviation from fetched stats to longer team name
	const teamNames = {Canadiens:"MTL",Avalanche:"COL",Islanders:"NYI",Sharks:"SJS",Stars:"DAL",Jets:"WPG",Panthers:"FLA",Oilers:"EDM",Coyotes:"ARI",Lightning:"TBL","Maple Leafs":"TOR",Wild:"MIN",Flyers:"PHI","Blue Jackets":"CBJ","Red Wings":"DET",Senators:"OTT",Sabres:"BUF",Devils:"NJD",Rangers:"NYR",Bruins:"BOS",Capitals:"WSH",Ducks:"ANA",Blackhawks:"CHI",Blues:"STL",Predators:"NSH",Penguins:"PIT",Hurricanes:"CAR",Kings:"LAK",Flames:"CGY",Canucks:"VAN"};;

	function calcTeamRatings(teamName) {
		let ratingArr = [];
		const teamStats = teamObj[teamNames[teamName]];
		var offense, defense, powerPlay, penaltyKill, goaltending, discipline;
		// general variables
		const { gamesPlayed, pointPctg, shotAttemptsPctg, shotAttemptsPctgClose } = teamStats.general;
		// offense variables
		const { shotsForPerGame, goalsForPerGame, fiveOnFiveShootingPctg } = teamStats.offense;
		// defense variables
		const { shotsAgainstPerGame, goalsAgainstPerGame } = teamStats.defense;
		// penalties variables
		const { ppPctg, pkPctg } = teamStats.penalties;
		// disipline variables
		const { faceoffWinPctg, penaltiesPer60Minutes, penaltiesDrawnPer60Minutes, blockedShots, giveaways, takeaways } = teamStats.discipline;
		// goaltending variables
		const { fiveOnFiveSavePctg } = teamStats.goaltending;
		// offense / defense multiplier
		const offDefMultiplier = shotAttemptsPctg + shotAttemptsPctgClose + 2;
		// calc offense
		offense = (shotsForPerGame + fiveOnFiveShootingPctg * 150 + goalsForPerGame * 10) * offDefMultiplier;
		ratingArr.push(offense)
		// calc defense
		defense = ((shotsAgainstPerGame * goalsAgainstPerGame) * -1 - 75) * offDefMultiplier;
		ratingArr.push(defense)
		// calc powerPlay
		powerPlay = ppPctg + 0.4;
		ratingArr.push(powerPlay)
		// calc penaltyKill
		penaltyKill = pkPctg;
		ratingArr.push(penaltyKill)
		// calc goaltending
		goaltending = fiveOnFiveSavePctg - 0.7;
		ratingArr.push(goaltending);
		// calc discipline
		const penaltyMargin  = penaltiesPer60Minutes - penaltiesDrawnPer60Minutes;
		const turnoverMargin = (takeaways - giveaways) / gamesPlayed / 5;
		// console.log(teamName, turnoverMargin)
		discipline = penaltyMargin + turnoverMargin + faceoffWinPctg + 6;
		// console.log(teamName, penaltyMargin, turnoverMargin, faceoffWinPctg, discipline);
		ratingArr.push(discipline);
		// push ratings array to teamRatings
		teamRatings[teamName] = ratingArr;
	}

	// store team name keys in correct division order
	teamKeys = ['Hurricanes', 'Blue Jackets', 'Devils', 'Islanders', 'Rangers', 'Flyers', 'Penguins', 'Capitals', 'Bruins', 'Sabres', 'Red Wings', 'Panthers', 'Canadiens', 'Senators', 'Lightning', 'Maple Leafs', 'Blackhawks', 'Avalanche', 'Stars', 'Wild', 'Predators', 'Blues', 'Jets', 'Ducks', 'Coyotes', 'Flames', 'Oilers', 'Kings', 'Sharks', 'Canucks'];
	
	teamKeys.forEach(teamName => calcTeamRatings(teamName))

	// return highest num from index across dif arrays of teamRatings obj
	// to get lowest, switch around a and b
	function getBestRating(index, sortFunc=(a, b) => b - a) {
		let arr = [];
		let bestRating;
		teamKeys.forEach(teamName => arr.push(teamRatings[teamName][index]))
		bestRating = arr.sort((a, b) => sortFunc(a, b))[0];
		return bestRating > 0 ? bestRating * 1.01 : bestRating * 0.99;
	};

	// loop over all teams ratings and normalize out of 100
	(() => {
		const arrLength = teamRatings[teamKeys[0]].length;
		let bestRating;
		for (var i = 0; i < arrLength; i++) {
			bestRating = getBestRating(i);
			// loop through teams assigning out of 100
			teamKeys.forEach(teamName => {
				teamRatings[teamName][i] = bestRating > 0 ? 
					Math.round(teamRatings[teamName][i] / bestRating * 100) :
					Math.round(bestRating / teamRatings[teamName][i] * 100);
			})
		}
	})();

	// add in overall
	(() => {
		teamKeys.forEach(teamName => {
			let overallRating;
			let ratingArr = teamRatings[teamName];
			overallRating = Math.round(ratingArr.reduce((a, b) => a + b) / ratingArr.length);
			teamRatings[teamName].unshift(overallRating);
		});
	})();

	// SAVE FILE
	fs.writeFile('./teamratings.json', JSON.stringify(teamRatings), err => {
		if (err) return console.error(err);
		console.log('Saved to teamratings.json');
	})
}
