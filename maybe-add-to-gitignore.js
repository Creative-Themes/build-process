let path = require('path');
let fs = require('fs');
let gitignore = require('parse-gitignore');
let logger = require('gulplog');

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
		} else {
			logger.debug(`Skipping ${patternToAdd}, already present in .gitignore`);
		}
	});

	function patternIsInGitIgnore (pattern) {
		return patterns.map(removeExtraChars).indexOf(
			removeExtraChars(pattern)
		) !== -1;

		function removeExtraChars (pattern) {
			return pattern
				.replace(/\//g, '')
				.replace(/\*/g, '')
		}
	}
}

function addToGitignore (pattern) {
	logger.info(`Adding ${pattern} to .gitignore`);

	fs.appendFileSync(
		path.join(process.cwd(), '.gitignore'),
		`\n${pattern}`
	);
}


