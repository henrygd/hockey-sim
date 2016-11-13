#! /usr/local/bin/node

const fs = require('fs');
const path = require('path');

const files = process.argv.slice(2);

let teamObj = {
	// Metropolitan Division
	"Hurricanes":["206,17,38"],
	"Blue Jackets":["0,40,92"],
	"Devils":["206,17,38"],
	"Islanders":["0,56,147"],
	"Rangers":["0,56,168"],
	"Flyers":["247,73,2"],
	"Penguins":["252,181,20"],
	"Capitals":["207,10,44"],
	// Atlantic Division
	"Bruins":["252,181,20"],
	"Sabres":["0,38,84"],
	"Red Wings":["206,17,38"],
	"Panthers":["200,16,46"],
	"Canadiens":["175,30,45"],
	"Senators":["206,17,38"],
	"Lightning":["0,40,104"],
	"Maple Leafs":["0,32,91"],
	// Central Division
	"Blackhawks":["207,10,44"],
	"Avalanche":["111,38,61"],
	"Stars":["0,104,71"],
	"Wild":["2,73,48"],
	"Predators":["255,184,28"],
	"Blues":["0,47,135"],
	"Jets":["4,30,65"],
	// Pacific Division
	"Ducks":["17,17,17"],
	"Coyotes":["140,38,51"],
	"Flames":["206,17,38"],
	"Oilers":["0,56,168"],
	"Kings":["17,17,17"],
	"Sharks":["0,109,117"],
	"Canucks":["7,52,111"]
}

let filesDone = 0;

const addFile = fileName => {
	const file = path.resolve(__dirname, fileName);
	const teamName = fileName.split('.')[0];
	fs.readFile(file, 'utf8', function(err, data) {
		if (err) throw err;
		teamObj[teamName].push(encodeURIComponent(data));
		filesDone += 1;
		if (filesDone === files.length) {
			fs.writeFile('./../../js/localStoreTeams.json', JSON.stringify(teamObj), (err) => {
				if (err) throw err;
				console.log('Team object saved as localStoreTeams.json');
			})
		}
	});
}

files.forEach(fileName => addFile(fileName));
