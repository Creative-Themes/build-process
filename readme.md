## Synopsis

That's a set of configs and scripts built on top of `gulp` and `webpack`
that help us deliver awesome WordPress themes and Unyson extensions.

## Code Example

Example `gulpfile.js`

```javascript
const gulp = require('gulp');
const buildProcess = require('ct-build-process');

const data = require('./package.json');

var options = {
	entries: [
		{
			entry: './static/js/main.js',
			output: {
				path: './static/bundle/',
			}
		}
	],

	sassFiles: [
		{
			input: 'static/sass/style.scss',
			output: 'static/bundle',
			header: buildProcess.headerFor(false, data)
		}
	],

	browserSyncEnabled: true,

	sassWatch: [
		'assets/*/sass/**/*.scss'
	],

	toClean: [
		'static/bundle/'
	]
};

buildProcess.registerTasks(gulp, options);
```

## Motivation

We wanted a clean way of building assets in a consistent manner across many
repositories. That's the best thing we were able to come up with.

## Installation

```bash
npm install --save-dev ct-build-process
```

Then build your own `gulpfile.js` on top of our module. Read the code if you
need more details about the various config flags we have here.

## API Reference


## License

MIT

![](https://avatars0.githubusercontent.com/u/20202907?v=3&s=200)
