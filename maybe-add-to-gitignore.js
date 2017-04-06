let path = require('path');
let fs = require('fs');
let gitignore = require('parse-gitignore');

module.exports = {
	maybeAddToGitIgnore
}

function maybeAddToGitIgnore (listToAdd) {
	// gulp will automatically change cwd
	let patterns = gitignore(
		'.gitignore'
	);

	listToAdd.map((patternToAdd) => {
		if (! patternIsInGitIgnore(patternToAdd)) {
			addToGitignore(patternToAdd);
		}
	});

	function patternIsInGitIgnore (pattern) {
		return patterns.indexOf(pattern) !== -1;
	}
}

function addToGitignore (pattern) {
	fs.appendFileSync(
		path.join(process.cwd(), '.gitignore'),
		`\n${pattern}`
	);
}
