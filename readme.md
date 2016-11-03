## Synopsis

That's a set of configs and scripts built on top of `gulp` and `webpack`
that help us deliver awesome WordPress themes and
[Unyson](http://manual.unyson.io) extensions.

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

Every task here respects `NODE_ENV=production` in its own way. Minification,
source maps, watching - all of this is present just in development.

There are two types of packages:

1. `wordpress_theme`
2. `unyson_extension`

### Webpack tasks

* `gulp webpack` - one time build. Doesn't watch if you set `NODE_ENV=production`

### SASS tasks

* `gulp sass` - one time build
* `gulp sass:watch` - `gulp sass` with watcher

### Bump version

Some tasks that will look at your package type and replace the current version
with the bumped one. Very convenient.

1. `wordpress_theme` - will look in: `bower.json`, `package.json`, `style.css`
2. `unyson_extension` - will look in `package.json` and [`manifest.php`](http://manual.unyson.io/en/latest/manifest/extension.html#content)

* `gulp bump:major`
* `gulp bump:minor`
* `gulp bump:patch` or `gulp bump`

Uses [`node-semver`](https://github.com/npm/node-semver).

### Create build

There are some specific tasks for creating and publishing new releases of
WordPress themes and Unyson extensions. This tasks will respect `options.packageType`
option.

The `build:create_release` tasks depends strongly on [github-release](https://github.com/aktau/github-release)
package. You should go ahead and install it and make it available in your `$PATH`
variable, otherwise you won't be able to benefit from this task. Also, 
`GITHUB_TOKEN` should be exported by your shell login script (like `bashrc` or `zshrc`).

```bash
export GITHUB_TOKEN=YOUR_GITHUB_TOKEN
```

* `gulp build:remove_tmp` - will remove `build_tmp` directory in your package
* `gulp build:copy_files` - will copy files to your build dir, with respect of your .gitignore.
* `gulp build:delete_files_from_build` - delete `options.filesToDeleteFromBuild`
* `gulp build:prepare_production_zip`
* `gulp build` - a combination of the four above
* `gulp build:create_release`

* `gulp build:publish` - a combination of `build` and `build:create_release`

### Other tasks

* `gulp clean` - will clean all the files. Respects `options.toClean` also
* `gulp build` - `gulp clean; gulp webpack; gulp sass`
* `gulp dev` - `gulp build; gulp sass:watch`
* `NODE_ENV=production gulp build` - reliable way of building assets for production

### Stripe Code

* `gulp build:strip_code` - Will stripe code that's between a pair of comments matched
by regex. You have to specify a list of files to look into. Comments and list of
files is configurable.

### Options

* `packageType` - unyson_extension | wordpress_theme
* `currentVersion` - current package version used by `gulp bump`
* `entries` - Multiple entries for [webpack-multi-compiler](https://github.com/webpack/webpack/tree/master/examples/multi-compiler). They have some syntactic sugar like
  `forEachFolderIn`, which is kinda nice to have
* `webpackIncludePaths`
* `webpackExternals`
* `webpackResolveAliases`
* `webpackPlugins`
* `webpackAdditionalModules`

* `sassFiles` - array of objects that specify input and output for sass compiler
* `sassIncludePaths`
* `browserSyncEnabled`
* `browserSyncInitOptions`
* `watchFilesAndReload` - list of files for browser sync - will cause browser to reload when any of them is changed at the fs level

* `toClean` - list of files for `gulp clean`

* `stripCodeStartComment`
* `stripCodeEndComment`
* `filesToStripCodeFrom` - `gulp build:strip_code` stuff

## License

MIT

[![](https://avatars0.githubusercontent.com/u/20202907?v=3&s=200)](http://creativethemes.com/)
