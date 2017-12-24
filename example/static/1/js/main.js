function handler () {
	import('./a.js').then(() => doStuff())
}

function doStuff () {
	__('hello')
}
