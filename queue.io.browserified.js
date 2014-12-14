!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.Queue=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (process){
/* Copyright 2014 Lcf.vs - Released under the MIT license - https://github.com/Lcfvs/queue.io */var Queue=function(e){'use strict';var a='object',b='done',d='error',t,p='prototype',q='events',w=Object.defineProperty,x='EventEmitter',y=Object.create,z='exports';if(t=function(e,t,n){var r,o,i,u,c,f,s;return r=e(q)[x],o=a==typeof t&&t,i='function'==typeof setImmediate&&setImmediate||a==typeof process&&process.nextTick||function(e){setTimeout(e,0)},u=function a(e,t){var n,r,o,u,m;return n=this instanceof a?this:y(a[p]),r=[],o=t||'value',u={done:!1},m=c.bind(r),e.on(o,m),e.once(b,f.bind(e,u,o,m)),e.once(d,n.emit.bind(n,d)),n.iterate=function(t){var c;return c=s(r,o,n,t),u.done?i(r.next):e.once(b,r.next),c},n},u[p]=y(r[p],{constructor:{value:u,writable:!0,configurable:!0}}),u.from=function(e,t){var n,o,i,c,f;for(n=0,o=e.length,i=new r,c=u(i,t);o>n;n+=1)f=e[n],i.emit(t||'value',f);return i.emit(b),c},c=function(e){this.push(e)},f=function(e,t,n){this.removeListener(t,n),e.done=!0},s=function(e,t,n,o){var c,f,s,a;return c=0,f=new r,s=function m(){a||(a=e.slice(0),o===u.PREV&&a.reverse()),i(function(){c>=a.length?f.emit(b,n):f.emit(t,a[c],m,n),c+=1})},e.next=s,f},w(u,'NEXT',{value:{},enumerable:!0}),w(u,'PREV',{value:{},enumerable:!0}),u.noConflict=function(){return n[z]=o,u},u},'function'==typeof define&&a==typeof define.amd)define(t);else if(a==typeof module&&a==typeof module[z])return module[z]=t(require);return t(function(){var t;if(t=e[q]?e[q][x]:e[x],!t)throw new Error('Unable to find '+x);return{EventEmitter:t}})}(this);
}).call(this,require('_process'))
},{"_process":3,"events":2}],2:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.
function EventEmitter(){this._events=this._events||{},this._maxListeners=this._maxListeners||void 0}function isFunction(e){return"function"==typeof e}function isNumber(e){return"number"==typeof e}function isObject(e){return"object"==typeof e&&null!==e}function isUndefined(e){return void 0===e}module.exports=EventEmitter,EventEmitter.EventEmitter=EventEmitter,EventEmitter.prototype._events=void 0,EventEmitter.prototype._maxListeners=void 0,EventEmitter.defaultMaxListeners=10,EventEmitter.prototype.setMaxListeners=function(e){if(!isNumber(e)||0>e||isNaN(e))throw TypeError("n must be a positive number")
return this._maxListeners=e,this},EventEmitter.prototype.emit=function(e){var t,n,s,i,r,o
if(this._events||(this._events={}),"error"===e&&(!this._events.error||isObject(this._events.error)&&!this._events.error.length)){if(t=arguments[1],t instanceof Error)throw t
throw TypeError('Uncaught, unspecified "error" event.')}if(n=this._events[e],isUndefined(n))return!1
if(isFunction(n))switch(arguments.length){case 1:n.call(this)
break
case 2:n.call(this,arguments[1])
break
case 3:n.call(this,arguments[1],arguments[2])
break
default:for(s=arguments.length,i=Array(s-1),r=1;s>r;r++)i[r-1]=arguments[r]
n.apply(this,i)}else if(isObject(n)){for(s=arguments.length,i=Array(s-1),r=1;s>r;r++)i[r-1]=arguments[r]
for(o=n.slice(),s=o.length,r=0;s>r;r++)o[r].apply(this,i)}return!0},EventEmitter.prototype.addListener=function(e,t){var n
if(!isFunction(t))throw TypeError("listener must be a function")
if(this._events||(this._events={}),this._events.newListener&&this.emit("newListener",e,isFunction(t.listener)?t.listener:t),this._events[e]?isObject(this._events[e])?this._events[e].push(t):this._events[e]=[this._events[e],t]:this._events[e]=t,isObject(this._events[e])&&!this._events[e].warned){var n
n=isUndefined(this._maxListeners)?EventEmitter.defaultMaxListeners:this._maxListeners,n&&n>0&&this._events[e].length>n&&(this._events[e].warned=!0,console.error("(node) warning: possible EventEmitter memory leak detected. %d listeners added. Use emitter.setMaxListeners() to increase limit.",this._events[e].length),"function"==typeof console.trace&&console.trace())}return this},EventEmitter.prototype.on=EventEmitter.prototype.addListener,EventEmitter.prototype.once=function(e,t){function n(){this.removeListener(e,n),s||(s=!0,t.apply(this,arguments))}if(!isFunction(t))throw TypeError("listener must be a function")
var s=!1
return n.listener=t,this.on(e,n),this},EventEmitter.prototype.removeListener=function(e,t){var n,s,i,r
if(!isFunction(t))throw TypeError("listener must be a function")
if(!this._events||!this._events[e])return this
if(n=this._events[e],i=n.length,s=-1,n===t||isFunction(n.listener)&&n.listener===t)delete this._events[e],this._events.removeListener&&this.emit("removeListener",e,t)
else if(isObject(n)){for(r=i;r-->0;)if(n[r]===t||n[r].listener&&n[r].listener===t){s=r
break}if(0>s)return this
1===n.length?(n.length=0,delete this._events[e]):n.splice(s,1),this._events.removeListener&&this.emit("removeListener",e,t)}return this},EventEmitter.prototype.removeAllListeners=function(e){var t,n
if(!this._events)return this
if(!this._events.removeListener)return 0===arguments.length?this._events={}:this._events[e]&&delete this._events[e],this
if(0===arguments.length){for(t in this._events)"removeListener"!==t&&this.removeAllListeners(t)
return this.removeAllListeners("removeListener"),this._events={},this}if(n=this._events[e],isFunction(n))this.removeListener(e,n)
else for(;n.length;)this.removeListener(e,n[n.length-1])
return delete this._events[e],this},EventEmitter.prototype.listeners=function(e){var t
return t=this._events&&this._events[e]?isFunction(this._events[e])?[this._events[e]]:this._events[e].slice():[]},EventEmitter.listenerCount=function(e,t){var n
return n=e._events&&e._events[t]?isFunction(e._events[t])?1:e._events[t].length:0}
},{}],3:[function(require,module,exports){
function noop(){}var process=module.exports={}
process.nextTick=function(){var e="undefined"!=typeof window&&window.setImmediate,t="undefined"!=typeof window&&window.MutationObserver,n="undefined"!=typeof window&&window.postMessage&&window.addEventListener
if(e)return function(e){return window.setImmediate(e)}
var s=[]
if(t){var i=document.createElement("div"),r=new MutationObserver(function(){var e=s.slice()
s.length=0,e.forEach(function(e){e()})})
return r.observe(i,{attributes:!0}),function(e){s.length||i.setAttribute("yes","no"),s.push(e)}}return n?(window.addEventListener("message",function(e){var t=e.source
if((t===window||null===t)&&"process-tick"===e.data&&(e.stopPropagation(),s.length>0)){var n=s.shift()
n()}},!0),function(e){s.push(e),window.postMessage("process-tick","*")}):function(e){setTimeout(e,0)}}(),process.title="browser",process.browser=!0,process.env={},process.argv=[],process.on=noop,process.addListener=noop,process.once=noop,process.off=noop,process.removeListener=noop,process.removeAllListeners=noop,process.emit=noop,process.binding=function(){throw Error("process.binding is not supported")},process.cwd=function(){return"/"},process.chdir=function(){throw Error("process.chdir is not supported")}
},{}]},{},[1])(1)
});