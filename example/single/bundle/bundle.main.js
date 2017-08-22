/******/ (function(modules) { // webpackBootstrap
/******/ 	/** ===== Webpack2 Polyfill ===== **/
/******/ 	(function(){
/******/ 		var _global = this;
/******/ 		var module = undefined;
/******/ 		/** ===== Promise Polyfill ===== **/
/******/ 		if(!_global.Promise){
/******/ 			(function (root) {
/******/
/******/ 			                                                                         
/******/ 			                                                                 
/******/ 			  var setTimeoutFunc = setTimeout;
/******/
/******/ 			  function noop() {}
/******/ 			  
/******/ 			                                         
/******/ 			  function bind(fn, thisArg) {
/******/ 			    return function () {
/******/ 			      fn.apply(thisArg, arguments);
/******/ 			    };
/******/ 			  }
/******/
/******/ 			  function Promise(fn) {
/******/ 			    if (typeof this !== 'object') throw new TypeError('Promises must be constructed via new');
/******/ 			    if (typeof fn !== 'function') throw new TypeError('not a function');
/******/ 			    this._state = 0;
/******/ 			    this._handled = false;
/******/ 			    this._value = undefined;
/******/ 			    this._deferreds = [];
/******/
/******/ 			    doResolve(fn, this);
/******/ 			  }
/******/
/******/ 			  function handle(self, deferred) {
/******/ 			    while (self._state === 3) {
/******/ 			      self = self._value;
/******/ 			    }
/******/ 			    if (self._state === 0) {
/******/ 			      self._deferreds.push(deferred);
/******/ 			      return;
/******/ 			    }
/******/ 			    self._handled = true;
/******/ 			    Promise._immediateFn(function () {
/******/ 			      var cb = self._state === 1 ? deferred.onFulfilled : deferred.onRejected;
/******/ 			      if (cb === null) {
/******/ 			        (self._state === 1 ? resolve : reject)(deferred.promise, self._value);
/******/ 			        return;
/******/ 			      }
/******/ 			      var ret;
/******/ 			      try {
/******/ 			        ret = cb(self._value);
/******/ 			      } catch (e) {
/******/ 			        reject(deferred.promise, e);
/******/ 			        return;
/******/ 			      }
/******/ 			      resolve(deferred.promise, ret);
/******/ 			    });
/******/ 			  }
/******/
/******/ 			  function resolve(self, newValue) {
/******/ 			    try {
/******/ 			                                                                                                                       
/******/ 			      if (newValue === self) throw new TypeError('A promise cannot be resolved with itself.');
/******/ 			      if (newValue && (typeof newValue === 'object' || typeof newValue === 'function')) {
/******/ 			        var then = newValue.then;
/******/ 			        if (newValue instanceof Promise) {
/******/ 			          self._state = 3;
/******/ 			          self._value = newValue;
/******/ 			          finale(self);
/******/ 			          return;
/******/ 			        } else if (typeof then === 'function') {
/******/ 			          doResolve(bind(then, newValue), self);
/******/ 			          return;
/******/ 			        }
/******/ 			      }
/******/ 			      self._state = 1;
/******/ 			      self._value = newValue;
/******/ 			      finale(self);
/******/ 			    } catch (e) {
/******/ 			      reject(self, e);
/******/ 			    }
/******/ 			  }
/******/
/******/ 			  function reject(self, newValue) {
/******/ 			    self._state = 2;
/******/ 			    self._value = newValue;
/******/ 			    finale(self);
/******/ 			  }
/******/
/******/ 			  function finale(self) {
/******/ 			    if (self._state === 2 && self._deferreds.length === 0) {
/******/ 			      Promise._immediateFn(function() {
/******/ 			        if (!self._handled) {
/******/ 			          Promise._unhandledRejectionFn(self._value);
/******/ 			        }
/******/ 			      });
/******/ 			    }
/******/
/******/ 			    for (var i = 0, len = self._deferreds.length; i < len; i++) {
/******/ 			      handle(self, self._deferreds[i]);
/******/ 			    }
/******/ 			    self._deferreds = null;
/******/ 			  }
/******/
/******/ 			  function Handler(onFulfilled, onRejected, promise) {
/******/ 			    this.onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : null;
/******/ 			    this.onRejected = typeof onRejected === 'function' ? onRejected : null;
/******/ 			    this.promise = promise;
/******/ 			  }
/******/
/******/ 			     
/******/ 			                                                                   
/******/ 			                                                     
/******/ 			    
/******/ 			                                          
/******/ 			     
/******/ 			  function doResolve(fn, self) {
/******/ 			    var done = false;
/******/ 			    try {
/******/ 			      fn(function (value) {
/******/ 			        if (done) return;
/******/ 			        done = true;
/******/ 			        resolve(self, value);
/******/ 			      }, function (reason) {
/******/ 			        if (done) return;
/******/ 			        done = true;
/******/ 			        reject(self, reason);
/******/ 			      });
/******/ 			    } catch (ex) {
/******/ 			      if (done) return;
/******/ 			      done = true;
/******/ 			      reject(self, ex);
/******/ 			    }
/******/ 			  }
/******/
/******/ 			  Promise.prototype['catch'] = function (onRejected) {
/******/ 			    return this.then(null, onRejected);
/******/ 			  };
/******/
/******/ 			  Promise.prototype.then = function (onFulfilled, onRejected) {
/******/ 			    var prom = new (this.constructor)(noop);
/******/
/******/ 			    handle(this, new Handler(onFulfilled, onRejected, prom));
/******/ 			    return prom;
/******/ 			  };
/******/
/******/ 			  Promise.all = function (arr) {
/******/ 			    var args = Array.prototype.slice.call(arr);
/******/
/******/ 			    return new Promise(function (resolve, reject) {
/******/ 			      if (args.length === 0) return resolve([]);
/******/ 			      var remaining = args.length;
/******/
/******/ 			      function res(i, val) {
/******/ 			        try {
/******/ 			          if (val && (typeof val === 'object' || typeof val === 'function')) {
/******/ 			            var then = val.then;
/******/ 			            if (typeof then === 'function') {
/******/ 			              then.call(val, function (val) {
/******/ 			                res(i, val);
/******/ 			              }, reject);
/******/ 			              return;
/******/ 			            }
/******/ 			          }
/******/ 			          args[i] = val;
/******/ 			          if (--remaining === 0) {
/******/ 			            resolve(args);
/******/ 			          }
/******/ 			        } catch (ex) {
/******/ 			          reject(ex);
/******/ 			        }
/******/ 			      }
/******/
/******/ 			      for (var i = 0; i < args.length; i++) {
/******/ 			        res(i, args[i]);
/******/ 			      }
/******/ 			    });
/******/ 			  };
/******/
/******/ 			  Promise.resolve = function (value) {
/******/ 			    if (value && typeof value === 'object' && value.constructor === Promise) {
/******/ 			      return value;
/******/ 			    }
/******/
/******/ 			    return new Promise(function (resolve) {
/******/ 			      resolve(value);
/******/ 			    });
/******/ 			  };
/******/
/******/ 			  Promise.reject = function (value) {
/******/ 			    return new Promise(function (resolve, reject) {
/******/ 			      reject(value);
/******/ 			    });
/******/ 			  };
/******/
/******/ 			  Promise.race = function (values) {
/******/ 			    return new Promise(function (resolve, reject) {
/******/ 			      for (var i = 0, len = values.length; i < len; i++) {
/******/ 			        values[i].then(resolve, reject);
/******/ 			      }
/******/ 			    });
/******/ 			  };
/******/
/******/ 			                                                        
/******/ 			  Promise._immediateFn = (typeof setImmediate === 'function' && function (fn) { setImmediate(fn); }) ||
/******/ 			    function (fn) {
/******/ 			      setTimeoutFunc(fn, 0);
/******/ 			    };
/******/
/******/ 			  Promise._unhandledRejectionFn = function _unhandledRejectionFn(err) {
/******/ 			    if (typeof console !== 'undefined' && console) {
/******/ 			      console.warn('Possible Unhandled Promise Rejection:', err);                                  
/******/ 			    }
/******/ 			  };
/******/
/******/ 			     
/******/ 			                                                    
/******/ 			                                             
/******/ 			                
/******/ 			     
/******/ 			  Promise._setImmediateFn = function _setImmediateFn(fn) {
/******/ 			    Promise._immediateFn = fn;
/******/ 			  };
/******/
/******/ 			     
/******/ 			                                                          
/******/ 			                                                                    
/******/ 			                
/******/ 			     
/******/ 			  Promise._setUnhandledRejectionFn = function _setUnhandledRejectionFn(fn) {
/******/ 			    Promise._unhandledRejectionFn = fn;
/******/ 			  };
/******/ 			  
/******/ 			  if (typeof module !== 'undefined' && module.exports) {
/******/ 			    module.exports = Promise;
/******/ 			  } else if (!root.Promise) {
/******/ 			    root.Promise = Promise;
/******/ 			  }
/******/
/******/ 			})(this);
/******/ 		}
/******/ 		/** ===== Promise Polyfill end ===== **/
/******/ 	}).call((function(){
/******/ 	if(typeof window != "undefined") return window;
/******/ 	if(typeof global != "undefined") return global;
/******/ 	if(typeof self != "undefined") return self;
/******/ 	})())
/******/ 	/** ===== Webpack2 Polyfill end ===== **/
/******/
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

var css = __webpack_require__(1);
1 + 1;

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(2);
if(typeof content === 'string') content = [[module.i, content, '']];
// add the styles to the DOM
var update = __webpack_require__(4)(content, {});
if(content.locals) module.exports = content.locals;
// Hot Module Replacement
if(false) {
	// When the styles change, update the <style> tags
	if(!content.locals) {
		module.hot.accept("!!../../../node_modules/css-loader/index.js?sourceMap!../../../node_modules/postcss-loader/index.js!./a.css", function() {
			var newContent = require("!!../../../node_modules/css-loader/index.js?sourceMap!../../../node_modules/postcss-loader/index.js!./a.css");
			if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
			update(newContent);
		});
	}
	// When the module is disposed, remove the <style> tags
	module.hot.dispose(function() { update(); });
}

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(3)();
// imports


// module
exports.push([module.i, "body {\n  display: -ms-flexbox;\n  display: flex;\n}\n\n", "", {"version":3,"sources":["/Users/andreiglingeanu/Projects/full/ct/build-process/example/single/js/a.css"],"names":[],"mappings":"AAAA;EACE,qBAAc;EAAd,cAAc;CACf","file":"a.css","sourcesContent":["body {\n  display: flex;\n}\n\n"],"sourceRoot":""}]);

// exports


/***/ }),
/* 3 */
/***/ (function(module, exports) {

/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
// css base code, injected by the css-loader
module.exports = function() {
	var list = [];

	// return the list of modules as css string
	list.toString = function toString() {
		var result = [];
		for(var i = 0; i < this.length; i++) {
			var item = this[i];
			if(item[2]) {
				result.push("@media " + item[2] + "{" + item[1] + "}");
			} else {
				result.push(item[1]);
			}
		}
		return result.join("");
	};

	// import a list of modules into the list
	list.i = function(modules, mediaQuery) {
		if(typeof modules === "string")
			modules = [[null, modules, ""]];
		var alreadyImportedModules = {};
		for(var i = 0; i < this.length; i++) {
			var id = this[i][0];
			if(typeof id === "number")
				alreadyImportedModules[id] = true;
		}
		for(i = 0; i < modules.length; i++) {
			var item = modules[i];
			// skip already imported module
			// this implementation is not 100% perfect for weird media query combinations
			//  when a module is imported multiple times with different media queries.
			//  I hope this will never occur (Hey this way we have smaller bundles)
			if(typeof item[0] !== "number" || !alreadyImportedModules[item[0]]) {
				if(mediaQuery && !item[2]) {
					item[2] = mediaQuery;
				} else if(mediaQuery) {
					item[2] = "(" + item[2] + ") and (" + mediaQuery + ")";
				}
				list.push(item);
			}
		}
	};
	return list;
};


/***/ }),
/* 4 */
/***/ (function(module, exports) {

/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
var stylesInDom = {},
	memoize = function(fn) {
		var memo;
		return function () {
			if (typeof memo === "undefined") memo = fn.apply(this, arguments);
			return memo;
		};
	},
	isOldIE = memoize(function() {
		return /msie [6-9]\b/.test(self.navigator.userAgent.toLowerCase());
	}),
	getHeadElement = memoize(function () {
		return document.head || document.getElementsByTagName("head")[0];
	}),
	singletonElement = null,
	singletonCounter = 0,
	styleElementsInsertedAtTop = [];

module.exports = function(list, options) {
	if(typeof DEBUG !== "undefined" && DEBUG) {
		if(typeof document !== "object") throw new Error("The style-loader cannot be used in a non-browser environment");
	}

	options = options || {};
	// Force single-tag solution on IE6-9, which has a hard limit on the # of <style>
	// tags it will allow on a page
	if (typeof options.singleton === "undefined") options.singleton = isOldIE();

	// By default, add <style> tags to the bottom of <head>.
	if (typeof options.insertAt === "undefined") options.insertAt = "bottom";

	var styles = listToStyles(list);
	addStylesToDom(styles, options);

	return function update(newList) {
		var mayRemove = [];
		for(var i = 0; i < styles.length; i++) {
			var item = styles[i];
			var domStyle = stylesInDom[item.id];
			domStyle.refs--;
			mayRemove.push(domStyle);
		}
		if(newList) {
			var newStyles = listToStyles(newList);
			addStylesToDom(newStyles, options);
		}
		for(var i = 0; i < mayRemove.length; i++) {
			var domStyle = mayRemove[i];
			if(domStyle.refs === 0) {
				for(var j = 0; j < domStyle.parts.length; j++)
					domStyle.parts[j]();
				delete stylesInDom[domStyle.id];
			}
		}
	};
}

function addStylesToDom(styles, options) {
	for(var i = 0; i < styles.length; i++) {
		var item = styles[i];
		var domStyle = stylesInDom[item.id];
		if(domStyle) {
			domStyle.refs++;
			for(var j = 0; j < domStyle.parts.length; j++) {
				domStyle.parts[j](item.parts[j]);
			}
			for(; j < item.parts.length; j++) {
				domStyle.parts.push(addStyle(item.parts[j], options));
			}
		} else {
			var parts = [];
			for(var j = 0; j < item.parts.length; j++) {
				parts.push(addStyle(item.parts[j], options));
			}
			stylesInDom[item.id] = {id: item.id, refs: 1, parts: parts};
		}
	}
}

function listToStyles(list) {
	var styles = [];
	var newStyles = {};
	for(var i = 0; i < list.length; i++) {
		var item = list[i];
		var id = item[0];
		var css = item[1];
		var media = item[2];
		var sourceMap = item[3];
		var part = {css: css, media: media, sourceMap: sourceMap};
		if(!newStyles[id])
			styles.push(newStyles[id] = {id: id, parts: [part]});
		else
			newStyles[id].parts.push(part);
	}
	return styles;
}

function insertStyleElement(options, styleElement) {
	var head = getHeadElement();
	var lastStyleElementInsertedAtTop = styleElementsInsertedAtTop[styleElementsInsertedAtTop.length - 1];
	if (options.insertAt === "top") {
		if(!lastStyleElementInsertedAtTop) {
			head.insertBefore(styleElement, head.firstChild);
		} else if(lastStyleElementInsertedAtTop.nextSibling) {
			head.insertBefore(styleElement, lastStyleElementInsertedAtTop.nextSibling);
		} else {
			head.appendChild(styleElement);
		}
		styleElementsInsertedAtTop.push(styleElement);
	} else if (options.insertAt === "bottom") {
		head.appendChild(styleElement);
	} else {
		throw new Error("Invalid value for parameter 'insertAt'. Must be 'top' or 'bottom'.");
	}
}

function removeStyleElement(styleElement) {
	styleElement.parentNode.removeChild(styleElement);
	var idx = styleElementsInsertedAtTop.indexOf(styleElement);
	if(idx >= 0) {
		styleElementsInsertedAtTop.splice(idx, 1);
	}
}

function createStyleElement(options) {
	var styleElement = document.createElement("style");
	styleElement.type = "text/css";
	insertStyleElement(options, styleElement);
	return styleElement;
}

function createLinkElement(options) {
	var linkElement = document.createElement("link");
	linkElement.rel = "stylesheet";
	insertStyleElement(options, linkElement);
	return linkElement;
}

function addStyle(obj, options) {
	var styleElement, update, remove;

	if (options.singleton) {
		var styleIndex = singletonCounter++;
		styleElement = singletonElement || (singletonElement = createStyleElement(options));
		update = applyToSingletonTag.bind(null, styleElement, styleIndex, false);
		remove = applyToSingletonTag.bind(null, styleElement, styleIndex, true);
	} else if(obj.sourceMap &&
		typeof URL === "function" &&
		typeof URL.createObjectURL === "function" &&
		typeof URL.revokeObjectURL === "function" &&
		typeof Blob === "function" &&
		typeof btoa === "function") {
		styleElement = createLinkElement(options);
		update = updateLink.bind(null, styleElement);
		remove = function() {
			removeStyleElement(styleElement);
			if(styleElement.href)
				URL.revokeObjectURL(styleElement.href);
		};
	} else {
		styleElement = createStyleElement(options);
		update = applyToTag.bind(null, styleElement);
		remove = function() {
			removeStyleElement(styleElement);
		};
	}

	update(obj);

	return function updateStyle(newObj) {
		if(newObj) {
			if(newObj.css === obj.css && newObj.media === obj.media && newObj.sourceMap === obj.sourceMap)
				return;
			update(obj = newObj);
		} else {
			remove();
		}
	};
}

var replaceText = (function () {
	var textStore = [];

	return function (index, replacement) {
		textStore[index] = replacement;
		return textStore.filter(Boolean).join('\n');
	};
})();

function applyToSingletonTag(styleElement, index, remove, obj) {
	var css = remove ? "" : obj.css;

	if (styleElement.styleSheet) {
		styleElement.styleSheet.cssText = replaceText(index, css);
	} else {
		var cssNode = document.createTextNode(css);
		var childNodes = styleElement.childNodes;
		if (childNodes[index]) styleElement.removeChild(childNodes[index]);
		if (childNodes.length) {
			styleElement.insertBefore(cssNode, childNodes[index]);
		} else {
			styleElement.appendChild(cssNode);
		}
	}
}

function applyToTag(styleElement, obj) {
	var css = obj.css;
	var media = obj.media;

	if(media) {
		styleElement.setAttribute("media", media)
	}

	if(styleElement.styleSheet) {
		styleElement.styleSheet.cssText = css;
	} else {
		while(styleElement.firstChild) {
			styleElement.removeChild(styleElement.firstChild);
		}
		styleElement.appendChild(document.createTextNode(css));
	}
}

function updateLink(linkElement, obj) {
	var css = obj.css;
	var sourceMap = obj.sourceMap;

	if(sourceMap) {
		// http://stackoverflow.com/a/26603875
		css += "\n/*# sourceMappingURL=data:application/json;base64," + btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap)))) + " */";
	}

	var blob = new Blob([css], { type: "text/css" });

	var oldSrc = linkElement.href;

	linkElement.href = URL.createObjectURL(blob);

	if(oldSrc)
		URL.revokeObjectURL(oldSrc);
}


/***/ })
/******/ ]);
//# sourceMappingURL=bundle.main.js.map