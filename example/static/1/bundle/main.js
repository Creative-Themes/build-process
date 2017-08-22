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
/******/ 	// install a JSONP callback for chunk loading
/******/ 	var parentJsonpFunction = window["yourPrefix1"];
/******/ 	window["yourPrefix1"] = function webpackJsonpCallback(chunkIds, moreModules, executeModules) {
/******/ 		// add "moreModules" to the modules object,
/******/ 		// then flag all "chunkIds" as loaded and fire callback
/******/ 		var moduleId, chunkId, i = 0, resolves = [], result;
/******/ 		for(;i < chunkIds.length; i++) {
/******/ 			chunkId = chunkIds[i];
/******/ 			if(installedChunks[chunkId]) {
/******/ 				resolves.push(installedChunks[chunkId][0]);
/******/ 			}
/******/ 			installedChunks[chunkId] = 0;
/******/ 		}
/******/ 		for(moduleId in moreModules) {
/******/ 			if(Object.prototype.hasOwnProperty.call(moreModules, moduleId)) {
/******/ 				modules[moduleId] = moreModules[moduleId];
/******/ 			}
/******/ 		}
/******/ 		if(parentJsonpFunction) parentJsonpFunction(chunkIds, moreModules, executeModules);
/******/ 		while(resolves.length) {
/******/ 			resolves.shift()();
/******/ 		}
/******/
/******/ 	};
/******/
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// objects to store loaded and loading chunks
/******/ 	var installedChunks = {
/******/ 		1: 0
/******/ 	};
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
/******/ 	// This file contains only the entry chunk.
/******/ 	// The chunk loading function for additional chunks
/******/ 	__webpack_require__.e = function requireEnsure(chunkId) {
/******/ 		var installedChunkData = installedChunks[chunkId];
/******/ 		if(installedChunkData === 0) {
/******/ 			return new Promise(function(resolve) { resolve(); });
/******/ 		}
/******/
/******/ 		// a Promise means "currently loading".
/******/ 		if(installedChunkData) {
/******/ 			return installedChunkData[2];
/******/ 		}
/******/
/******/ 		// setup Promise in chunk cache
/******/ 		var promise = new Promise(function(resolve, reject) {
/******/ 			installedChunkData = installedChunks[chunkId] = [resolve, reject];
/******/ 		});
/******/ 		installedChunkData[2] = promise;
/******/
/******/ 		// start chunk loading
/******/ 		var head = document.getElementsByTagName('head')[0];
/******/ 		var script = document.createElement('script');
/******/ 		script.type = 'text/javascript';
/******/ 		script.charset = 'utf-8';
/******/ 		script.async = true;
/******/ 		script.timeout = 120000;
/******/
/******/ 		if (__webpack_require__.nc) {
/******/ 			script.setAttribute("nonce", __webpack_require__.nc);
/******/ 		}
/******/ 		script.src = __webpack_require__.p + "" + chunkId + ".js";
/******/ 		var timeout = setTimeout(onScriptComplete, 120000);
/******/ 		script.onerror = script.onload = onScriptComplete;
/******/ 		function onScriptComplete() {
/******/ 			// avoid mem leaks in IE.
/******/ 			script.onerror = script.onload = null;
/******/ 			clearTimeout(timeout);
/******/ 			var chunk = installedChunks[chunkId];
/******/ 			if(chunk !== 0) {
/******/ 				if(chunk) {
/******/ 					chunk[1](new Error('Loading chunk ' + chunkId + ' failed.'));
/******/ 				}
/******/ 				installedChunks[chunkId] = undefined;
/******/ 			}
/******/ 		};
/******/ 		head.appendChild(script);
/******/
/******/ 		return promise;
/******/ 	};
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
/******/ 	// on error function for async loading
/******/ 	__webpack_require__.oe = function(err) { console.error(err); throw err; };
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

function handler() {
	__webpack_require__.e/* import() */(0).then(__webpack_require__.bind(null, 1)).then(function () {
		return doStuff();
	});
}

function doStuff() {}

/***/ })
/******/ ]);
//# sourceMappingURL=main.js.map